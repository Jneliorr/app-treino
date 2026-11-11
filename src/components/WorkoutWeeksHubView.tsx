import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Dumbbell,
  Play,
  Copy,
  Trash2,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Flame,
  ArrowRight,
  AlertCircle,
  X,
  Check,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Routine, WorkoutWeek } from '../types';
import {
  loadWeeks,
  loadActiveWeekId,
  saveActiveWeekId,
  createNewWeek,
  deleteWeek,
  loadRoutineDraft,
  clearRoutineDraft,
  findLastWorkoutForRoutine,
  loadWorkoutLogs,
} from '../services/storage';
import {
  isAudioFeedbackEnabled,
  setAudioFeedbackEnabled,
  getAudioSoundTheme,
  setAudioSoundTheme,
  SoundThemeMode,
  playSetCompletedSound,
  playCountdownTickSound,
  triggerLightHaptic,
} from '../utils/workoutFeedback';

interface Props {
  onStartWorkout: (routineId: string, weekId: string) => void;
  onOpenSpreadsheetTab: () => void;
}

export const WorkoutWeeksHubView: React.FC<Props> = ({
  onStartWorkout,
  onOpenSpreadsheetTab,
}) => {
  const [weeks, setWeeks] = useState<WorkoutWeek[]>(() => loadWeeks());
  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => {
    const activeId = loadActiveWeekId();
    const loadedWeeks = loadWeeks();
    if (loadedWeeks.some((w) => w.id === activeId)) {
      return activeId;
    }
    return loadedWeeks.length > 0 ? loadedWeeks[0].id : 'semana-1';
  });

  // Modal para criar nova semana
  const [isNewWeekModalOpen, setIsNewWeekModalOpen] = useState(false);
  const [newWeekName, setNewWeekName] = useState('');
  const [copySourceWeekId, setCopySourceWeekId] = useState<string>('');
  const [createOption, setCreateOption] = useState<'copy' | 'excel' | 'twin'>('copy');

  // Preview de exercícios expandidos por rotina
  const [expandedPreviewRoutineId, setExpandedPreviewRoutineId] = useState<string | null>(null);

  // Menu dropdown de semanas
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState(false);

  // Preferências e Áudio dos Treinos (Configurados na Área Externa)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(() => isAudioFeedbackEnabled());
  const [soundTheme, setSoundTheme] = useState<SoundThemeMode>(() => getAudioSoundTheme());
  const [isSmartAutoFillEnabled, setIsSmartAutoFillEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('workout_smart_autofill');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Modal para resetar rascunho de um treino específico
  const [routineToReset, setRoutineToReset] = useState<Routine | null>(null);
  const [weekError, setWeekError] = useState('');

  const toggleAudioEnabled = () => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      setAudioFeedbackEnabled(next);
      if (next) {
        if (soundTheme === 'mario') {
          playSetCompletedSound(); // Moeda clássica do Mario!
        } else {
          playCountdownTickSound();
        }
        triggerLightHaptic();
      }
      return next;
    });
  };

  const toggleSoundTheme = () => {
    const nextTheme: SoundThemeMode = soundTheme === 'mario' ? 'gym' : 'mario';
    setSoundTheme(nextTheme);
    setAudioSoundTheme(nextTheme);
    if (isAudioEnabled) {
      if (nextTheme === 'mario') {
        playSetCompletedSound();
      } else {
        playCountdownTickSound();
      }
      triggerLightHaptic();
    }
  };

  const toggleSmartAutoFill = () => {
    setIsSmartAutoFillEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('workout_smart_autofill', String(next));
      } catch {}
      triggerLightHaptic();
      return next;
    });
  };

  const handleConfirmResetRoutine = () => {
    if (!routineToReset || !selectedWeek) return;
    clearRoutineDraft(routineToReset.id, selectedWeek.id);
    setRoutineToReset(null);
  };

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId) || weeks[0];
  const workoutLogs = loadWorkoutLogs();

  const handleSelectWeek = (weekId: string) => {
    setSelectedWeekId(weekId);
    saveActiveWeekId(weekId);
    setIsWeekMenuOpen(false);
  };

  const handleOpenCreateModal = () => {
    setWeekError('');
    const nextNum = Math.max(0, ...weeks.map((week) => week.number)) + 1;
    setNewWeekName(`Semana ${nextNum}`);
    setCopySourceWeekId(selectedWeek?.id || weeks[weeks.length - 1]?.id || '');
    setCreateOption('copy');
    setIsNewWeekModalOpen(true);
  };

  const handleConfirmCreateWeek = () => {
    if (createOption === 'excel') {
      setIsNewWeekModalOpen(false);
      onOpenSpreadsheetTab();
      return;
    }

    try {
      const created = createNewWeek(
        newWeekName.trim() || undefined,
        createOption === 'copy' ? copySourceWeekId : undefined
      );
      setWeeks(loadWeeks());
      setSelectedWeekId(created.id);
      setIsNewWeekModalOpen(false);
    } catch {
      setWeekError('Não foi possível criar a semana neste navegador. Verifique o armazenamento e tente novamente.');
    }
  };

  // Modal de confirmação para deletar semana
  const [weekToDelete, setWeekToDelete] = useState<WorkoutWeek | null>(null);

  const handleConfirmDeleteWeek = () => {
    if (!weekToDelete) return;

    try {
      const remaining = deleteWeek(weekToDelete.id);
      setWeeks(remaining);
      const nextId = remaining.find((w) => w.id === selectedWeekId)?.id || remaining[0]?.id || '';
      setSelectedWeekId(nextId);
      saveActiveWeekId(nextId);
      setWeekToDelete(null);
      setWeekError('');
    } catch {
      setWeekError('Não foi possível excluir a semana neste navegador. Tente novamente.');
    }
  };

  return (
    <div id="workout-weeks-hub" className="space-y-4 pb-16 text-[#E8F4F8]">
      {/* Menu Superior Compacto e Clean de Seleção de Semanas (Apple Inset Header) */}
      <div className="relative z-30 flex items-center justify-between gap-2 p-2 apple-glass border border-[#14527A]/80 rounded-2xl shadow-sm">
        {/* Dropdown Menu para Alternar Semanas */}
        <div className="relative">
          <button
            id="btn-week-dropdown"
            type="button"
            onClick={() => setIsWeekMenuOpen((prev) => !prev)}
            className="apple-press flex items-center gap-2 px-3 py-2 rounded-xl bg-[#031F38] hover:bg-[#0B3A61] border border-[#14527A] hover:border-[#FFAA00]/50 text-[#E8F4F8] transition-all cursor-pointer"
            title="Toque para alternar semanas"
          >
            <Calendar className="w-4 h-4 text-[#FFAA00] flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-tight">{selectedWeek?.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#082F52] border border-[#14527A] text-[#FFAA00] font-mono font-bold">
                {selectedWeek?.routines.length} treinos
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8FAFBD] transition-transform duration-200 ${
                  isWeekMenuOpen ? 'rotate-180 text-[#FFAA00]' : ''
                }`}
              />
            </div>
          </button>

          {/* Menu Dropdown Flutuante */}
          {isWeekMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setIsWeekMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-2 z-50 w-80 max-w-[92vw] rounded-2xl bg-[#082F52] border border-[#14527A] shadow-2xl p-2 space-y-2 animate-fadeIn">
                <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8FAFBD] border-b border-[#14527A]/60 flex items-center justify-between">
                  <span>Semanas de Treino</span>
                  <span className="text-[10px] text-[#FFAA00] font-mono font-bold">
                    {weeks.length} {weeks.length === 1 ? 'semana' : 'semanas'}
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 py-1 pr-1 no-scrollbar">
                  {weeks.map((week) => {
                    const isSelected = week.id === selectedWeekId;
                    return (
                      <div
                        key={week.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-[#FFAA00] text-[#031F38] font-black shadow-md shadow-[#FFAA00]/20'
                            : 'hover:bg-[#0B3A61] text-[#E8F4F8]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectWeek(week.id)}
                          className="flex-1 flex items-center gap-2 text-left min-w-0 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-bold truncate">{week.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ml-auto mr-1 ${
                              isSelected
                                ? 'bg-[#031F38]/20 text-[#031F38]'
                                : 'bg-[#031F38] text-[#8FAFBD]'
                            }`}
                          >
                            {week.routines.length}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsWeekMenuOpen(false);
                            setWeekToDelete(week);
                          }}
                          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ml-1.5 cursor-pointer ${
                            isSelected
                              ? 'text-white/80 hover:text-white hover:bg-black/20'
                              : 'text-[#64879A] hover:text-[#FF5C5C] hover:bg-[#FF5C5C]/20'
                          }`}
                          title={`Excluir ${week.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Botão para criar nova semana no rodapé do menu */}
                <div className="pt-2 border-t border-[#14527A]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWeekMenuOpen(false);
                      handleOpenCreateModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] border border-[#14527A] text-[#FFAA00] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Nova Semana</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Ações da Barra Superior: + Nova Semana e Botão Excluir Semana Ativa */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="apple-press flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] text-xs font-black shadow-sm transition-all cursor-pointer"
            title="Criar nova semana de treinos"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden xs:inline">Nova Semana</span>
          </button>

          <button
            type="button"
            onClick={() => setWeekToDelete(selectedWeek)}
            className="apple-press p-2 rounded-xl bg-[#031F38] hover:bg-[#FF5C5C]/20 border border-[#14527A] hover:border-[#FF5C5C]/40 text-[#64879A] hover:text-[#FF5C5C] transition-all cursor-pointer"
            title={`Excluir ${selectedWeek?.name || 'Semana'}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Barra de Preferências e Áudio dos Treinos (Área Externa - Imagem 1) */}
      <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl apple-glass border border-[#14527A] shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleAudioEnabled}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs ${
              isAudioEnabled
                ? 'bg-[#FFAA00]/15 border-[#FFAA00]/40 text-[#FFAA00] hover:bg-[#FFAA00]/25'
                : 'bg-[#031F38] border-[#14527A] text-[#64879A] hover:text-[#8FAFBD]'
            }`}
            title={
              isAudioEnabled
                ? 'Sons de treino ativados em volume alto (toque para silenciar)'
                : 'Sons de treino silenciados (toque para ativar)'
            }
          >
            {isAudioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Sound Theme: Mario vs Academia */}
          {isAudioEnabled && (
            <button
              type="button"
              onClick={toggleSoundTheme}
              className={`apple-press px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                soundTheme === 'mario'
                  ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25'
                  : 'bg-[#0B3A61] border-[#14527A] text-[#8FAFBD] hover:text-[#E8F4F8]'
              }`}
              title={
                soundTheme === 'mario'
                  ? 'Sons do Super Mario World ativos (Moeda na série, 1-UP no descanso). Toque para modo Academia.'
                  : 'Sons de Cronômetro da Academia ativos. Toque para ativar o Super Mario World.'
              }
            >
              <span>{soundTheme === 'mario' ? '🍄 Mario' : '🔔 Academia'}</span>
            </button>
          )}

          {/* Smart Auto-Fill toggle */}
          <button
            type="button"
            onClick={toggleSmartAutoFill}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs ${
              isSmartAutoFillEnabled
                ? 'bg-[#00C98B]/15 border-[#00C98B]/40 text-[#00C98B] hover:bg-[#00C98B]/25'
                : 'bg-[#031F38] border-[#14527A] text-[#64879A] hover:text-[#8FAFBD]'
            }`}
            title={
              isSmartAutoFillEnabled
                ? 'Auto-preenchimento inteligente de cargas ativado'
                : 'Auto-preenchimento desativado'
            }
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Auto-save status badge */}
          <div
            className="p-1 px-2.5 rounded-xl bg-[#00C98B]/10 border border-[#00C98B]/20 text-[#00C98B] flex items-center gap-1.5 text-xs font-bold shadow-xs"
            title="Todas as séries e anotações dos treinos são gravadas automaticamente no seu aparelho"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Salvo automaticamente</span>
          </div>
        </div>
      </div>

      {/* Lista de Treinos da Semana Selecionada */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD]">
              Treinos da {selectedWeek?.name || 'Semana'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#0B3A61] text-[#FFAA00] font-mono font-bold">
              {selectedWeek?.routines.length} treinos
            </span>
          </div>

          <button
            type="button"
            onClick={() => setWeekToDelete(selectedWeek)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#64879A] hover:text-[#FF5C5C] transition-colors cursor-pointer"
            title={`Excluir ${selectedWeek?.name}`}
          >
            <Trash2 className="w-3 h-3" />
            <span>Excluir Semana</span>
          </button>
        </div>

        {selectedWeek?.routines.map((routine) => {
          const draft = loadRoutineDraft(routine.id, selectedWeek.id);
          const completedSetsCount = draft?.exerciseLogs
            ? Object.values(draft.exerciseLogs).reduce(
                (acc, sets) => acc + (Array.isArray(sets) ? sets.filter((s) => s.completed).length : 0),
                0
              )
            : 0;
          const hasRealProgress = Boolean(draft);
          const isExpanded = expandedPreviewRoutineId === routine.id;

          const lastLog = findLastWorkoutForRoutine(workoutLogs, weeks, selectedWeek.id, routine.id);

          return (
            <div
              key={routine.id}
              id={`routine-card-${routine.id}`}
              className="apple-inset-card bg-[#082F52] border border-[#14527A] p-4 shadow-md hover:border-[#FFAA00]/50 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Lado Esquerdo: Código do Treino e Músculos */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#031F38] border border-[#14527A] flex items-center justify-center font-black text-xl text-[#FFAA00] shadow-inner flex-shrink-0 group-hover:scale-105 group-hover:border-[#FFAA00] transition-all">
                    {routine.code}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-[#E8F4F8]">
                        {routine.name}
                      </h3>
                      {hasRealProgress && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Em andamento{completedSetsCount > 0 ? ` (${completedSetsCount} séries)` : ''}
                        </span>
                      )}
                      {lastLog && (
                        <span className="text-[10px] text-[#8FAFBD]">
                          Feito em: {new Date(lastLog.completedAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-[#FFAA00] mt-0.5">
                      {routine.targetMuscles}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#8FAFBD] mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-[#38C6D9]" />
                        {routine.exercises.length} exercícios
                      </span>
                      <span>•</span>
                      <span>Descanso: {routine.restIntervalText}</span>
                      {routine.aerobics && (
                        <>
                          <span>•</span>
                          <span className="text-[#FFD166] flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {routine.aerobics.postWorkoutMin}m cardio pós
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center flex-shrink-0">
                  {hasRealProgress && (
                    <button
                      type="button"
                      onClick={() => setRoutineToReset(routine)}
                      className="apple-press p-2 sm:p-2.5 rounded-xl bg-[#031F38] hover:bg-[#FF5C5C]/20 border border-[#14527A] hover:border-[#FF5C5C]/40 text-[#64879A] hover:text-[#FF5C5C] transition-all cursor-pointer shadow-xs active:scale-95"
                      title={`Reiniciar anotações do ${routine.name}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPreviewRoutineId(isExpanded ? null : routine.id)
                    }
                    className="apple-press px-3 py-2 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] border border-[#14527A] text-xs font-semibold text-[#8FAFBD] hover:text-[#E8F4F8] transition-colors cursor-pointer"
                  >
                    {isExpanded ? 'Ocultar' : 'Ver Exercícios'}
                  </button>

                  <button
                    id={`btn-start-${routine.id}`}
                    type="button"
                    onClick={() => onStartWorkout(routine.id, selectedWeek.id)}
                    className="apple-press flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-black text-xs shadow-md shadow-[#FFAA00]/25 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{hasRealProgress ? 'Continuar Treino' : 'Iniciar Treino'}</span>
                  </button>
                </div>
              </div>

              {/* Lista Prévia de Exercícios (Expandível) */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[#14527A] space-y-1.5 animate-fadeIn">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64879A] block mb-1">
                    Exercícios prescritos neste dia:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {routine.exercises.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#031F38]/60 border border-[#14527A]/50 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#082F52] text-[#8FAFBD] font-mono text-[10px] flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-[#E8F4F8] font-medium truncate">
                            {ex.name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 pl-2">
                          <span className="font-mono font-bold text-[#FFAA00]">
                            {ex.sets}x{ex.reps}
                          </span>
                          {ex.advancedTechniqueNotes && (
                            <span className="block text-[9px] text-[#38C6D9] truncate max-w-[90px]">
                              {ex.advancedTechniqueNotes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para Adicionar Nova Semana */}
      {isNewWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#082F52] border border-[#14527A] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#14527A] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#E8F4F8]">
                    Criar Nova Semana de Treino
                  </h3>
                  <p className="text-xs text-[#8FAFBD]">
                    Organize seus treinos por período ou importe novo Excel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewWeekModalOpen(false)}
                className="p-1 rounded-lg text-[#8FAFBD] hover:text-[#E8F4F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD] block mb-1">
                  Nome da Semana:
                </label>
                <input
                  type="text"
                  value={newWeekName}
                  onChange={(e) => setNewWeekName(e.target.value)}
                  placeholder="Ex: Semana 2, Semana 3, Mesociclo 2..."
                  className="w-full px-3 py-2 rounded-xl bg-[#031F38] border border-[#14527A] text-[#E8F4F8] font-bold text-sm focus:outline-none focus:border-[#FFAA00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD] block mb-1">
                  Como preencher os treinos desta semana?
                </label>

                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      createOption === 'copy'
                        ? 'bg-[#0B3A61] border-[#FFAA00]'
                        : 'bg-[#031F38] border-[#14527A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="createOption"
                      checked={createOption === 'copy'}
                      onChange={() => setCreateOption('copy')}
                      className="mt-1 accent-[#FFAA00]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#E8F4F8]">
                        <Copy className="w-3.5 h-3.5 text-[#FFAA00]" />
                        <span>Duplicar da Semana Anterior (Recomendado)</span>
                      </div>
                      <p className="text-[11px] text-[#8FAFBD] mt-0.5">
                        Copia os mesmos exercícios para focar na progressão contínua de cargas.
                      </p>
                      {createOption === 'copy' && (
                        <div className="mt-2">
                          <label className="text-[10px] text-[#64879A] uppercase font-bold block mb-1">
                            Copiar treinos de:
                          </label>
                          <select
                            value={copySourceWeekId}
                            onChange={(e) => setCopySourceWeekId(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#082F52] border border-[#14527A] text-xs font-bold text-[#E8F4F8] focus:outline-none"
                          >
                            {weeks.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name} ({w.routines.length} treinos)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      createOption === 'excel'
                        ? 'bg-[#0B3A61] border-[#FFAA00]'
                        : 'bg-[#031F38] border-[#14527A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="createOption"
                      checked={createOption === 'excel'}
                      onChange={() => setCreateOption('excel')}
                      className="mt-1 accent-[#FFAA00]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#E8F4F8]">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#38C6D9]" />
                        <span>Importar Nova Planilha Excel (.xlsx)</span>
                      </div>
                      <p className="text-[11px] text-[#8FAFBD] mt-0.5">
                        Lê um novo arquivo enviado pelo seu personal com treinos divididos.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      createOption === 'twin'
                        ? 'bg-[#0B3A61] border-[#FFAA00]'
                        : 'bg-[#031F38] border-[#14527A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="createOption"
                      checked={createOption === 'twin'}
                      onChange={() => setCreateOption('twin')}
                      className="mt-1 accent-[#FFAA00]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#E8F4F8]">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
                        <span>Modelo Base Consultoria Twin</span>
                      </div>
                      <p className="text-[11px] text-[#8FAFBD] mt-0.5">
                        Inicia com os 6 treinos padrão de hipertrofia da consultoria (A ao F).
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {weekError && <p role="alert" className="text-xs text-red-300">{weekError}</p>}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#14527A]">
              <button
                type="button"
                onClick={() => setIsNewWeekModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#8FAFBD] hover:text-[#E8F4F8]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateWeek}
                className="px-4 py-2 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-black text-xs shadow-md shadow-[#FFAA00]/25 transition-all"
              >
                {createOption === 'excel' ? 'Ir para Importação' : 'Criar Semana'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Exclusão de Semana */}
      {weekToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#082F52] border border-[#14527A] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF5C5C]/20 border border-[#FF5C5C]/30 text-[#FF5C5C] flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-[#E8F4F8] leading-tight">
                  {weeks.length <= 1 ? `Excluir e Resetar ${weekToDelete.name}?` : `Excluir ${weekToDelete.name}?`}
                </h3>
                <p className="text-xs text-[#8FAFBD] mt-1">
                  {weeks.length <= 1 ? (
                    <>
                      Esta é a sua única semana. A ficha será substituída por uma nova Semana 1.
                    </>
                  ) : (
                    <>
                      A ficha com {weekToDelete.routines.length} treinos será removida.
                    </>
                  )}
                  {' '}Você perderá acesso aos rascunhos desta ficha. Os treinos concluídos continuarão no histórico.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#031F38] border border-[#14527A] text-xs text-[#8FAFBD] space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Divisão de treinos:</span>
                <span className="font-bold text-[#FFAA00]">
                  {weekToDelete.routines.map((r) => r.code).join(' • ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Criada em:</span>
                <span className="font-medium text-[#E8F4F8]">
                  {new Date(weekToDelete.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {weekError && <p role="alert" className="text-xs text-red-300">{weekError}</p>}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#14527A]">
              <button
                type="button"
                onClick={() => {
                  setWeekToDelete(null);
                  setWeekError('');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#8FAFBD] hover:text-[#E8F4F8] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteWeek}
                className="px-4 py-2 rounded-xl bg-[#FF5C5C] hover:bg-[#E04848] text-white font-black text-xs shadow-md shadow-[#FF5C5C]/25 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{weeks.length <= 1 ? 'Sim, Excluir e Resetar' : 'Sim, Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Reiniciar Treino (Área Externa) */}
      {routineToReset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#082F52] border border-[#14527A] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[#FF5C5C] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#E8F4F8]">
                Reiniciar Treino {routineToReset.code}?
              </h3>
              <p className="text-xs text-[#8FAFBD] mt-1.5 leading-relaxed">
                Todas as séries marcadas e anotações deste treino voltarão ao estado inicial. Use apenas se desejar recomeçar os lançamentos.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoutineToReset(null)}
                className="py-2.5 px-4 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] text-[#8FAFBD] hover:text-[#E8F4F8] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResetRoutine}
                className="py-2.5 px-4 rounded-xl bg-[#FF5C5C] hover:brightness-110 text-white font-black text-xs transition-colors shadow-md shadow-[#FF5C5C]/20 cursor-pointer"
              >
                Sim, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
