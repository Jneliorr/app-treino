import { AdvancedTechnique } from '../types';

export const ADVANCED_TECHNIQUES: Record<string, AdvancedTechnique> = {
  'fst-7': {
    id: 'fst-7',
    name: 'FST-7 (Fascia Stretch Training-7)',
    shortName: 'FST-7',
    subtitle: '7 séries finais com foco em expansão da fáscia muscular e pump extremo',
    description:
      'Criado por Hany Rambod e amplamente instruído por Leandro Twin, o FST-7 consiste em realizar 7 séries consecutivas ao final do treino para o grupo muscular, com intervalos curtos de 30 a 45 segundos, provocando acúmulo máximo de sangue (pump) e estiramento da fáscia.',
    stepByStep: [
      'Escolha um exercício isolador ou em máquina estável (ex: Puxada Vertical ou Crucifixo).',
      'Execute 7 séries seguidas com a mesma carga (ou ajustando levemente caso atinja falha precoce).',
      'Mantenha as repetições estipuladas (geralmente 8 a 12 repetições).',
      'Descanse rigorosamente entre 30 e 45 segundos cronometrados entre cada uma das 7 séries.',
      'Beba pequenos goles de água e alongue/contraia o músculo alvo durante o intervalo para manter a congestão vascular.',
    ],
    restInterval: '30 a 45 segundos',
    scientificPurpose:
      'Gera volumização celular extrema e estresse metabólico acumulado, enviando sinais mecânicos e bioquímicos para expansão da fáscia muscular espessa que limita o crescimento de novas miofibrilas.',
    exampleFromWorkout: 'Treino A: Puxada Vertical Peg Pronada 7x8 (FST-7)',
    safetyTips:
      'Utilize prioritariamente em máquinas ou cabos. Evite fazer FST-7 em exercícios livres compostos pesados (como agachamento livre ou terra) devido à fadiga postural.',
    videoUrl: 'https://youtu.be/fpooAdPRYNQ',
  },

  'rest-pause': {
    id: 'rest-pause',
    name: "Rest 'n' Pause (Pausa-Descanso)",
    shortName: "Rest 'n' Pause",
    subtitle: 'Série com micropausas para extrair repetições efetivas pós-falha',
    description:
      'Técnica de alta intensidade onde você atinge a falha momentânea concêntrica, realiza uma breve pausa de 10 a 15 segundos para repor os estoques de fosfocreatina (CP), e continua executando mais repetições até nova falha, repetindo esse ciclo o número de vezes prescrito (ex: 3 micro-pausas).',
    stepByStep: [
      'Coloque uma carga que permita atingir a falha na faixa prescrita (ex: 8 repetições).',
      'Execute a série até a falha concêntrica.',
      'Coloque a barra/halteres no suporte e descanse de 10 a 15 segundos respirando fundo.',
      'Pegue o peso novamente e execute o máximo de repetições possíveis (geralmente 2 a 4 repetições).',
      'Repita o descanso de 10 a 15 segundos mais 1 ou 2 vezes conforme a prescrição (ex: "Rest \'n\' Pause 3x").',
    ],
    restInterval: '10 a 15 segundos nas micropausas intra-série; 90 a 120s entre séries normais.',
    scientificPurpose:
      'Maximiza o recrutamento de unidades motoras de alto limiar (fibras do tipo IIb/IIx) desde o primeiro segundo após a micropausa, acumulando apenas repetições mecanicamente efetivas sem a necessidade de gastar energia em repetições iniciais fáceis.',
    exampleFromWorkout:
      "Treino B: Tríceps Pulley Unilateral Peg Supinada 4x8 (Rest 'n' Pause 3x) | Cadeira Extensora (Rest 'n' Pause 3x)",
    safetyTips:
      'Mantenha a postura e a cadência mesmo com a queimação extrema. Não sacrifique a técnica articular para roubar repetições durante a micropausa.',
    videoUrl: 'https://youtu.be/tf8aOFnd73k',
  },

  'gironda': {
    id: 'gironda',
    name: 'Método Gironda (8x8 Vince Gironda)',
    shortName: 'Gironda 8x8',
    subtitle: '8 séries de 8 repetições com densidade extrema e descanso mínimo',
    description:
      'Desenvolvido pelo lendário treinador Vince Gironda e adaptado por Leandro Twin, este método consiste em executar 8 séries de 8 repetições com intervalo restrito de apenas 15 a 30 segundos entre elas, utilizando a mesma carga do início ao fim.',
    stepByStep: [
      'Selecione uma carga de aproximadamente 50% a 60% de 1RM (uma carga moderada que pareça fácil na primeira série).',
      'Execute 8 repetições com cadência controlada e foco na contração de pico.',
      'Descanse apenas 15 a 30 segundos (não converse nem desvie a atenção).',
      'Realize a 2ª série de 8 repetições. A partir da 4ª ou 5ª série, o cansaço acumulado tornará cada repetição um desafio monumental.',
      'Complete todas as 8 séries mantendo a integridade postural.',
    ],
    restInterval: '15 a 30 segundos cronometrados',
    scientificPurpose:
      'Altíssima densidade de treino (grande tonelagem em pouco tempo) provocando exaustão do glicogênio intramuscular, acúmulo de metabólitos e condicionamento cardiovascular e muscular simultâneo.',
    exampleFromWorkout: 'Treino B: Supino Reto Smith 8x8 (Gironda)',
    safetyTips:
      'Não comece com carga muito pesada; se começar pesado demais, falhará na 3ª série. O objetivo é a fadiga cumulativa ao longo das 8 séries.',
    videoUrl: 'https://youtu.be/ISC8O-_4Sk4',
  },

  'gvt': {
    id: 'gvt',
    name: 'German Volume Training (GVT 10x10)',
    shortName: 'GVT 10x10',
    subtitle: 'Treinamento de Volume Alemão: 10 séries de 10 repetições com a mesma carga',
    description:
      'Método clássico originado na Alemanha nos anos 70 para ganho maciço de massa muscular. Consiste em realizar exatamente 10 séries de 10 repetições para um único exercício composto com 60% de 1RM e descansos de 60 a 90 segundos.',
    stepByStep: [
      'Escolha um exercício poliarticular básico (ex: Agachamento, Supino, Remada ou Desenvolvimento).',
      'Ajuste a carga para cerca de 60% de 1RM (uma carga com a qual você conseguiria fazer cerca de 20 repetições se fosse uma única série).',
      'Execute 10 repetições com cadência precisa (4 segundos excêntrica, 2 segundos concêntrica).',
      'Descanse 60 a 90 segundos estritos entre as séries.',
      'Mantenha a mesma carga em todas as 10 séries, buscando fechar 100 repetições totais.',
    ],
    restInterval: '60 a 90 segundos cronometrados',
    scientificPurpose:
      'Sobrecarga brutal de volume mecânico direcionada a um grupo específico de unidades motoras motoras, ativando hipertrofia miofibrilar massiva pelo estresse cumulativo.',
    exampleFromWorkout: 'Supino Reto ou Agachamento Livre 10x10.',
    safetyTips:
      'Não adicione técnicas de intensidade extras como drop-sets ou rest-pause ao GVT. O volume por si só já é o ápice do estresse muscular.',
    videoUrl: 'https://youtu.be/JDkBmBkZvek',
  },

  'sst': {
    id: 'sst',
    name: 'SST (Sarcoplasma Stimulating Training)',
    shortName: 'SST',
    subtitle: 'Método suíço de fadiga profunda combinando falhas, micropausas e isometria',
    description:
      'Criado pelo preparador Patrick Tuor e adaptado nas consultorias do Leandro Twin, o SST é uma técnica avançada que combina séries pesadas até a falha, intervalos decrescentes, redução de carga (drop-set), contrações isométricas e repetições parciais em um único bloco contínuo devastador.',
    stepByStep: [
      'Inicie com uma carga pesada de 8 a 10 repetições até a falha total.',
      'Descanse 15 segundos e faça o máximo de repetições com a mesma carga (ex: 3 a 5 reps).',
      'Descanse 30 segundos e faça novamente até a falha (ex: 2 a 3 reps).',
      'Reduza a carga em 20% imediatamente: faça repetições lentas (4 segundos na descida) até falhar.',
      'Em seguida, segure uma isometria no ponto médio por 5 a 10 segundos, e finalize com repetições parciais rápidas.',
    ],
    restInterval: '15s a 30s nos blocos internos do protocolo',
    scientificPurpose:
      'Esgotamento completo de todas as fontes bioenergéticas e recrutamento progressivo de fibras musculares residuais através da variação de velocidade, tensão contínua e acúmulo de lactato.',
    exampleFromWorkout:
      'Treino D: Pull-Down Cross Peg Pronada 2x8 (SST) e Extensão de Punho Cross 2x8 (SST)',
    safetyTips:
      'Exige alto nível de tolerância à dor muscular. Realize apenas em exercícios com trajeto guiado (polias/cabos ou máquinas) para prevenir acidentes com pesos livres.',
    videoUrl: 'https://youtu.be/PvFcALfJ34M',
  },

  'strip-set': {
    id: 'strip-set',
    name: 'Drop-Set / Strip-Set',
    shortName: 'Drop-Set / Strip-Set',
    subtitle: 'Reduções consecutivas de carga sem descanso pós-falha mecânica',
    description:
      'O Strip-Set (ou Drop-Set) consiste em realizar uma série até a falha mecânica, e sem nenhum segundo de descanso, reduzir a carga em aproximadamente 20% a 30% e continuar até nova falha. Realiza-se de 2 a 3 reduções consecutivas de peso conforme prescrição.',
    stepByStep: [
      'Aqueça e posicione os pesos/pinos já preparados para trocas rápidas.',
      'Execute a série com a carga de trabalho até atingir a falha concêntrica (ex: 8 repetições).',
      'Sem descansar, reduza 20-30% da carga imediatamente (1º Drop). Continue executando até a falha.',
      'Sem descansar, reduza mais 20-30% (2º Drop). Continue executando até a falha.',
      'Sem descansar, reduza uma terceira vez (3º Drop) e esgote as repetições finais até não conseguir mais mover a carga.',
    ],
    restInterval: '0 segundos entre as reduções de carga (apenas o tempo de mudar o pino/anilhas).',
    scientificPurpose:
      'Aumenta o tempo sob tensão (TUT) e o estresse metabólico intramuscular, forçando o sistema neuromuscular a recrutar fibras remanescentes mesmo sob fadiga aguda.',
    exampleFromWorkout:
      'Treino E: Elevação Frontal Barra Peg Supinada 4x8 (Strip-Set 3x) | Rosca Alternada Halteres 4x8 (Strip-Set 3x)',
    safetyTips:
      'Não descanse entre as reduções. Peça ajuda a um parceiro de treino ou use máquinas de pino rápido para não perder a janela de fadiga metabólica.',
    videoUrl: 'https://youtu.be/rxrBvPiuqhQ',
  },

  'bi-set': {
    id: 'bi-set',
    name: 'Bi-set, Tri-set, Giant-set, Circuito, Super-set',
    shortName: 'Super Séries (Bi-Set / Tri-Set)',
    subtitle: 'Agonista x Antagonista e combinações múltiplas sem descanso',
    description:
      'Execução de 2 (Bi-Set), 3 (Tri-Set), 4 ou mais (Giant-Set) exercícios consecutivos para o mesmo grupo muscular ou músculos antagonistas (ex: bíceps e tríceps, peito e costas) sem intervalo de descanso intermediário.',
    stepByStep: [
      'Prepare os aparelhos e pesos com antecedência para rápida transição.',
      'Execute o primeiro exercício até a falha ou número de repetições prescrito.',
      'Mude imediatamente para o próximo exercício sem parar para descansar.',
      'Conclua a sequência e então inicie o descanso completo programado (90 a 120s).',
    ],
    restInterval: '0 segundos entre exercícios do combo; 90 a 120 segundos ao final de cada rodada.',
    scientificPurpose:
      'Eleva significativamente a densidade calórica e o fluxo sanguíneo local. Quando realizado em antagonistas, aumenta a inibição recíproca favorecendo maior ativação do músculo alvo.',
    exampleFromWorkout: 'Supino Reto + Crucifixo com Halteres, ou Rosca Direta + Tríceps Pulley.',
    safetyTips:
      'Certifique-se de que os aparelhos estejam disponíveis na academia para não perder o efeito da transição imediata.',
    videoUrl: 'https://youtu.be/NFn2obMxHUA',
  },

  'parciais-roubadas': {
    id: 'parciais-roubadas',
    name: 'Repetições Parciais e Repetições Roubadas',
    shortName: 'Parciais / Roubadas',
    subtitle: 'Continuação da série além da falha estrita com impulso controlado ou amplitude útil',
    description:
      'Nas repetições parciais, após atingir a falha em amplitude completa, você continua o exercício executando meias repetições na amplitude mais forte. Nas repetições roubadas (cheat reps), utiliza-se uma leve oscilação corporal no início da fase concêntrica para ultrapassar o ponto crítico de emperramento.',
    stepByStep: [
      'Realize repetições estritas perfeitas até atingir a falha concêntrica.',
      'Para repetições parciais: continue realizando de 4 a 6 repetições na metade ou um terço da amplitude.',
      'Para repetições roubadas: use um leve impulso corporal apenas no início do movimento, segurando a descida (fase excêntrica) com controle estrito por 3 a 4 segundos.',
    ],
    restInterval: '90 a 120 segundos',
    scientificPurpose:
      'Sobrecarga excêntrica extrema e extensão do tempo sob tensão além do ponto de falha concêntrica tradicional.',
    exampleFromWorkout: 'Elevação lateral com halteres ou Rosca Direta.',
    safetyTips:
      'O "roubo" deve ser inteligente e controlado. Nunca hiperextenda a coluna lombar nem jogue os pesos desgovernadamente.',
    videoUrl: 'https://youtu.be/__pPJQnXlsQ',
  },

  'forcadas-negativas': {
    id: 'forcadas-negativas',
    name: 'Repetições Forçadas e Repetições Negativas',
    shortName: 'Forçadas / Negativas',
    subtitle: 'Assistência concêntrica de parceiro e sobrecarga excêntrica pesada',
    description:
      'Nas repetições forçadas, após a falha, um parceiro de treino ajuda apenas com a força necessária para subir o peso, enquanto você executa toda a descida. Nas repetições puramente negativas, utiliza-se uma carga supra-máxima (105-120% de 1RM), descendo o peso em 4 a 6 segundos e recebendo ajuda total na subida.',
    stepByStep: [
      'Faça a série com carga pesada até a falha.',
      'O parceiro coloca as mãos na barra/aparelho e auxilia a passar pelo ponto de travamento na subida.',
      'Você controla 100% da fase excêntrica (descida) de maneira lenta e agonizante.',
      'Realize 2 a 3 repetições forçadas extras por série.',
    ],
    restInterval: '120 a 180 segundos',
    scientificPurpose:
      'O músculo é aproximadamente 20% a 40% mais forte na fase excêntrica do que na concêntrica. Esta técnica explora esse potencial para microlesões musculares profundas.',
    exampleFromWorkout: 'Supino Reto com barra ou Rosca Scott com ajuda de parceiro.',
    safetyTips:
      'Requer obrigatoriamente um parceiro de treino experiente e atento para evitar que o peso caia sobre o praticante.',
    videoUrl: 'https://youtu.be/S4gqk1uLmqs',
  },

  'super-slow': {
    id: 'super-slow',
    name: 'Super-Slow (Cadência Extremamente Lenta)',
    shortName: 'Super-Slow',
    subtitle: 'Eliminação completa da inércia com cadência de 5 a 10 segundos por fase',
    description:
      'Método desenvolvido por Ken Hutchins onde cada repetição leva de 10 a 14 segundos (ex: 5 segundos de subida concêntrica e 5 segundos de descida excêntrica contínua sem tranco nem travamento articular).',
    stepByStep: [
      'Reduza a carga usual em 30% a 40%.',
      'Inicie a subida contando lentamente: 1, 2, 3, 4, 5 segundos contínuos.',
      'Sem repousar no pico de contração, inicie a descida contando mais 5 segundos.',
      'Complete de 4 a 6 repetições por série. A queimação de ácido lático é imediata.',
    ],
    restInterval: '90 a 120 segundos',
    scientificPurpose:
      'Anula qualquer aproveitamento de momento cinético ou elasticidade tecidual, exigindo tensão muscular pura e contínua do primeiro ao último milímetro de percurso.',
    exampleFromWorkout: 'Cadeira Extensora, Leg Press ou Peck Deck.',
    safetyTips:
      'Excelente para quem possui dores articulares ou tendíneas, pois elimina o impacto de acelerações bruscas.',
    videoUrl: 'https://youtu.be/h7f7Wg-Vb34',
  },

  'piramide': {
    id: 'piramide',
    name: 'Pirâmide (Crescente / Decrescente)',
    shortName: 'Pirâmide',
    subtitle: 'Aumento progressivo de carga com decréscimo de repetições (ou o inverso)',
    description:
      'Na pirâmide crescente, a cada série a carga sobe enquanto a faixa de repetições é reduzida (ex: 12-10-8-6 repetições com pesos crescentes). Na pirâmide decrescente, começa-se na carga máxima e reduz-se para aumentar repetições.',
    stepByStep: [
      '1ª série: Carga moderada para 12 repetições perfeitas.',
      '2ª série: Suba a carga em ~10% e faça 10 repetições.',
      '3ª série: Suba a carga novamente e execute 8 repetições até a falha.',
      '4ª série: Carga pesada para 6 repetições desafiadoras.',
    ],
    restInterval: '60s nas séries leves até 120s-180s nas séries finais mais pesadas.',
    scientificPurpose:
      'Prepara o sistema nervoso central (recrutamento de motoneurônios) e tecidos conectivos de forma progressiva para suportar cargas máximas com segurança.',
    exampleFromWorkout: 'Agachamento Livre, Supino Reto Barra ou Levantamento Terra.',
    safetyTips:
      'Aqueça bem antes da primeira série de pirâmide. Monitore a técnica postural quando o peso estiver no auge da pirâmide.',
    videoUrl: 'https://youtu.be/Yf2BcTWWDvc',
  },

  'pre-pos-exaustao': {
    id: 'pre-pos-exaustao',
    name: 'Pré-Exaustão e Pós-Exaustão',
    shortName: 'Pré/Pós-Exaustão',
    subtitle: 'Isolador antes do composto (pré) ou composto seguido de isolador (pós)',
    description:
      'Na Pré-Exaustão, executa-se um exercício isolador para cansar o músculo alvo antes de ir para o composto (ex: Crucifixo antes do Supino, ou Cadeira Extensora antes do Agachamento). Na Pós-Exaustão, faz-se o composto pesado primeiro e logo em seguida esgota-se no isolador.',
    stepByStep: [
      'Pré-Exaustão: Faça 1 série de Crucifixo com Halteres até a falha -> Vá imediatamente para o Supino Reto.',
      'Dessa forma, o peitoral atinge a falha antes que o tríceps ou deltóide cansem no supino.',
      'Pós-Exaustão: Agachamento Livre pesado até quase a falha -> Vá direto para Cadeira Extensora para esgotar as coxas.',
    ],
    restInterval: '0 a 10 segundos entre exercícios combinados; 90 a 120s de descanso após o par.',
    scientificPurpose:
      'Evita que músculos auxiliares (sinergistas menores como tríceps ou ombro) sejam o elo fraco da cadeia e limitem o esgotamento do músculo alvo primário.',
    exampleFromWorkout: 'Crucifixo Inclinado + Supino Inclinado, ou Elevação Lateral + Desenvolvimento.',
    safetyTips:
      'No exercício composto que vem após a pré-exaustão, a carga utilizada será substancialmente menor. Não tente usar o mesmo peso habitual para não lesionar.',
    videoUrl: 'https://youtu.be/hrSNrH5fhrs',
  },

  'treino-pegada': {
    id: 'treino-pegada',
    name: 'Treino de Pegada (Grip Strength)',
    shortName: 'Treino de Pegada',
    subtitle: 'Fortalecimento dos flexores dos dedos, antebraço e sustentação isométrica',
    description:
      'Instruções específicas de Leandro Twin para desenvolver uma pegada sólida, prevenindo que a mão ou antebraço abram antes da falha em exercícios como levantamento terra, remadas pesadas e puxadas.',
    stepByStep: [
      'Exercícios de sustentação: Pendurar-se na barra fixa com peso corporal ou segurar anilhas pesadas pelas bordas (pinch grip).',
      'Trabalho de flexão e extensão de punho com barra ou halteres.',
      'Uso de Hand Grips com molas de alta resistência.',
      'Aplicação consciente de pegada pronada até o limite antes de recorrer a straps.',
    ],
    restInterval: '60 a 90 segundos',
    scientificPurpose:
      'Aumenta a força de preensão manual e a rigidez articular do punho, promovendo irradiação neural que melhora a força do membro superior como um todo.',
    exampleFromWorkout: 'Hand Grip, Rosca Inversa e Extensão de Punho.',
    safetyTips:
      'Evite utilizar straps em 100% dos treinos para não atrofiar sua força intrínseca de preensão palmar.',
    videoUrl: 'https://youtu.be/P4swC2ezxEw',
  },

  'ponto-zero': {
    id: 'ponto-zero',
    name: 'Ponto Zero (Isometria Excêntrica Extrema)',
    shortName: 'Ponto Zero',
    subtitle: 'Pausa isométrica de 2 a 3 segundos no ponto de maior alongamento',
    description:
      'Popularizado no Brasil por Fernando Sardinha e reforçado nos vídeos de execução de Leandro Twin, o Ponto Zero consiste em pausar o movimento por 2 a 3 segundos na transição da fase excêntrica para concêntrica (ponto de máximo alongamento), eliminando a inércia e o reflexo miotático de estiramento dos tendões.',
    stepByStep: [
      'Reduza a carga em 20% a 30% em relação ao peso habitual.',
      'Execute a fase excêntrica (descida) de forma controlada (2 a 3 segundos).',
      'No ponto mais baixo (máximo alongamento mecânico sem relaxar a musculatura), paralise totalmente por 2 a 3 segundos.',
      'Inicie a subida (fase concêntrica) usando puramente a força das fibras musculares, sem balanço ou rebote.',
      'Repita para todas as repetições da série.',
    ],
    restInterval: '60 a 90 segundos entre as séries',
    scientificPurpose:
      'Dissipa a energia elástica acumulada nos tendões e fáscia muscular, obrigando o tecido contrátil ativo a gerar 100% da força necessária para iniciar a contração concêntrica a partir de velocidade zero.',
    exampleFromWorkout: 'Aplicável em crucifixos, remadas, agachamentos e roscas bíceps.',
    safetyTips:
      'Nunca relaxe a articulação no ponto zero. Mantenha os músculos em tensão ativa contínua durante a pausa.',
  },

  'isometria': {
    id: 'isometria',
    name: 'Isometria (Contração Estática)',
    shortName: 'Isometria',
    subtitle: 'Sustentação imóvel no pico de contração ou ângulo de maior torque',
    description:
      'Sustentação do peso estaticamente em um ângulo específico da articulação por um período de tempo pré-determinado (ex: 3 a 5 segundos por repetição ou 10 a 20 segundos na última repetição).',
    stepByStep: [
      'Execute a repetição até o ponto de maior pico de contração muscular.',
      'Trave o movimento sem deixar o peso ceder durante o tempo estipulado.',
      'Concentre-se em espremer voluntariamente a musculatura alvo.',
      'Retorne de forma controlada e finalize a série.',
    ],
    restInterval: '60 a 90 segundos',
    scientificPurpose:
      'Oclusão vascular momentânea e disparo contínuo de potenciais de ação neuronais sem ciclo de encurtamento-alongamento.',
    exampleFromWorkout: 'Pausa de 3s no pico de contração da Cadeira Extensora ou Crucifixo.',
    safetyTips: 'Não prenda a respiração durante a isometria (evite manobra de Valsalva excessiva).',
  },
};

export function getTechniqueById(id?: string): AdvancedTechnique | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();

  if (normalized.includes('fst') || normalized.includes('fst-7')) return ADVANCED_TECHNIQUES['fst-7'];
  if (normalized.includes('rest') || normalized.includes('pause')) return ADVANCED_TECHNIQUES['rest-pause'];
  if (normalized.includes('gironda')) return ADVANCED_TECHNIQUES['gironda'];
  if (normalized.includes('gvt') || normalized.includes('german') || normalized.includes('10x10')) return ADVANCED_TECHNIQUES['gvt'];
  if (normalized.includes('sst')) return ADVANCED_TECHNIQUES['sst'];
  if (normalized.includes('strip') || normalized.includes('drop')) return ADVANCED_TECHNIQUES['strip-set'];
  if (normalized.includes('bi-set') || normalized.includes('tri-set') || normalized.includes('super') || normalized.includes('circuito')) return ADVANCED_TECHNIQUES['bi-set'];
  if (normalized.includes('parcia') || normalized.includes('roubada') || normalized.includes('burn')) return ADVANCED_TECHNIQUES['parciais-roubadas'];
  if (normalized.includes('forcada') || normalized.includes('negativa')) return ADVANCED_TECHNIQUES['forcadas-negativas'];
  if (normalized.includes('super-slow') || normalized.includes('slow')) return ADVANCED_TECHNIQUES['super-slow'];
  if (normalized.includes('piramide') || normalized.includes('pirâmide')) return ADVANCED_TECHNIQUES['piramide'];
  if (normalized.includes('pre-exaustao') || normalized.includes('pos-exaustao') || normalized.includes('exaustao')) return ADVANCED_TECHNIQUES['pre-pos-exaustao'];
  if (normalized.includes('pegada') || normalized.includes('grip')) return ADVANCED_TECHNIQUES['treino-pegada'];
  if (normalized.includes('ponto zero') || normalized.includes('ponto-zero')) return ADVANCED_TECHNIQUES['ponto-zero'];
  if (normalized.includes('isometria')) return ADVANCED_TECHNIQUES['isometria'];

  return ADVANCED_TECHNIQUES[normalized];
}
