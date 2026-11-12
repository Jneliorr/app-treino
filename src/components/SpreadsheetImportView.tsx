import React, { useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Download,
  FileText,
  AlertCircle,
  HelpCircle,
  Layers,
  Plus,
  Calendar,
  Copy,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Routine, RoutineExercise } from '../types';
import { parseWorkoutBackup, type WorkoutBackup } from '../services/workoutBackup';
import {
  parseWorkoutWorkbook,
  generateConsultoriaTwinExcelTemplate,
  detectAdvancedTechnique,
  parseSetPrescription,
} from '../services/excelWorkoutParser';
import {
  loadRoutines,
  resetToTwinRoutines,
  loadWorkoutLogs,
  loadWeeks,
  createNewWeek,
  updateWeekRoutines,
  loadActiveWeekId,
  previewWorkoutRestore,
  restoreWorkoutBackup,
  getActiveProfileId,
  loadAthleteProfiles,
} from '../services/storage';

interface Props {
  onRoutinesUpdated: (routines: Routine[]) => void;
  onWeekCreated?: (weekId: string) => void;
  onBackupRestored: () => void;
}

export const SpreadsheetImportView: React.FC<Props> = ({ onRoutinesUpdated, onWeekCreated, onBackupRestored }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewRoutines, setPreviewRoutines] = useState<Routine[] | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'new_week' | 'excel' | 'paste' | 'export'>('excel');
  const [guideModelTab, setGuideModelTab] = useState<'vertical' | 'grid'>('vertical');
  const [backup, setBackup] = useState<WorkoutBackup | null>(null);
  const readRequest = useRef(0);

  const resetPreview = () => {
    readRequest.current += 1;
    setPreviewRoutines(null);
    setBackup(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const openTab = (tab: typeof activeTab) => {
    resetPreview();
    setActiveTab(tab);
  };

  // Modo de destino da importação
  const [importDestination, setImportDestination] = useState<'new_week' | 'replace'>('new_week');
  const [newWeekName, setNewWeekName] = useState<string>(() => {
    const weeks = loadWeeks();
    return `Semana ${Math.max(0, ...weeks.map((week) => week.number)) + 1}`;
  });
  const [newWeekType, setNewWeekType] = useState<'copy' | 'twin'>('copy');
  const [selectedSourceWeekId, setSelectedSourceWeekId] = useState<string>(() => {
    const weeks = loadWeeks();
    return weeks.length > 0 ? weeks[weeks.length - 1].id : '';
  });

  // 1-Click Restore Twin routines
  const handleRestoreTwin = () => {
    if (!window.confirm('Substituir a ficha da semana atual pelo modelo Consultoria Twin? Os rascunhos da ficha atual deixarão de aparecer.')) return;
    resetPreview();
    try {
      onRoutinesUpdated(resetToTwinRoutines());
      setSuccessMessage('Ficha da semana atual substituída pelo modelo Consultoria Twin.');
    } catch {
      setErrorMessage('Não foi possível atualizar a ficha da semana atual.');
    }
  };

  // Parse Excel File (.xlsx, .xls, .csv)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    resetPreview();
    const request = readRequest.current;

    try {
      const data = await file.arrayBuffer();
      if (request !== readRequest.current) return;
      const result = parseWorkoutWorkbook(XLSX.read(data, { type: 'array' }));
      if (!result.routines.length) {
        setErrorMessage(
          'Não foi possível encontrar treinos válidos na planilha. Use títulos como "Treino A: Músculos" e colunas com "Exercícios" e "SxR" (ex: 4x8, 3x8-12 ou 8xF). Baixe a planilha modelo para conferir o formato.'
        );
        return;
      }
      const modelName = {
        grid: 'Grade',
        vertical: 'Vertical',
        multi_sheet: 'Abas individuais',
        standard: 'Padrão',
      }[result.detectedModel];
      const cardioInfo = result.aerobics
        ? ` | Aeróbicos: ${result.aerobics.postWorkoutMin} min pós-treino e ${result.aerobics.restDayMin} min sem treino`
        : '';
      setPreviewRoutines(result.routines);
      setSuccessMessage(
        `${result.routines.length} treinos identificados (${modelName}${cardioInfo}). Confira a pré-visualização e confirme a importação.`
      );
    } catch {
      if (request === readRequest.current) setErrorMessage('Não foi possível ler o arquivo. Verifique o formato da planilha.');
    }
  };

  // Text Parser
  const handleParseText = () => {
    resetPreview();
    if (!pasteText.trim()) return;

    try {
      const lines = pasteText.split('\n').map((l) => l.trim()).filter(Boolean);
      const exercises: RoutineExercise[] = [];
      let currentOrder = 1;

      lines.forEach((line) => {
        // Tabulação, ponto e vírgula ou barra vertical.
        const parts = line.split(/\t|;|\|/).map((p) => p.trim());
        if (parts.length === 0 || !parts[0]) return;

        const name = parts[0];
        if (
          /^exerc[ií]cios?(?:$|\s*\()/i.test(name) ||
          name.toLowerCase().includes('consultoria') ||
          name.toLowerCase().includes('clique aqui')
        ) {
          return;
        }

        const sxr = parts[1] || '4x8';
        const technique = parts[2] || '';

        const prescription = parseSetPrescription(sxr);
        if (!prescription) throw new Error(`Séries e repetições inválidas para "${name}": ${sxr}.`);

        const techInfo = detectAdvancedTechnique(technique);

        exercises.push({
          id: `paste-ex-${currentOrder}`,
          name,
          ...prescription,
          advancedTechniqueId: techInfo.id,
          advancedTechniqueNotes: techInfo.notes || technique || undefined,
          order: currentOrder++,
        });
      });

      if (exercises.length > 0) {
        const newRoutine: Routine = {
          id: `custom-routine-${Date.now()}`,
          code: 'Custom',
          name: 'Treino Importado',
          targetMuscles: 'Personalizado',
          dayOrder: 1,
          restIntervalText: '1 a 2 minutos',
          restIntervalSeconds: 90,
          exercises,
        };
        setPreviewRoutines([newRoutine]);
        setSuccessMessage(`${exercises.length} exercícios identificados do texto copiado.`);
      } else {
        setErrorMessage('Nenhum exercício identificado no texto colado.');
      }
    } catch (err: any) {
      setErrorMessage('Erro ao processar texto: ' + err.message);
    }
  };

  // Commit preview to storage
  const handleConfirmImport = () => {
    if (!previewRoutines) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (importDestination === 'new_week') {
        const createdWeek = createNewWeek(newWeekName, undefined, previewRoutines);
        onRoutinesUpdated(createdWeek.routines);
        onWeekCreated?.(createdWeek.id);
      } else {
        if (!window.confirm('Substituir os treinos da semana atual? Os rascunhos da ficha atual deixarão de aparecer.')) return;
        onRoutinesUpdated(updateWeekRoutines(loadActiveWeekId(), previewRoutines));
        setSuccessMessage('Treinos da semana atual atualizados com sucesso!');
      }
      setPreviewRoutines(null);
    } catch {
      setErrorMessage('Não foi possível salvar a ficha neste navegador. Verifique o armazenamento e tente novamente.');
    }
  };

  // Criar nova semana diretamente pela aba Fichas
  const handleCreateNewWeekDirect = () => {
    resetPreview();
    try {
      const createdWeek = createNewWeek(newWeekName, newWeekType === 'copy' ? selectedSourceWeekId : undefined);
      onRoutinesUpdated(createdWeek.routines);
      onWeekCreated?.(createdWeek.id);
    } catch {
      setErrorMessage('Não foi possível criar a semana neste navegador. Verifique o armazenamento e tente novamente.');
    }
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const data = {
      version: 2,
      weeks: loadWeeks(),
      activeWeekId: loadActiveWeekId(),
      routines: loadRoutines(),
      logs: loadWorkoutLogs(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_treinos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    resetPreview();
    const request = readRequest.current;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('O backup deve ter até 10 MB.');
      const parsed = parseWorkoutBackup(await file.text());
      if (request === readRequest.current) setBackup(parsed);
    } catch (error) {
      if (request === readRequest.current) {
        setErrorMessage(error instanceof SyntaxError ? 'O arquivo não contém um JSON válido.' :
          error instanceof Error ? error.message : 'Não foi possível ler o backup.');
      }
    }
  };

  const handleRestoreBackup = () => {
    if (!backup) return;
    try {
      const { addedWeeks, addedLogs } = restoreWorkoutBackup(backup);
      setBackup(null);
      setErrorMessage(null);
      setSuccessMessage(`Restauração concluída. Semanas adicionadas: ${addedWeeks}. Sessões adicionadas: ${addedLogs}.`);
      onBackupRestored();
    } catch {
      setErrorMessage('Não foi possível gravar o backup neste navegador. Verifique o espaço disponível.');
    }
  };

  const restorePreview = backup ? previewWorkoutRestore(backup) : null;
  const athleteName = loadAthleteProfiles().find((profile) => profile.id === getActiveProfileId())?.name ?? 'Atleta';

  return (
    <div id="spreadsheet-import-container" className="space-y-4 pb-20 text-[#E8F4F8]">
      {/* Header Banner */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/25">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#E8F4F8]">
              Importação da Planilha do Personal
            </h2>
            <p className="text-xs text-[#8FAFBD]">
              Popule o aplicativo com seus treinos divididos (A, B, C...) em poucos segundos
            </p>
          </div>
        </div>

        {/* 1-Click Twin Consultoria Quick Seed & Nova Semana */}
        <div className="mt-4 p-3 rounded-xl bg-[#FFAA00]/10 border border-[#FFAA00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-[#E8F4F8]">
            <strong className="block text-[#FFAA00] font-bold text-sm">
              Ficha Modelo do Anexo (Consultoria Twin)
            </strong>
            Já vem pré-carregada com todos os 6 treinos (A a F), exercícios, repetições, FST-7, Gironda, Rest-Pause e SST.
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="restore-twin-btn"
              onClick={handleRestoreTwin}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#8FAFBD] hover:text-[#FFAA00] font-bold text-xs transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recarregar Twin</span>
            </button>
            <button
              id="new-week-quick-btn"
              onClick={() => openTab('new_week')}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-black text-xs transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Nova Semana</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#082F52] border border-[#14527A] text-xs">
        <button
          onClick={() => openTab('new_week')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'new_week'
              ? 'bg-[#FFAA00] text-[#031F38]'
              : 'text-[#8FAFBD] hover:text-[#E8F4F8]'
          }`}
        >
          + Semana
        </button>
        <button
          onClick={() => openTab('excel')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'excel'
              ? 'bg-[#FFAA00] text-[#031F38]'
              : 'text-[#8FAFBD] hover:text-[#E8F4F8]'
          }`}
        >
          Excel (.xlsx)
        </button>
        <button
          onClick={() => openTab('paste')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'paste'
              ? 'bg-[#FFAA00] text-[#031F38]'
              : 'text-[#8FAFBD] hover:text-[#E8F4F8]'
          }`}
        >
          Colar texto
        </button>
        <button
          onClick={() => openTab('export')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'export' ? 'bg-[#FFAA00] text-[#031F38]' : 'text-[#8FAFBD] hover:text-[#E8F4F8]'
          }`}
        >
          Backup
        </button>
      </div>

      {/* Feedback messages */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-[#00C98B]/15 border border-[#00C98B]/35 text-[#00C98B] text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#00C98B]" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/35 text-[#FF5C5C] text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#FF5C5C]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB: Nova Semana */}
      {activeTab === 'new_week' && (
        <div className="bg-[#082F52] border border-[#14527A] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-[#E8F4F8] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FFAA00]" />
              <span>Adicionar Nova Semana de Treino</span>
            </h3>
            <p className="text-xs text-[#8FAFBD] mt-0.5">
              Crie uma nova semana para periodizar seu treino, acompanhar progressão de cargas ou importar uma nova planilha.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#8FAFBD] mb-1">
                Nome da Semana:
              </label>
              <input
                type="text"
                value={newWeekName}
                onChange={(e) => setNewWeekName(e.target.value)}
                placeholder="Ex: Semana 2, Semana 3..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#031F38] border border-[#14527A] text-[#E8F4F8] text-sm focus:outline-none focus:border-[#FFAA00] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#8FAFBD]">
                Como deseja iniciar esta semana?
              </label>

              {/* Opção 1: Duplicar Semana */}
              <label
                onClick={() => setNewWeekType('copy')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  newWeekType === 'copy'
                    ? 'bg-[#0B3A61] border-[#FFAA00] shadow-sm'
                    : 'bg-[#031F38] border-[#14527A] hover:bg-[#0B3A61]/50'
                }`}
              >
                <input
                  type="radio"
                  name="new_week_type"
                  checked={newWeekType === 'copy'}
                  onChange={() => setNewWeekType('copy')}
                  className="mt-1 text-[#FFAA00] focus:ring-[#FFAA00]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-[#FFAA00]" />
                    <strong className="text-xs text-[#E8F4F8]">
                      Duplicar treinos da semana anterior (Recomendado)
                    </strong>
                  </div>
                  <p className="text-[11px] text-[#8FAFBD] mt-0.5">
                    Mantém a mesma divisão de treinos (A a F) para você bater suas cargas e registrar a evolução semana a semana.
                  </p>

                  {newWeekType === 'copy' && (
                    <div className="mt-2.5">
                      <label className="block text-[10px] uppercase font-bold text-[#8FAFBD] mb-1">
                        Copiar treinos de:
                      </label>
                      <select
                        value={selectedSourceWeekId}
                        onChange={(e) => setSelectedSourceWeekId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#082F52] border border-[#14527A] text-xs text-[#E8F4F8] focus:outline-none focus:border-[#FFAA00]"
                      >
                        {loadWeeks().map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.routines.length} treinos)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </label>

              {/* Opção 2: Ficha Padrão Twin */}
              <label
                onClick={() => setNewWeekType('twin')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  newWeekType === 'twin'
                    ? 'bg-[#0B3A61] border-[#FFAA00] shadow-sm'
                    : 'bg-[#031F38] border-[#14527A] hover:bg-[#0B3A61]/50'
                }`}
              >
                <input
                  type="radio"
                  name="new_week_type"
                  checked={newWeekType === 'twin'}
                  onChange={() => setNewWeekType('twin')}
                  className="mt-1 text-[#FFAA00] focus:ring-[#FFAA00]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFAA00]" />
                    <strong className="text-xs text-[#E8F4F8]">
                      Ficha Base da Consultoria Twin
                    </strong>
                  </div>
                  <p className="text-[11px] text-[#8FAFBD] mt-0.5">
                    Carrega os 6 treinos clássicos (A ao F) com todas as técnicas avançadas.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => openTab('excel')}
                className="text-xs text-[#8FAFBD] hover:text-[#FFAA00] flex items-center gap-1.5 underline"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#38C6D9]" />
                <span>Ou importar uma nova planilha Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                id="btn-confirm-create-week-tab"
                onClick={handleCreateNewWeekDirect}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Criar {newWeekName || 'Semana'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Excel Upload */}
      {activeTab === 'excel' && (
        <div className="bg-[#082F52] border border-[#14527A] rounded-2xl p-5 space-y-4">
          {/* Card para Download da Planilha Modelo */}
          <div className="p-4 rounded-xl bg-[#031F38] border border-[#FFAA00]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="text-left">
              <div className="text-xs font-black text-[#FFAA00] flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-[#FFAA00]" />
                <span>Planilha Modelo Oficial (.xlsx)</span>
              </div>
              <p className="text-xs text-[#E8F4F8] font-semibold mt-0.5">
                Baixe o modelo com os 2 formatos pré-configurados (Vertical e Grade).
              </p>
              <p className="text-[11px] text-[#8FAFBD]">
                Abra no Excel ou Google Sheets para usar como base ou testar o carregamento.
              </p>
            </div>
            <button
              type="button"
              id="download-template-excel-btn"
              onClick={generateConsultoriaTwinExcelTemplate}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Baixar Planilha Modelo (.xlsx)</span>
            </button>
          </div>

          {/* Área de Upload Drag & Drop */}
          <div className="border-2 border-dashed border-[#14527A] hover:border-[#FFAA00]/60 rounded-2xl p-6 transition-colors cursor-pointer bg-[#031F38]/50 relative text-center">
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/25 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#E8F4F8]">
              Arraste sua planilha Excel aqui ou clique para selecionar
            </h4>
            <p className="text-xs text-[#8FAFBD] mt-1">
              Formatos aceitos: Microsoft Excel (.xlsx, .xls) da Consultoria Twin
            </p>
            <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#38C6D9]/15 text-[#38C6D9] border border-[#38C6D9]/30">
              ✓ Suporte automático aos Modelos Vertical e Grade Lado a Lado
            </span>
          </div>

          {/* Guia Visual dos 2 Modelos Aceitos */}
          <div className="p-4 rounded-xl bg-[#031F38] border border-[#14527A] text-left text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#14527A] pb-2.5">
              <strong className="text-[#E8F4F8] flex items-center gap-1.5 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-[#FFAA00]" />
                <span>Como o aplicativo identifica as fichas da Consultoria Twin:</span>
              </strong>
              <div className="flex items-center gap-1 bg-[#082F52] p-1 rounded-lg border border-[#14527A] text-[11px]">
                <button
                  type="button"
                  onClick={() => setGuideModelTab('vertical')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    guideModelTab === 'vertical'
                      ? 'bg-[#FFAA00] text-[#031F38]'
                      : 'text-[#8FAFBD] hover:text-[#E8F4F8]'
                  }`}
                >
                  Modelo 1 (Vertical)
                </button>
                <button
                  type="button"
                  onClick={() => setGuideModelTab('grid')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    guideModelTab === 'grid'
                      ? 'bg-[#FFAA00] text-[#031F38]'
                      : 'text-[#8FAFBD] hover:text-[#E8F4F8]'
                  }`}
                >
                  Modelo 2 (Grade)
                </button>
              </div>
            </div>

            {guideModelTab === 'vertical' ? (
              <div className="space-y-2 text-[#8FAFBD]">
                <p className="text-[#E8F4F8] font-semibold text-xs">
                  📌 <strong>Modelo Vertical (Empilhado):</strong> Os treinos ficam um abaixo do outro na mesma planilha.
                </p>
                <div className="font-mono text-[11px] bg-[#051829] p-3 rounded-lg border border-[#14527A] overflow-x-auto space-y-1">
                  <div className="text-[#FFAA00] font-bold">Treino A: Tríceps, Panturrilha, Abdômen</div>
                  <div className="text-[#38C6D9] font-bold">Exercícios | SxR | Peso | Técnica Avançada</div>
                  <div>Rosca Francesa Cross Corda | 4x8 | | </div>
                  <div>Rosca Testa Halteres Peg Neutra | 7x8 | | <span className="text-[#FFAA00]">FST-7</span></div>
                  <div>Gêmeos Sentado Máquina | 4x8 | | <span className="text-[#FFAA00]">Rest 'n' Pause 3x</span></div>
                  <div className="text-[#64879A] italic">Intervalo entre séries e exercícios: 1 a 2 minutos</div>
                  <div className="pt-1 text-[#FFAA00] font-bold">Treino B: Dorsal, Bíceps</div>
                  <div>Levantamento Terra | 4x8 | | </div>
                  <div>Remada Cross Peg Pronada | 10x8 | | <span className="text-[#FFAA00]">GVT</span></div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-[#8FAFBD]">
                <p className="text-[#E8F4F8] font-semibold text-xs">
                  📌 <strong>Modelo Grade (Lado a Lado):</strong> Os treinos ficam em colunas paralelas (A, B, C na linha de cima; D, E, F na linha de baixo).
                </p>
                <div className="font-mono text-[11px] bg-[#051829] p-3 rounded-lg border border-[#14527A] overflow-x-auto space-y-1">
                  <div className="flex gap-4 text-[#FFAA00] font-bold whitespace-nowrap">
                    <span className="w-52">Treino A: Tríceps...</span>
                    <span className="w-52">Treino B: Dorsal...</span>
                    <span className="w-52">Treino C: Coxa...</span>
                    <span className="text-[#38C6D9]">Aeróbicos</span>
                  </div>
                  <div className="flex gap-4 text-[#38C6D9] font-bold whitespace-nowrap">
                    <span className="w-52">Exercícios | SxR | Técnica</span>
                    <span className="w-52">Exercícios | SxR | Técnica</span>
                    <span className="w-52">Exercícios | SxR | Técnica</span>
                    <span className="text-[#8FAFBD]">Pós-treino: 10min</span>
                  </div>
                  <div className="flex gap-4 whitespace-nowrap">
                    <span className="w-52">Rosca Francesa (4x8)</span>
                    <span className="w-52">Levantamento Terra (4x8)</span>
                    <span className="w-52">Leg Press (4x8)</span>
                    <span className="text-[#8FAFBD]">Dias sem: 30min</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-1 text-[11px] text-[#8FAFBD] border-t border-[#14527A]/60 flex flex-wrap gap-x-4 gap-y-1">
              <span>✓ Títulos reconhecidos: <strong className="text-[#E8F4F8]">Treino A: Músculos</strong></span>
              <span>✓ Séries e Reps: <strong className="text-[#E8F4F8]">4x8, 7x8, 8xF, 10x8, 2x8</strong></span>
              <span>✓ Técnicas: <strong className="text-[#FFAA00]">FST-7, Rest-Pause, GVT, SST, Gironda, Strip-Set</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Paste Text */}
      {activeTab === 'paste' && (
        <div className="bg-[#082F52] border border-[#14527A] rounded-2xl p-4 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD] block mb-1">
              Cole as linhas da planilha aqui (copiadas do Excel / Sheets):
            </label>
            <textarea
              id="paste-spreadsheet-textarea"
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Exemplo:
Puxada Vertical Com Triângulo	4x8
Puxada Vertical Peg Pronada	7x8	FST-7
Pull-Down Cross Corda	4x8
Remada Cross Peg Supinada	4x8"
              className="w-full p-3 text-xs bg-[#031F38] border border-[#14527A] rounded-xl text-[#E8F4F8] font-mono placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00]"
            />
          </div>

          <button
            id="parse-pasted-text-btn"
            onClick={handleParseText}
            className="w-full py-2.5 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-bold text-xs transition-all shadow-md"
          >
            Processar Linhas Coladas
          </button>
        </div>
      )}

      {/* TAB: Export */}
      {activeTab === 'export' && (
        <div className="bg-[#082F52] border border-[#14527A] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#E8F4F8]">Backup de fichas e histórico</h3>
            <p className="text-xs text-[#8FAFBD] mt-0.5">
              Baixe ou restaure as semanas e os treinos concluídos do perfil ativo.
            </p>
          </div>

          <button
            id="download-backup-btn"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] text-[#E8F4F8] font-bold text-xs border border-[#14527A] transition-all"
          >
            <Download className="w-4 h-4 text-[#FFAA00]" />
            <span>Baixar fichas e histórico (JSON)</span>
          </button>
          <label className="block space-y-2 text-sm font-bold">
            Restaurar backup em {athleteName}
            <input type="file" accept=".json,application/json" onChange={handleBackupFile}
              className="block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-[#14527A] file:px-3 file:py-2 file:text-white" />
          </label>
          {backup && restorePreview && (
            <div className="space-y-2 rounded-xl border border-[#14527A] bg-[#031F38] p-3 text-sm">
              <p>Semanas no arquivo: <strong>{backup.weeks.length}</strong>. Sessões no arquivo: <strong>{backup.logs.length}</strong>.</p>
              <p>Semanas novas: {restorePreview.addedWeeks}. Sessões novas: {restorePreview.addedLogs}. Os dados existentes serão mantidos.</p>
              <button type="button" onClick={handleRestoreBackup}
                disabled={!restorePreview.addedWeeks && !restorePreview.addedLogs}
                className="rounded-xl bg-[#FFAA00] px-4 py-2 font-bold text-[#031F38] disabled:opacity-50">
                Confirmar restauração
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview Dialog if parsed */}
      {previewRoutines && (
        <div className="p-4 bg-[#082F52] border border-[#FFAA00]/50 rounded-2xl shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#FFAA00] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FFAA00]" />
              Pré-visualização da Importação ({previewRoutines.length} treinos)
            </h3>
            <button
              onClick={() => setPreviewRoutines(null)}
              className="text-xs text-[#8FAFBD] hover:text-[#E8F4F8]"
            >
              Cancelar
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {previewRoutines.map((r) => (
              <div key={r.id} className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A] text-xs">
                <div className="font-bold text-[#E8F4F8] mb-1">
                  {r.name} ({r.targetMuscles}) — {r.exercises.length} exercícios
                </div>
                <div className="text-[11px] text-[#8FAFBD] space-y-0.5">
                  {r.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span>
                        {i + 1}. {ex.name} ({ex.sets}x{ex.reps})
                      </span>
                      {ex.advancedTechniqueNotes && (
                        <span className="text-[#FFAA00] font-medium">
                          {ex.advancedTechniqueNotes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Destino da Importação: Nova Semana ou Substituir */}
          <div className="p-3 rounded-xl bg-[#031F38] border border-[#14527A] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FAFBD] block">
              Onde salvar estes treinos?
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  importDestination === 'new_week'
                    ? 'bg-[#0B3A61] border-[#FFAA00]'
                    : 'bg-[#082F52] border-[#14527A]'
                }`}
              >
                <input
                  type="radio"
                  name="importDestination"
                  checked={importDestination === 'new_week'}
                  onChange={() => setImportDestination('new_week')}
                  className="mt-0.5 accent-[#FFAA00]"
                />
                <div>
                  <span className="text-xs font-bold text-[#E8F4F8] block">
                    Criar como Nova Semana
                  </span>
                  <span className="text-[10px] text-[#8FAFBD]">
                    Ideal para adicionar a próxima semana enviada pelo personal.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  importDestination === 'replace'
                    ? 'bg-[#0B3A61] border-[#FFAA00]'
                    : 'bg-[#082F52] border-[#14527A]'
                }`}
              >
                <input
                  type="radio"
                  name="importDestination"
                  checked={importDestination === 'replace'}
                  onChange={() => setImportDestination('replace')}
                  className="mt-0.5 accent-[#FFAA00]"
                />
                <div>
                  <span className="text-xs font-bold text-[#E8F4F8] block">
                    Substituir Semana Atual
                  </span>
                  <span className="text-[10px] text-[#8FAFBD]">
                    Sobrescreve os treinos da semana selecionada no app.
                  </span>
                </div>
              </label>
            </div>

            {importDestination === 'new_week' && (
              <div className="pt-1">
                <label className="text-[10px] uppercase font-bold text-[#64879A] block mb-1">
                  Nome da Nova Semana:
                </label>
                <input
                  type="text"
                  value={newWeekName}
                  onChange={(e) => setNewWeekName(e.target.value)}
                  placeholder="Ex: Semana 2, Semana 3..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#082F52] border border-[#14527A] text-xs font-bold text-[#E8F4F8] focus:outline-none focus:border-[#FFAA00]"
                />
              </div>
            )}
          </div>

          <button
            id="confirm-import-btn"
            onClick={handleConfirmImport}
            className="w-full py-3 rounded-xl bg-[#00C98B] hover:bg-[#00C98B]/90 text-[#031F38] font-bold text-xs shadow-lg shadow-[#00C98B]/20 transition-all"
          >
            {importDestination === 'new_week'
              ? `Confirmar e Criar "${newWeekName.trim() || 'Nova Semana'}"`
              : 'Confirmar e Substituir Treinos'}
          </button>
        </div>
      )}
    </div>
  );
};
