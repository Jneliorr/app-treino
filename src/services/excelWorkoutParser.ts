import * as XLSX from 'xlsx';
import { Routine, RoutineExercise } from '../types';

export interface ParseResult {
  routines: Routine[];
  aerobics?: {
    postWorkoutMin: number;
    restDayMin: number;
  };
  detectedModel: 'vertical' | 'grid' | 'multi_sheet' | 'standard';
  notes: string[];
}

/**
 * Normaliza e identifica técnicas avançadas da Consultoria Leandro Twin
 */
export function detectAdvancedTechnique(text?: string): { id?: string; notes?: string } {
  if (!text) return {};
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  if (lower.includes('fst-7') || lower.includes('fst 7') || lower.includes('fst7')) {
    return { id: 'fst-7', notes: cleaned || 'FST-7' };
  }
  if (lower.includes('rest') && (lower.includes('pause') || lower.includes('n'))) {
    return { id: 'rest-pause', notes: cleaned || "Rest 'n' Pause" };
  }
  if (lower.includes('gvt') || lower.includes('german volume')) {
    return { id: 'gvt', notes: cleaned || 'GVT (10x8)' };
  }
  if (lower.includes('sst') || lower.includes('sarcoplasma')) {
    return { id: 'sst', notes: cleaned || 'SST' };
  }
  if (lower.includes('gironda')) {
    return { id: 'gironda', notes: cleaned || 'Gironda (8xF)' };
  }
  if (lower.includes('strip') || lower.includes('stripset') || lower.includes('strip-set')) {
    return { id: 'strip-set', notes: cleaned || 'Strip-Set 3x' };
  }
  if (lower.includes('drop') || lower.includes('dropset') || lower.includes('drop-set')) {
    return { id: 'drop-set', notes: cleaned || 'Drop-Set' };
  }
  if (lower.includes('ponto zero')) {
    return { id: 'ponto-zero', notes: cleaned || 'Ponto Zero' };
  }
  if (lower.includes('cluster')) {
    return { id: 'cluster', notes: cleaned || 'Cluster-Set' };
  }
  if (cleaned.length > 0 && !lower.includes('kg') && !/^\d+$/.test(cleaned)) {
    return { notes: cleaned };
  }
  return {};
}

/**
 * Verifica se um texto é um cabeçalho descartável de tabela
 */
function isIgnoredText(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (!t) return true;
  if (
    t.includes('qualquer dúvida') ||
    t.includes('clique aqui') ||
    t.includes('exercício') ||
    t.includes('exercicio') ||
    t.includes('consultoria twin') ||
    t === 'sxr' ||
    t === 'peso' ||
    t === 'técnica avançada' ||
    t === 'tecnica avancada' ||
    t === 'treino de hipertrofia'
  ) {
    return true;
  }
  return false;
}

/**
 * Extrai dados de aeróbicos se presentes na planilha
 */
function extractAerobics(grid: any[][]): { postWorkoutMin: number; restDayMin: number } | undefined {
  let postWorkoutMin = 10;
  let restDayMin = 30;
  let found = false;

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || '').trim().toLowerCase();
      if (cell.includes('aeróbico') || cell.includes('aerobico')) {
        found = true;
      }
      if (cell.includes('pós-treino') || cell.includes('pos-treino') || cell.includes('pos treino')) {
        // Procura valor na célula da direita ou linha abaixo
        const nextVal = String(row[c + 1] || grid[r + 1]?.[c] || '');
        const match = nextVal.match(/(\d+)/);
        if (match) {
          postWorkoutMin = parseInt(match[1], 10);
          found = true;
        }
      }
      if (cell.includes('dias sem treino') || cell.includes('dia sem treino') || cell.includes('sem treino')) {
        const nextVal = String(row[c + 1] || grid[r + 1]?.[c] || '');
        const match = nextVal.match(/(\d+)/);
        if (match) {
          restDayMin = parseInt(match[1], 10);
          found = true;
        }
      }
    }
  }

  return found ? { postWorkoutMin, restDayMin } : undefined;
}

/**
 * Parser Principal: lê arquivos Excel (.xlsx / .xls) com suporte completo aos modelos da Consultoria Twin:
 * 1. Modelo Vertical (Tabelas empilhadas de Treino A ao F)
 * 2. Modelo Grade (Treinos lado a lado em colunas paralelas e linhas de grade)
 * 3. Modelo Multi-Sheet (Uma aba por treino)
 */
export function parseWorkoutWorkbook(workbook: XLSX.WorkBook): ParseResult {
  const routinesMap = new Map<string, Routine>();
  const notes: string[] = [];
  let globalAerobics: { postWorkoutMin: number; restDayMin: number } | undefined;
  let detectedModel: 'vertical' | 'grid' | 'multi_sheet' | 'standard' = 'standard';

  // Analisa cada aba da planilha
  for (let sIdx = 0; sIdx < workbook.SheetNames.length; sIdx++) {
    const sheetName = workbook.SheetNames[sIdx];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const grid = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
    if (!grid || grid.length === 0) continue;

    const sheetAerobics = extractAerobics(grid);
    if (sheetAerobics && !globalAerobics) {
      globalAerobics = sheetAerobics;
    }

    // 1. Procurar por células que contêm "Treino [A-Z0-9]"
    interface WorkoutHeaderLoc {
      row: number;
      col: number;
      code: string;
      muscles: string;
      raw: string;
    }
    const headers: WorkoutHeaderLoc[] = [];

    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      if (!Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').trim();
        if (!cell) continue;

        const match = cell.match(/Treino\s*([A-Za-z0-9]+)\s*[:\-–]?\s*(.*)/i);
        if (match) {
          const code = match[1].toUpperCase();
          let muscles = match[2]?.trim() || '';

          // Se a célula adjacente contiver os músculos
          if (!muscles && row[c + 1] && typeof row[c + 1] === 'string') {
            const nextCell = String(row[c + 1]).trim();
            if (!nextCell.toLowerCase().includes('exercício') && !nextCell.match(/^\d+x/i)) {
              muscles = nextCell;
            }
          }

          headers.push({
            row: r,
            col: c,
            code,
            muscles,
            raw: cell,
          });
        }
      }
    }

    // Se encontramos múltiplos cabeçalhos na mesma aba
    if (headers.length > 0) {
      // Determina se é Modelo Grade (múltiplas colunas na mesma linha) ou Vertical
      const uniqueCols = new Set(headers.map((h) => h.col));
      const isGrid = uniqueCols.size > 1;
      detectedModel = isGrid ? 'grid' : 'vertical';

      // Ordena por linha e depois por coluna (ou código)
      headers.sort((a, b) => {
        if (a.row === b.row) return a.col - b.col;
        return a.row - b.row;
      });

      headers.forEach((header, hIdx) => {
        // Encontra limite de colunas para este treino
        let colEnd = header.col + 4; // padrão 4 colunas (Exercício, SxR, Peso, Técnica)
        const sameRowNextHeader = headers.find(
          (other, oIdx) => oIdx > hIdx && other.row === header.row && other.col > header.col
        );
        if (sameRowNextHeader) {
          colEnd = sameRowNextHeader.col - 1;
        }

        // Encontra limite de linhas para este treino
        let rowEnd = grid.length - 1;
        const nextHeaderSameCol = headers.find(
          (other, oIdx) => oIdx > hIdx && other.col === header.col && other.row > header.row
        );
        if (nextHeaderSameCol) {
          rowEnd = nextHeaderSameCol.row - 1;
        }

        const exercises: RoutineExercise[] = [];
        let restIntervalText = '1 a 2 minutos';
        let restIntervalSeconds = 90;
        let exerciseOrder = 1;

        for (let r = header.row + 1; r <= rowEnd; r++) {
          const row = grid[r];
          if (!Array.isArray(row)) continue;

          // Checar se nesta linha há menção de intervalo de descanso
          for (let c = header.col; c <= colEnd && c < row.length; c++) {
            const cell = String(row[c] || '').trim();
            if (cell.toLowerCase().includes('intervalo')) {
              restIntervalText = cell.replace(/intervalo entre séries e exercícios:?/i, '').trim() || cell;
              const matchSec = restIntervalText.match(/(\d+)\s*a\s*(\d+)\s*min/i);
              if (matchSec) {
                restIntervalSeconds = 90; // Média 1.5 min
              }
              break;
            }
          }

          // Procurar célula que corresponda a Séries x Repetições (SxR)
          let sxrCol = -1;
          let sxrValue = '';
          for (let c = header.col; c <= colEnd && c < row.length; c++) {
            const cell = String(row[c] || '').trim();
            if (cell.match(/\b(\d+)\s*[xX]\s*([0-9]+|F|falha)\b/i)) {
              sxrCol = c;
              sxrValue = cell;
              break;
            }
          }

          if (sxrCol !== -1) {
            // Nome do exercício: célula à esquerda do SxR (dentro da área deste treino)
            let exerciseName = '';
            for (let c = sxrCol - 1; c >= header.col; c--) {
              const cell = String(row[c] || '').trim();
              if (cell && !isIgnoredText(cell)) {
                exerciseName = cell;
                break;
              }
            }

            // Fallback: se não encontrou à esquerda, verifica a primeira coluna da área do treino
            if (!exerciseName) {
              const firstCell = String(row[header.col] || '').trim();
              if (firstCell && !isIgnoredText(firstCell)) {
                exerciseName = firstCell;
              }
            }

            if (exerciseName && !isIgnoredText(exerciseName)) {
              // Extrair técnica avançada: células à direita do SxR
              let techniqueNotes = '';
              for (let c = sxrCol + 1; c <= colEnd && c < row.length; c++) {
                const cell = String(row[c] || '').trim();
                if (cell && !isIgnoredText(cell) && !cell.match(/^\d+(\s*kg)?$/i)) {
                  techniqueNotes = cell;
                  break;
                }
              }

              // Calcular sets e reps
              let sets = 4;
              let reps = '8';
              const sxrMatch = sxrValue.match(/(\d+)\s*[xX]\s*([0-9]+|F|falha)/i);
              if (sxrMatch) {
                sets = parseInt(sxrMatch[1], 10) || 4;
                reps = sxrMatch[2].toUpperCase();
              }

              const techInfo = detectAdvancedTechnique(techniqueNotes);

              exercises.push({
                id: `ex-${header.code.toLowerCase()}-${exerciseOrder}`,
                name: exerciseName,
                sets,
                reps,
                advancedTechniqueId: techInfo.id,
                advancedTechniqueNotes: techInfo.notes || techniqueNotes || undefined,
                order: exerciseOrder++,
                defaultRestSeconds: restIntervalSeconds,
              });
            }
          }
        }

        if (exercises.length > 0) {
          const routineId = `routine-${header.code.toLowerCase()}`;
          const existing = routinesMap.get(routineId);
          if (!existing || existing.exercises.length < exercises.length) {
            routinesMap.set(routineId, {
              id: routineId,
              code: header.code,
              name: `Treino ${header.code}`,
              targetMuscles: header.muscles || `Músculos do Treino ${header.code}`,
              dayOrder: routinesMap.size + 1,
              restIntervalText,
              restIntervalSeconds,
              aerobics: globalAerobics,
              exercises,
            });
          }
        }
      });
    } else {
      // 2. Fallback: Abas individuais ("Treino A", "Treino B", etc.)
      const sheetCodeMatch = sheetName.match(/treino\s*([A-Za-z0-9]+)/i);
      if (sheetCodeMatch) {
        detectedModel = 'multi_sheet';
        const code = sheetCodeMatch[1].toUpperCase();
        const exercises: RoutineExercise[] = [];
        let exerciseOrder = 1;

        grid.forEach((row) => {
          if (!Array.isArray(row) || row.length === 0) return;

          let sxrCol = -1;
          let sxrValue = '';
          for (let c = 0; c < row.length; c++) {
            const cell = String(row[c] || '').trim();
            if (cell.match(/\b(\d+)\s*[xX]\s*([0-9]+|F|falha)\b/i)) {
              sxrCol = c;
              sxrValue = cell;
              break;
            }
          }

          if (sxrCol !== -1) {
            let name = '';
            for (let c = sxrCol - 1; c >= 0; c--) {
              const cell = String(row[c] || '').trim();
              if (cell && !isIgnoredText(cell)) {
                name = cell;
                break;
              }
            }

            if (name) {
              let tech = '';
              for (let c = sxrCol + 1; c < row.length; c++) {
                const cell = String(row[c] || '').trim();
                if (cell && !isIgnoredText(cell) && !cell.match(/^\d+(\s*kg)?$/i)) {
                  tech = cell;
                  break;
                }
              }

              let sets = 4;
              let reps = '8';
              const sxrMatch = sxrValue.match(/(\d+)\s*[xX]\s*([0-9]+|F|falha)/i);
              if (sxrMatch) {
                sets = parseInt(sxrMatch[1], 10) || 4;
                reps = sxrMatch[2].toUpperCase();
              }

              const techInfo = detectAdvancedTechnique(tech);

              exercises.push({
                id: `ex-${code.toLowerCase()}-${exerciseOrder}`,
                name,
                sets,
                reps,
                advancedTechniqueId: techInfo.id,
                advancedTechniqueNotes: techInfo.notes || tech || undefined,
                order: exerciseOrder++,
                defaultRestSeconds: 90,
              });
            }
          }
        });

        if (exercises.length > 0) {
          const routineId = `routine-${code.toLowerCase()}`;
          routinesMap.set(routineId, {
            id: routineId,
            code,
            name: `Treino ${code}`,
            targetMuscles: `Treino da aba ${sheetName}`,
            dayOrder: routinesMap.size + 1,
            restIntervalText: '1 a 2 minutos',
            restIntervalSeconds: 90,
            aerobics: globalAerobics,
            exercises,
          });
        }
      }
    }
  }

  // Ordena os treinos por código (A, B, C, D, E, F...)
  const sortedRoutines = Array.from(routinesMap.values()).sort((a, b) => {
    return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Atualiza dayOrder sequencialmente
  sortedRoutines.forEach((r, idx) => {
    r.dayOrder = idx + 1;
  });

  return {
    routines: sortedRoutines,
    aerobics: globalAerobics,
    detectedModel,
    notes,
  };
}

/**
 * Gera um arquivo Excel (.xlsx) completo com os 2 modelos reconhecidos pela aplicação:
 * Aba 1: Modelo Vertical (empilhado)
 * Aba 2: Modelo Grade (lado a lado)
 */
export function generateConsultoriaTwinExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Dados reais dos treinos para preencher os modelos
  const workoutsData = [
    {
      title: 'Treino A: Tríceps, Panturrilha, Abdômen',
      interval: 'Intervalo entre séries e exercícios: 1 a 2 minutos',
      exercises: [
        ['Rosca Francesa Cross Corda', '4x8', '', ''],
        ['Rosca Testa Halteres Peg Neutra', '7x8', '', 'FST-7'],
        ['Gêmeos Em Pé Smith', '4x8', '', ''],
        ['Gêmeos Sentado Máquina', '4x8', '', "Rest 'n' Pause 3x"],
        ['Gêmeos Em Pé Hack', '4x8', '', ''],
        ['Prancha', '8xF', '', 'Gironda'],
      ],
    },
    {
      title: 'Treino B: Dorsal, Bíceps',
      interval: 'Intervalo entre séries e exercícios: 1 a 2 minutos',
      exercises: [
        ['Levantamento Terra', '4x8', '', ''],
        ['Pull-Down Cross Corda', '4x8', '', ''],
        ['Remada Cross Peg Pronada', '10x8', '', 'GVT'],
        ['Rosca Direta Halteres', '4x8', '', ''],
        ['Rosca Simultânea Halteres', '4x8', '', ''],
        ['Rosca Direta Cross', '2x8', '', 'SST'],
      ],
    },
    {
      title: 'Treino C: Coxa, Glúteo',
      interval: 'Intervalo entre séries e exercícios: 1 a 2 minutos',
      exercises: [
        ['Leg Press', '4x8', '', ''],
        ['Stiff Barra', '4x8', '', ''],
        ['Cadeira Extensora', '4x8', '', ''],
        ['Cadeira Adutora', '4x8', '', ''],
        ['Cadeira Abdutora', '10x8', '', 'GVT'],
      ],
    },
    {
      title: 'Treino D: Peitoral, Abdômen',
      interval: 'Intervalo entre séries e exercícios: 1 a 2 minutos',
      exercises: [
        ['Supino Inclinado Halteres', '2x8', '', 'SST'],
        ['Cross-Over Polia Alta', '4x8', '', ''],
        ['Supino Reto Smith', '4x8', '', ''],
        ['Supino Inclinado Barra', '4x8', '', ''],
        ['Extensão Lombar', '4x8', '', ''],
        ['Prancha', '4xF', '', ''],
      ],
    },
    {
      title: 'Treino E: Dorsal, Trapézio',
      interval: 'Intervalo entre séries e exercícios: 1 a 2 minutos',
      exercises: [
        ['Pull-Down Cross Corda', '4x8', '', ''],
        ['Remada Máquina Peg Supinada', '4x8', '', ''],
        ['Remada Cross Peg Pronada', '4x8', '', "Rest 'n' Pause 3x"],
        ['Puxada Vertical Com Triângulo', '4x8', '', ''],
        ['Encolhimento Smith Posterior', '4x8', '', ''],
        ['Remada Alta Cross', '4x8', '', ''],
        ['Encolhimento Smith Anterior', '4x8', '', "Rest 'n' Pause 3x"],
      ],
    },
    {
      title: 'Treino F: Deltóide, Antebraço',
      interval: 'Intervalo entre séries e exercícios: 1 a 2 minutos',
      exercises: [
        ['Desenvolvimento Smith', '4x8', '', ''],
        ['Crucifixo Inverso Cross', '4x8', '', ''],
        ['Elevação Lateral Unilateral Banco Inclinado', '4x8', '', ''],
        ['Elevação Frontal Barra Peg Pronada', '4x8', '', "Rest 'n' Pause 3x"],
        ['Rosca Inversa Cross', '10x8', '', 'GVT'],
        ['Extensão de Punho Cross', '2x8', '', ''],
      ],
    },
  ];

  // ==========================================
  // ABA 1: MODELO 1 - VERTICAL (EMPILHADO)
  // ==========================================
  const verticalRows: any[][] = [];
  verticalRows.push(['CONSULTORIA TWIN - TREINO DE HIPERTROFIA']);
  verticalRows.push([]);

  workoutsData.forEach((workout) => {
    verticalRows.push([workout.title]);
    verticalRows.push(['Exercícios (qualquer dúvida, clique aqui)', 'SxR', 'Peso', 'Técnica Avançada']);
    workout.exercises.forEach((ex) => {
      verticalRows.push([ex[0], ex[1], ex[2], ex[3]]);
    });
    verticalRows.push([workout.interval]);
    verticalRows.push([]); // linha em branco entre treinos
  });

  // Seção Aeróbicos no final
  verticalRows.push(['Aeróbicos']);
  verticalRows.push(['Pós-treino', '10min']);
  verticalRows.push(['Dias sem treino', '30min']);

  const wsVertical = XLSX.utils.aoa_to_sheet(verticalRows);
  XLSX.utils.book_append_sheet(wb, wsVertical, 'Modelo 1 - Vertical');

  // ==========================================
  // ABA 2: MODELO 2 - GRADE (LADO A LADO)
  // ==========================================
  // Linha superior: Treinos A, B, C lado a lado + Aeróbicos
  // Linha inferior: Treinos D, E, F lado a lado
  const gridRows: any[][] = [];
  gridRows.push(['CONSULTORIA TWIN - TREINO DE HIPERTROFIA', '', '', '', '', '', '', '', '', '', '', '', '']);
  gridRows.push([]);

  // Bloco 1: Treinos A, B, C e Aeróbicos lado a lado
  gridRows.push([
    workoutsData[0].title, '', '', '',
    workoutsData[1].title, '', '', '',
    workoutsData[2].title, '', '', '',
    'Aeróbicos',
  ]);

  gridRows.push([
    'Exercícios', 'SxR', 'Peso', 'Técnica Avançada',
    'Exercícios', 'SxR', 'Peso', 'Técnica Avançada',
    'Exercícios', 'SxR', 'Peso', 'Técnica Avançada',
    'Pós-treino', '10min',
  ]);

  const maxRowBlock1 = Math.max(
    workoutsData[0].exercises.length,
    workoutsData[1].exercises.length,
    workoutsData[2].exercises.length
  );

  for (let i = 0; i < maxRowBlock1; i++) {
    const exA = workoutsData[0].exercises[i] || ['', '', '', ''];
    const exB = workoutsData[1].exercises[i] || ['', '', '', ''];
    const exC = workoutsData[2].exercises[i] || ['', '', '', ''];
    const extraCol = i === 0 ? ['Dias sem treino', '30min'] : ['', ''];

    gridRows.push([
      exA[0], exA[1], exA[2], exA[3],
      exB[0], exB[1], exB[2], exB[3],
      exC[0], exC[1], exC[2], exC[3],
      extraCol[0], extraCol[1],
    ]);
  }

  gridRows.push([
    workoutsData[0].interval, '', '', '',
    workoutsData[1].interval, '', '', '',
    workoutsData[2].interval, '', '', '',
  ]);
  gridRows.push([]); // Espaçador

  // Bloco 2: Treinos D, E, F lado a lado
  gridRows.push([
    workoutsData[3].title, '', '', '',
    workoutsData[4].title, '', '', '',
    workoutsData[5].title, '', '', '',
  ]);

  gridRows.push([
    'Exercícios', 'SxR', 'Peso', 'Técnica Avançada',
    'Exercícios', 'SxR', 'Peso', 'Técnica Avançada',
    'Exercícios', 'SxR', 'Peso', 'Técnica Avançada',
  ]);

  const maxRowBlock2 = Math.max(
    workoutsData[3].exercises.length,
    workoutsData[4].exercises.length,
    workoutsData[5].exercises.length
  );

  for (let i = 0; i < maxRowBlock2; i++) {
    const exD = workoutsData[3].exercises[i] || ['', '', '', ''];
    const exE = workoutsData[4].exercises[i] || ['', '', '', ''];
    const exF = workoutsData[5].exercises[i] || ['', '', '', ''];

    gridRows.push([
      exD[0], exD[1], exD[2], exD[3],
      exE[0], exE[1], exE[2], exE[3],
      exF[0], exF[1], exF[2], exF[3],
    ]);
  }

  gridRows.push([
    workoutsData[3].interval, '', '', '',
    workoutsData[4].interval, '', '', '',
    workoutsData[5].interval, '', '', '',
  ]);

  const wsGrid = XLSX.utils.aoa_to_sheet(gridRows);
  XLSX.utils.book_append_sheet(wb, wsGrid, 'Modelo 2 - Grade');

  // Faz o download no navegador
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Ficha_Treino_Modelo_Consultoria_Twin.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
