import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Check,
  Dumbbell,
  Info,
  Flame,
  Plus,
  Minus,
  Trash2,
  Trophy,
  History,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Timer,
  Play,
  Pause,
  Clock,
  Copy,
  FastForward,
  X,
  Volume2,
  VolumeX,
  Zap,
  Eye,
  EyeOff,
  Youtube,
} from 'lucide-react';
import { Routine, RoutineExercise, SetLog, ExerciseLogEntry, WorkoutLog, WorkoutRestTimer } from '../types';
import {
  getLastSessionForExercise,
  addWorkoutLog,
  loadRoutineDraft,
  saveRoutineDraft,
  clearRoutineDraft,
  newRecordId,
} from '../services/storage';
import {
  playRestTimerCompleteSound,
  triggerHapticFeedback,
  triggerLightHaptic,
  playSetCompletedSound,
  playWeightClickSound,
  playCountdownTickSound,
  playWorkoutFinishedSound,
  isAudioFeedbackEnabled,
  setAudioFeedbackEnabled,
  getAudioSoundTheme,
  setAudioSoundTheme,
  SoundThemeMode,
} from '../utils/workoutFeedback';
import { findExerciseVideo } from '../data/exerciseVideosData';
import { ExerciseVideoModal } from './ExerciseVideoModal';

interface Props {
  routines: Routine[];
  selectedRoutineId: string;
  profileId: string;
  weekId: string;
  weekName?: string;
  onSelectRoutine: (routineId: string) => void;
  onOpenTechniqueModal: (techniqueId: string) => void;
  onViewHistoryForExercise: (exerciseName: string) => void;
  onBackToWeeks?: () => void;
}

// Componente para input de peso com suporte total a frações (vírgula e ponto) e classes customizadas
interface WeightFieldProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
}

const WeightField: React.FC<WeightFieldProps> = ({ id, value, onChange, disabled, className }) => {
  const formatNumberToText = (val: number): string => {
    if (!val || val === 0) return '';
    return String(Math.round(val * 100) / 100).replace('.', ',');
  };

  const [text, setText] = useState<string>(() => formatNumberToText(value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setText(formatNumberToText(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const normalized = inputVal.replace('.', ',');

    if (!/^\d*(,\d{0,2})?$/.test(normalized)) {
      return;
    }

    setText(normalized);

    if (normalized === '' || normalized === ',') {
      onChange(0);
      return;
    }

    if (normalized.endsWith(',')) {
      return;
    }

    const numericStr = normalized.replace(',', '.');
    const parsed = parseFloat(numericStr);
    if (!isNaN(parsed)) {
      onChange(Math.round(parsed * 100) / 100);
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (text.trim() === '' || text === ',') {
      onChange(0);
      setText('');
      return;
    }

    const cleanStr = text.replace(',', '.').trim();
    const parsed = parseFloat(cleanStr);
    if (!isNaN(parsed) && parsed > 0) {
      const rounded = Math.round(parsed * 100) / 100;
      onChange(rounded);
      setText(String(rounded).replace('.', ','));
    } else {
      onChange(0);
      setText('');
    }
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      disabled={disabled}
      value={text}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="0"
      className={
        className ||
        'w-full text-center font-mono font-black text-xs sm:text-sm bg-transparent text-[#E8F4F8] placeholder-[#64879A] focus:outline-none min-w-0 px-0.5'
      }
    />
  );
};

function getRestSeconds(timer: WorkoutRestTimer | undefined, now: number): number {
  if (!timer) return 0;
  if ('pausedSeconds' in timer) return timer.pausedSeconds;
  return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
}

function generateInitialLogsForRoutine(routine: Routine, profileId: string): Record<string, SetLog[]> {
  return Object.fromEntries(routine.exercises.map((exercise) => {
    const past = getLastSessionForExercise(exercise.name, profileId)?.weights ?? [];
    const targetReps = parseInt(exercise.reps.match(/\d+/)?.[0] ?? '8', 10);
    const sets = Array.from({ length: exercise.sets }, (_, index) => ({
      setNumber: index + 1,
      weightKg: past[index] ?? past[0] ?? 0,
      repsCompleted: targetReps,
      completed: false,
      techniqueApplied: false,
    }));
    return [exercise.id, sets];
  }));
}

export const WorkoutActiveView: React.FC<Props> = ({
  routines,
  selectedRoutineId,
  profileId,
  weekId,
  weekName,
  onSelectRoutine,
  onOpenTechniqueModal,
  onViewHistoryForExercise,
  onBackToWeeks,
}) => {
  const currentRoutine = useMemo(
    () => routines.find((r) => r.id === selectedRoutineId) || routines[0],
    [routines, selectedRoutineId]
  );

  const [showRoutineSwitcher, setShowRoutineSwitcher] = useState(false);

  // O componente é remontado quando muda o perfil, a semana ou o treino.
  const [draft] = useState(() => loadRoutineDraft(currentRoutine.id, weekId, profileId));
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(draft?.selectedExerciseId);
  const [sessionStartTime, setSessionStartTime] = useState(() => new Date(draft?.sessionStartTime ?? Date.now()));
  const [timerBase, setTimerBase] = useState(draft?.elapsedSeconds ?? 0);
  const [timerStartedAt, setTimerStartedAt] = useState(() => {
    if (!draft?.isTimerRunning) return null;
    const lastSavedAt = Date.parse(draft.updatedAt);
    return draft.timerStartedAt ?? (Number.isFinite(lastSavedAt) ? lastSavedAt : Date.now());
  });
  const [clockNow, setClockNow] = useState(Date.now);
  const isTimerRunning = timerStartedAt !== null;
  const elapsedAt = (now: number) => timerBase + (
    timerStartedAt === null ? 0 : Math.max(0, Math.floor((now - timerStartedAt) / 1000))
  );
  const timerSeconds = elapsedAt(clockNow);

  const startTimer = () => {
    const now = Date.now();
    setClockNow(now);
    setTimerStartedAt(now);
  };
  const pauseTimer = () => {
    setTimerBase(elapsedAt(Date.now()));
    setTimerStartedAt(null);
  };
  const resetTimer = () => {
    setTimerBase(0);
    setTimerStartedAt(null);
  };

  // Header stats & details collapsed state (Padrão: sempre recolhido)
  const [isHeaderDetailsCollapsed, setIsHeaderDetailsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('workout_header_details_collapsed');
      return saved !== null ? saved === 'true' : true; // Padrão sempre recolhido
    } catch {
      return true;
    }
  });

  const toggleHeaderDetailsCollapse = () => {
    setIsHeaderDetailsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('workout_header_details_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Rest timer state (between sets)
  const [restTimer, setRestTimer] = useState<WorkoutRestTimer | undefined>(draft?.restTimer);
  const restEndsAt = restTimer && 'endsAt' in restTimer ? restTimer.endsAt : undefined;
  const restTimerSeconds = getRestSeconds(restTimer, clockNow);
  const isRestTimerActive = restEndsAt !== undefined && restTimerSeconds > 0;
  const lastRestSignal = useRef<string | null>(
    restEndsAt !== undefined && restTimerSeconds === 0 ? `${restEndsAt}:0` : null
  );

  // Exercise entries state
  const [exerciseLogs, setExerciseLogs] = useState(() => {
    const initial = generateInitialLogsForRoutine(currentRoutine, profileId);
    for (const id of Object.keys(initial)) {
      const saved = draft?.exerciseLogs[id];
      if (Array.isArray(saved) && saved.length) initial[id] = saved;
    }
    return initial;
  });
  const [exerciseNotes, setExerciseNotes] = useState(() => draft?.exerciseNotes ?? {});
  const initialLogs = useRef(exerciseLogs);
  const keepDraft = useRef(Boolean(draft));
  const draftSuspended = useRef(false);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Record<string, boolean>>(() =>
    draft?.selectedExerciseId ? { [draft.selectedExerciseId]: true } : {});
  useEffect(() => {
    if (draft?.selectedExerciseId) {
      document.getElementById(`exercise-card-${draft.selectedExerciseId}`)?.scrollIntoView({ block: 'start' });
    }
  }, [draft]);
  // Collapsed state for the "FINALIZADOS" section - starts collapsed by default
  const [isCompletedGroupOpen, setIsCompletedGroupOpen] = useState<boolean>(false);

  // Safety confirmation for deleting a set (key: `${exerciseId}_${setIndex}`)
  const [deletingSetKey, setDeletingSetKey] = useState<string | null>(null);

  // Safety confirmation for clearing all sets of an exercise (exerciseId)
  const [clearingExerciseId, setClearingExerciseId] = useState<string | null>(null);

  // Warning for uncompleted sets before finishing
  const [isPendingSetsWarningOpen, setIsPendingSetsWarningOpen] = useState(false);

  // Finalize / Calories dialog state
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [finishCalories, setFinishCalories] = useState<string>('');
  const [finishNotes, setFinishNotes] = useState<string>('');
  const [finishError, setFinishError] = useState('');

  // Summary dialog state
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [lastSavedLog, setLastSavedLog] = useState<WorkoutLog | null>(null);

  // Confirmation modal state for resetting
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Exercise Execution Video modal state
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    category?: string;
    videoUrl: string;
    notes?: string;
  } | null>(null);

  // Audio feedback toggle (Sons de treino em volume alto para academia / Nintendo Mario)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(() => isAudioFeedbackEnabled());
  const [soundTheme, setSoundTheme] = useState<SoundThemeMode>(() => getAudioSoundTheme());

  const toggleSoundTheme = () => {
    const nextTheme: SoundThemeMode = soundTheme === 'mario' ? 'gym' : 'mario';
    setSoundTheme(nextTheme);
    setAudioSoundTheme(nextTheme);
    if (isAudioEnabled) {
      if (nextTheme === 'mario') {
        playSetCompletedSound(); // Moeda clássica do Mario!
      } else {
        playCountdownTickSound();
      }
      triggerLightHaptic();
    }
  };

  const toggleAudioEnabled = () => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      setAudioFeedbackEnabled(next);
      if (next) {
        if (soundTheme === 'mario') {
          playSetCompletedSound(); // Toca a moeda do Mario ao ligar!
        } else {
          playCountdownTickSound();
        }
        triggerLightHaptic();
      }
      return next;
    });
  };

  // Smart Auto-Fill toggle (Preenchimento Automático Inteligente)
  const [isSmartAutoFillEnabled, setIsSmartAutoFillEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('workout_smart_autofill');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSmartAutoFill = () => {
    setIsSmartAutoFillEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('workout_smart_autofill', String(next));
      } catch {}
      if (next) {
        playWeightClickSound(true);
        triggerLightHaptic();
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isTimerRunning && !isRestTimerActive) return;
    const tick = () => setClockNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('pageshow', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('pageshow', tick);
      window.removeEventListener('focus', tick);
    };
  }, [isTimerRunning, isRestTimerActive, restEndsAt]);

  useEffect(() => {
    if (restEndsAt === undefined || restTimerSeconds > 3) return;
    const signal = `${restEndsAt}:${restTimerSeconds}`;
    if (signal === lastRestSignal.current) return;
    lastRestSignal.current = signal;
    if (restTimerSeconds === 0) {
      playRestTimerCompleteSound();
      triggerHapticFeedback();
    } else {
      playCountdownTickSound();
      triggerLightHaptic();
    }
  }, [restEndsAt, restTimerSeconds]);

  // Formatted timer display (HH:MM:SS or MM:SS)
  const formattedTimer = useMemo(() => {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, [timerSeconds]);

  // Grave os horários na mesma atualização que inicia, pausa ou encerra a contagem.
  useLayoutEffect(() => {
    if (draftSuspended.current) return;
    const hasChanges = selectedExerciseId || exerciseLogs !== initialLogs.current || timerBase > 0 || isTimerRunning || restTimer ||
      Object.values(exerciseNotes).some((note) => typeof note === 'string' && note.trim().length > 0);
    if (!hasChanges && !keepDraft.current) return;
    keepDraft.current = true;

    saveRoutineDraft({
      routineId: currentRoutine.id,
      weekId,
      selectedExerciseId,
      sessionStartTime: sessionStartTime.toISOString(),
      elapsedSeconds: timerBase,
      isTimerRunning,
      timerStartedAt: timerStartedAt ?? undefined,
      restTimer,
      exerciseLogs,
      exerciseNotes,
      updatedAt: new Date().toISOString(),
    }, profileId);
  }, [exerciseLogs, exerciseNotes, selectedExerciseId, currentRoutine.id, weekId, profileId, sessionStartTime, timerBase, isTimerRunning, timerStartedAt, restTimer]);

  // Calculations
  const stats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;
    let totalTonnage = 0;

    (Object.values(exerciseLogs) as SetLog[][]).forEach((sets) => {
      sets.forEach((s) => {
        totalSets++;
        if (s.completed) {
          completedSets++;
          totalTonnage += s.weightKg * s.repsCompleted;
        }
      });
    });

    const percent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    return { totalSets, completedSets, totalTonnage, percent };
  }, [exerciseLogs]);

  // Handler: update a set with smart auto-fill
  const updateSet = (exerciseId: string, setIndex: number, field: keyof SetLog, value: any) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!currentSets[setIndex] || currentSets[setIndex][field] === value) return prev;

      const previousWeight = currentSets[setIndex].weightKg || 0;
      currentSets[setIndex] = {
        ...currentSets[setIndex],
        [field]: value,
      };

      // PREENCHIMENTO AUTOMÁTICO INTELIGENTE:
      // Se alterou a carga (weightKg) e o auto-fill estiver ativo:
      // Preenche automaticamente as séries seguintes que ainda NÃO foram concluídas
      // e que estavam com 0 kg ou com a mesma carga anterior da série editada
      if (
        field === 'weightKg' &&
        isSmartAutoFillEnabled &&
        typeof value === 'number' &&
        value > 0
      ) {
        for (let i = setIndex + 1; i < currentSets.length; i++) {
          if (!currentSets[i].completed && (currentSets[i].weightKg === 0 || currentSets[i].weightKg === previousWeight)) {
            currentSets[i] = {
              ...currentSets[i],
              weightKg: value,
            };
          }
        }
      }

      return {
        ...prev,
        [exerciseId]: currentSets,
      };
    });
  };

  // Quick increment/decrement for weight with audio feedback & smart propagation
  const incrementWeight = (exerciseId: string, setIndex: number, delta: number) => {
    playWeightClickSound(delta > 0);
    triggerLightHaptic();
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!currentSets[setIndex]) return prev;
      const currentWeight = currentSets[setIndex].weightKg || 0;
      const nextWeight = Math.max(0, Math.round((currentWeight + delta) * 100) / 100);
      currentSets[setIndex] = {
        ...currentSets[setIndex],
        weightKg: nextWeight,
      };

      // PREENCHIMENTO AUTOMÁTICO INTELIGENTE:
      if (isSmartAutoFillEnabled && nextWeight > 0) {
        for (let i = setIndex + 1; i < currentSets.length; i++) {
          if (!currentSets[i].completed && (currentSets[i].weightKg === 0 || currentSets[i].weightKg === currentWeight)) {
            currentSets[i] = {
              ...currentSets[i],
              weightKg: nextWeight,
            };
          }
        }
      }

      return {
        ...prev,
        [exerciseId]: currentSets,
      };
    });
  };

  // Quick increment/decrement for reps (preserved for compatibility)
  const incrementReps = (exerciseId: string, setIndex: number, delta: number) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!currentSets[setIndex]) return prev;
      const currentReps = currentSets[setIndex].repsCompleted || 0;
      const nextReps = Math.max(1, currentReps + delta);
      currentSets[setIndex] = {
        ...currentSets[setIndex],
        repsCompleted: nextReps,
      };
      return {
        ...prev,
        [exerciseId]: currentSets,
      };
    });
  };

  // Copy weight from previous set (setIndex - 1)
  const copyWeightFromPreviousSet = (exerciseId: string, setIndex: number) => {
    if (setIndex <= 0) return;
    playWeightClickSound(true);
    triggerLightHaptic();
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (!currentSets[setIndex] || !currentSets[setIndex - 1]) return prev;
      const prevWeight = currentSets[setIndex - 1].weightKg || 0;
      currentSets[setIndex] = {
        ...currentSets[setIndex],
        weightKg: prevWeight,
      };
      return {
        ...prev,
        [exerciseId]: currentSets,
      };
    });
  };

  // Preencher todas as séries pendentes com os valores do histórico anterior
  const fillSetsWithLastSession = (exerciseId: string, pastWeights: number[]) => {
    playWeightClickSound(true);
    triggerLightHaptic();
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      const defaultWeight = pastWeights.length > 0 ? pastWeights[0] : 0;
      return {
        ...prev,
        [exerciseId]: currentSets.map((s, idx) => ({
          ...s,
          weightKg: !s.completed ? (pastWeights[idx] !== undefined ? pastWeights[idx] : defaultWeight) : s.weightKg,
        })),
      };
    });
  };

  // Rest timer controls
  const adjustRestTimer = (delta: number) => {
    const now = Date.now();
    const remaining = getRestSeconds(restTimer, now);
    if (remaining === 0) return;
    const adjusted = Math.max(5, remaining + delta);
    setClockNow(now);
    setRestTimer(restEndsAt === undefined ? { pausedSeconds: adjusted } : { endsAt: now + adjusted * 1000 });
  };

  const toggleRestTimer = () => {
    const now = Date.now();
    const remaining = getRestSeconds(restTimer, now);
    setClockNow(now);
    if (remaining === 0) return;
    setRestTimer(restEndsAt === undefined ? { endsAt: now + remaining * 1000 } : { pausedSeconds: remaining });
  };

  const dismissRestTimer = () => {
    setRestTimer(undefined);
  };

  // Handler: toggle set completed
  const toggleSetCompleted = (exercise: RoutineExercise, setIndex: number) => {
    const currentSets = [...(exerciseLogs[exercise.id] ?? [])];
    const set = currentSets[setIndex];
    if (!set) return;
    setSelectedExerciseId(exercise.id);
    const completed = !set.completed;
    const targetReps = parseInt(String(exercise.reps).match(/\d+/)?.[0] || '10', 10);
    currentSets[setIndex] = { ...set, repsCompleted: set.repsCompleted || targetReps, completed };

    if (completed) {
      playSetCompletedSound();
      triggerHapticFeedback();
      if (isSmartAutoFillEnabled && set.weightKg > 0) {
        for (let i = setIndex + 1; i < currentSets.length; i++) {
          if (!currentSets[i].completed && currentSets[i].weightKg === 0) {
            currentSets[i] = { ...currentSets[i], weightKg: set.weightKg };
          }
        }
      }

      const restSeconds = exercise.defaultRestSeconds || currentRoutine.restIntervalSeconds || 90;
      const now = Date.now();
      setClockNow(now);
      setRestTimer({ endsAt: now + restSeconds * 1000 });
    }

    setExerciseLogs((prev) => ({ ...prev, [exercise.id]: currentSets }));
  };

  // Handler: repeat weight from previous set to all remaining sets
  const copyWeightToNextSets = (exerciseId: string, sourceIndex: number) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      const sourceWeight = currentSets[sourceIndex]?.weightKg || 0;
      for (let i = sourceIndex + 1; i < currentSets.length; i++) {
        if (currentSets[i].completed) continue;
        currentSets[i] = {
          ...currentSets[i],
          weightKg: sourceWeight,
        };
      }
      return {
        ...prev,
        [exerciseId]: currentSets,
      };
    });
  };

  // Handler: add extra set
  const addExtraSet = (exerciseId: string) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      const lastSet = currentSets[currentSets.length - 1];
      const newSet: SetLog = {
        setNumber: currentSets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 0,
        repsCompleted: lastSet ? lastSet.repsCompleted : 8,
        completed: false,
        techniqueApplied: false,
      };
      return {
        ...prev,
        [exerciseId]: [...currentSets, newSet],
      };
    });
  };

  // Handler: remove set
  const removeSet = (exerciseId: string, setIndex: number) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (currentSets.length <= 1) return prev;
      currentSets.splice(setIndex, 1);
      // Re-number
      const renumbered = currentSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return {
        ...prev,
        [exerciseId]: renumbered,
      };
    });
    setDeletingSetKey(null);
  };

  // Handler: Clear/reset all sets of a specific exercise back to clean initial state
  const handleClearExerciseSets = (exerciseId: string) => {
    const exercise = currentRoutine.exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const targetRepsNum = parseInt(exercise.reps.split(/[^0-9]/)[0], 10) || 8;
    const freshSets: SetLog[] = [];
    for (let i = 1; i <= exercise.sets; i++) {
      freshSets.push({
        setNumber: i,
        weightKg: 0,
        repsCompleted: targetRepsNum,
        completed: false,
        techniqueApplied: false,
      });
    }

    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: freshSets,
    }));

    setExerciseNotes((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });

    setExpandedExerciseIds((prev) => ({
      ...prev,
      [exerciseId]: true,
    }));

    setClearingExerciseId(null);
  };

  // Calculation of uncompleted sets
  const uncompletedSetsCount = useMemo(() => {
    return Math.max(0, stats.totalSets - stats.completedSets);
  }, [stats.totalSets, stats.completedSets]);

  // Request to finish workout (triggers confirmation if sets are pending)
  const handleRequestFinishWorkout = () => {
    setFinishError('');
    if (uncompletedSetsCount > 0) {
      setIsPendingSetsWarningOpen(true);
    } else {
      setIsFinishModalOpen(true);
    }
  };

  // Open finish workout modal directly
  const handleOpenFinishModal = () => {
    setFinishError('');
    setIsFinishModalOpen(true);
  };

  // Confirm Finish Workout with calories & notes
  const handleConfirmFinishWorkout = () => {
    if (draftSuspended.current) return;
    const entries: ExerciseLogEntry[] = currentRoutine.exercises.map((ex) => {
      const sets = exerciseLogs[ex.id] || [];
      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetSets: ex.sets,
        targetReps: ex.reps,
        advancedTechniqueId: ex.advancedTechniqueId,
        advancedTechniqueNotes: ex.advancedTechniqueNotes,
        sets,
        notes: exerciseNotes[ex.id] || '',
      };
    });

    const durationMins = Math.max(
      1,
      Math.round(isTimerRunning || timerBase > 0
        ? elapsedAt(Date.now()) / 60
        : (Date.now() - sessionStartTime.getTime()) / 60000)
    );

    const caloriesNumber = finishCalories.trim() !== '' ? parseInt(finishCalories, 10) : undefined;

    const newLog: WorkoutLog = {
      id: newRecordId('log_'),
      userId: profileId,
      weekId,
      weekName,
      routineId: currentRoutine.id,
      routineCode: currentRoutine.code,
      routineName: `${currentRoutine.name}: ${currentRoutine.targetMuscles}`,
      targetMuscles: currentRoutine.targetMuscles,
      startedAt: sessionStartTime.toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: durationMins,
      entries,
      totalTonnageKg: stats.totalTonnage,
      caloriesBurned: !isNaN(caloriesNumber as number) ? caloriesNumber : undefined,
      notes: finishNotes.trim() || undefined,
    };

    try {
      addWorkoutLog(newLog, profileId);
    } catch {
      setFinishError('Não foi possível salvar o treino neste navegador. Libere espaço ou verifique o armazenamento e tente novamente.');
      return;
    }
    draftSuspended.current = true;
    clearRoutineDraft(currentRoutine.id, weekId, profileId);
    pauseTimer();
    dismissRestTimer();

    playWorkoutFinishedSound();
    triggerHapticFeedback();
    setLastSavedLog(newLog);
    setIsFinishModalOpen(false);
    setIsSummaryOpen(true);
  };

  const resetSession = () => {
    const freshLogs = generateInitialLogsForRoutine(currentRoutine, profileId);
    initialLogs.current = freshLogs;
    keepDraft.current = false;
    draftSuspended.current = false;
    setExerciseLogs(freshLogs);
    setExerciseNotes({});
    setSelectedExerciseId(undefined);
    setExpandedExerciseIds({});
    setIsCompletedGroupOpen(false);
    setSessionStartTime(new Date());
    resetTimer();
    dismissRestTimer();
    setFinishCalories('');
    setFinishNotes('');
    setFinishError('');
  };

  const handleConfirmReset = () => {
    clearRoutineDraft(currentRoutine.id, weekId, profileId);
    resetSession();
    setIsResetConfirmOpen(false);
  };

  // Close summary modal and advance
  const handleCloseSummary = () => {
    setIsSummaryOpen(false);

    const currentIndex = routines.findIndex((r) => r.id === currentRoutine.id);
    const nextRoutine = routines[(currentIndex + 1) % routines.length];
    if (nextRoutine && nextRoutine.id !== currentRoutine.id) {
      onSelectRoutine(nextRoutine.id);
    } else {
      resetSession();
    }
  };

  // Split exercises into pending and completed for clean, organized layout
  const { pendingExercises, completedExercises } = useMemo(() => {
    const pending: typeof currentRoutine.exercises = [];
    const completed: typeof currentRoutine.exercises = [];

    currentRoutine.exercises.forEach((ex) => {
      const sets = exerciseLogs[ex.id] || [];
      const isAllDone = sets.length > 0 && sets.every((s) => s.completed);
      if (isAllDone) {
        completed.push(ex);
      } else {
        pending.push(ex);
      }
    });

    return { pendingExercises: pending, completedExercises: completed };
  }, [currentRoutine.exercises, exerciseLogs]);

  const activeExercise = pendingExercises.find((exercise) => exercise.id === selectedExerciseId);
  const activeExerciseIndex = activeExercise ? currentRoutine.exercises.indexOf(activeExercise) : -1;

  const toggleExerciseExpand = (exerciseId: string, canSelect: boolean) => {
    const shouldSelect = canSelect && exerciseId !== activeExercise?.id;
    if (shouldSelect) setSelectedExerciseId(exerciseId);
    setExpandedExerciseIds((prev) => ({
      ...prev,
      [exerciseId]: shouldSelect || !prev[exerciseId],
    }));
  };

  const expandAllPending = () => {
    const next: Record<string, boolean> = { ...expandedExerciseIds };
    pendingExercises.forEach((ex) => {
      next[ex.id] = true;
    });
    setExpandedExerciseIds(next);
  };

  const collapseAllPending = () => {
    const next: Record<string, boolean> = { ...expandedExerciseIds };
    pendingExercises.forEach((ex) => {
      next[ex.id] = false;
    });
    setExpandedExerciseIds(next);
  };

  const renderExerciseCard = (exercise: RoutineExercise, isCompletedSection = false) => {
    const sets = exerciseLogs[exercise.id] || [];
    const lastSession = getLastSessionForExercise(exercise.name, profileId);
    const allCompleted = sets.length > 0 && sets.every((s) => s.completed);
    const isExpanded = !!expandedExerciseIds[exercise.id];
    const completedSetsCount = sets.filter((s) => s.completed).length;
    const isActive = exercise.id === activeExercise?.id;
    const selectExpandedCard = !allCompleted && !isActive && isExpanded;
    const firstUncompletedSetIndex = sets.findIndex((s) => !s.completed);
    const matchedExerciseVideo = findExerciseVideo(exercise.name);
    const originalExIdx = currentRoutine.exercises.findIndex((e) => e.id === exercise.id);

    // Summary metrics for finalized cards
    const completedWeights = sets
      .filter((s) => s.completed && s.weightKg > 0)
      .map((s) => s.weightKg);
    const maxCompletedWeight = completedWeights.length > 0 ? Math.max(...completedWeights) : 0;
    const exerciseTonnage = sets
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + (s.weightKg || 0) * (s.repsCompleted || 0), 0);

    return (
      <div
        key={exercise.id}
        id={`exercise-card-${exercise.id}`}
        className={`apple-inset-card scroll-mt-40 transition-all duration-300 overflow-hidden ${
          isActive && !allCompleted
            ? 'exercise-card-active bg-[#0B3A61] border-2 border-[#FFAA00] shadow-xl shadow-[#FFAA00]/15 ring-2 ring-[#FFAA00]/30'
            : allCompleted
            ? 'bg-[#082F52]/80 border border-[#00C98B]/40 shadow-sm opacity-70 hover:opacity-100'
            : `${activeExercise ? 'exercise-card-dimmed ' : ''}bg-[#082F52] border border-[#14527A]/50 shadow-xs`
        }`}
      >
        {/* Exercise Header (Clicking collapses / expands) */}
        <div
          onClick={() => toggleExerciseExpand(exercise.id, !allCompleted)}
          className={`p-3.5 sm:p-4 cursor-pointer select-none transition-colors ${
            isExpanded ? 'border-b border-[#14527A]' : ''
          } ${
            isActive && !allCompleted
              ? 'bg-[#0B3A61]'
              : allCompleted
              ? 'bg-[#082F52]/80 hover:bg-[#0B3A61]/40'
              : 'bg-[#082F52] hover:bg-[#0B3A61]/60'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="w-5 h-5 rounded-md bg-[#082F52] text-[#8FAFBD] border border-[#14527A] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                {originalExIdx + 1}
              </span>
              <h3
                className={`text-sm sm:text-base font-extrabold truncate ${
                  isActive && !allCompleted
                    ? 'text-[#E8F4F8]'
                    : allCompleted
                    ? 'text-[#8FAFBD]'
                    : 'text-[#E8F4F8]'
                }`}
              >
                {exercise.name}
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#082F52] text-[#8FAFBD] border border-[#14527A]">
                {exercise.sets}x{exercise.reps}
              </span>

              {/* YouTube Icon Only */}
              {matchedExerciseVideo && (
                <button
                  id={`exercise-video-btn-${exercise.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVideoModal({
                      title: matchedExerciseVideo.name,
                      category: matchedExerciseVideo.muscleGroup,
                      videoUrl: matchedExerciseVideo.videoUrl,
                    });
                  }}
                  className="p-1 rounded-md bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 hover:text-red-300 transition-all active:scale-95 inline-flex items-center justify-center cursor-pointer shadow-xs"
                  title="Assistir execução no YouTube (Leandro Twin)"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}

              {/* Active indicator badge */}
              {isActive && !allCompleted && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFAA00] animate-pulse" />
                  <span>Executando</span>
                </span>
              )}

              {/* Completed / Progress Badge */}
              {allCompleted ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00C98B]/15 text-[#00C98B] border border-[#00C98B]/30 animate-in fade-in">
                  <CheckCircle2 className="w-3 h-3 text-[#00C98B]" />
                  <span>{completedSetsCount}/{sets.length}</span>
                </span>
              ) : completedSetsCount > 0 ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <span>{completedSetsCount}/{sets.length}</span>
                </span>
              ) : null}
            </div>

            {/* Actions (Expand/Collapse Toggle) */}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => toggleExerciseExpand(exercise.id, !allCompleted)}
                className="p-1.5 sm:p-2 rounded-lg bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#8FAFBD] transition-colors"
                aria-expanded={isExpanded}
                title={selectExpandedCard ? 'Selecionar exercício' : isExpanded ? 'Recolher exercício' : 'Expandir exercício'}
              >
                {selectExpandedCard ? (
                  <Play className="w-4 h-4 text-[#00C98B]" />
                ) : isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#8FAFBD]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#00C98B]" />
                )}
              </button>
            </div>
          </div>

          {/* Advanced Technique Banner */}
          {exercise.advancedTechniqueId && isExpanded && (
            <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
              <button
                id={`tech-info-btn-${exercise.id}`}
                onClick={() => onOpenTechniqueModal(exercise.advancedTechniqueId!)}
                className="w-full group flex items-center justify-between p-2.5 rounded-xl bg-[#FFD166]/10 hover:bg-[#FFD166]/15 border border-[#FFD166]/30 text-[#FFD166] transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <span className="font-bold">
                    Técnica:{' '}
                    {exercise.advancedTechniqueNotes || exercise.advancedTechniqueId.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#FFD166]/90 group-hover:text-[#FFD166] font-semibold">
                  <span>Como executar</span>
                  <Info className="w-3.5 h-3.5" />
                </div>
              </button>
              {exercise.notes && (
                <p className="text-[11px] text-[#8FAFBD] mt-1 pl-1">{exercise.notes}</p>
              )}
            </div>
          )}
        </div>

        {/* Sets List - Hidden when collapsed */}
        {isExpanded && (
          <div
            className="p-2 sm:p-4 space-y-2 sm:space-y-3"
            onFocus={() => {
              if (!allCompleted && !isActive) setSelectedExerciseId(exercise.id);
            }}
          >
            {/* Quick Auto-Fill Prompt from previous workout if any set is empty */}
            {lastSession && sets.some((s) => !s.completed && s.weightKg === 0) && (
              <button
                type="button"
                onClick={() => fillSetsWithLastSession(exercise.id, lastSession.weights)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FFAA00]/10 hover:bg-[#FFAA00]/15 border border-[#FFAA00]/30 text-[#FFAA00] text-[11px] font-bold transition-all active:scale-[0.99] cursor-pointer shadow-xs"
                title="Preencher séries pendentes com as cargas da sessão anterior"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#FFAA00]" />
                  <span className="truncate">Auto-preencher cargas anteriores:</span>
                  <span className="text-[#E8F4F8] font-bold truncate">
                    {lastSession.weights.map((w) => `${w}kg`).join(' • ')}
                  </span>
                </div>
                <span className="text-[10px] bg-[#FFAA00]/20 hover:bg-[#FFAA00]/30 px-2 py-0.5 rounded-md font-black flex-shrink-0 text-[#FFAA00]">
                  Preencher
                </span>
              </button>
            )}

            {sets.map((set, setIdx) => {
              const isCurrentActiveSet = isActive && setIdx === firstUncompletedSetIndex;
              const pastWeight =
                lastSession && lastSession.weights[setIdx] !== undefined ? lastSession.weights[setIdx] : null;
              const isDeletingThis = deletingSetKey === `${exercise.id}_${setIdx}`;

              return (
                <div
                  key={setIdx}
                  id={`set-row-${exercise.id}-${setIdx}`}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 ${
                    set.completed
                      ? 'set-row-completed bg-[#00C98B]/10 border-[#00C98B]/40 shadow-xs'
                      : isCurrentActiveSet
                      ? 'set-row-active bg-[#082F52] border-2 border-[#FFAA00] shadow-lg shadow-[#FFAA00]/20 ring-4 ring-[#FFAA00]/25'
                      : 'set-row-dimmed bg-[#082F52]/40 hover:bg-[#082F52] border-[#14527A]/40'
                  }`}
                >
                  {/* Topo da Série: Série 1, Série 2... Alinhado na parte superior, limpo e legível */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#14527A]/30 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 shadow-xs transition-transform ${
                          set.completed
                            ? 'bg-[#00C98B] text-[#031F38]'
                            : isCurrentActiveSet
                            ? 'bg-[#FFAA00] text-[#031F38] shadow-md shadow-[#FFAA00]/30 ring-1 ring-[#FFAA00]/50 scale-105'
                            : 'bg-[#031F38] text-[#8FAFBD] border border-[#14527A]'
                        }`}
                      >
                        {set.setNumber}
                      </span>
                      <span className={`text-xs sm:text-sm font-black tracking-tight ${
                        isCurrentActiveSet ? 'text-[#E8F4F8]' : 'text-[#8FAFBD]'
                      }`}>
                        Série {set.setNumber}
                      </span>
                      {isCurrentActiveSet && !set.completed && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/40 shadow-xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFAA00]" />
                          Atual
                        </span>
                      )}
                      {set.completed && (
                        <span className="text-[10px] font-extrabold text-[#00C98B] flex items-center gap-0.5">
                          <Check className="w-3 h-3 stroke-[3]" /> Concluída
                        </span>
                      )}
                    </div>

                    {/* Excluir Série (se houver mais de 1) */}
                    {sets.length > 1 && (
                      <div>
                        {isDeletingThis ? (
                          <div className="flex items-center gap-1 bg-[#FF5C5C]/20 border border-[#FF5C5C]/40 rounded-xl p-0.5 animate-in fade-in">
                            <button
                              type="button"
                              onClick={() => {
                                removeSet(exercise.id, setIdx);
                                setDeletingSetKey(null);
                              }}
                              className="px-1.5 py-0.5 rounded-lg bg-[#FF5C5C] text-white text-[10px] font-black shadow-xs active:scale-95 cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingSetKey(null)}
                              className="px-1 py-0.5 rounded-lg bg-[#082F52] text-[#8FAFBD] text-[10px] font-bold cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingSetKey(`${exercise.id}_${setIdx}`)}
                            className="apple-press p-1 sm:p-1.5 rounded-lg hover:bg-[#FF5C5C]/15 text-[#64879A] hover:text-[#FF5C5C] transition-colors cursor-pointer"
                            title="Remover esta série"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Linha de Dados de Peso com Ícone de Histórico, Campo de Digitar Peso e Conclusão */}
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {/* Left: Ícone do Histórico ao lado dos Dados de Peso (organização em linha deixando alinhado) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <button
                        id={setIdx === 0 ? `progression-btn-${exercise.id}` : `progression-btn-${exercise.id}-${setIdx}`}
                        type="button"
                        onClick={() => onViewHistoryForExercise(exercise.name)}
                        className="apple-press p-1.5 sm:p-2 rounded-xl bg-[#031F38] hover:bg-[#0B3A61] border border-[#14527A] hover:border-[#FFAA00]/50 text-[#8FAFBD] hover:text-[#FFAA00] transition-colors shrink-0 shadow-xs cursor-pointer active:scale-90"
                        title="Ver histórico e evolução de cargas deste exercício"
                      >
                        <History className="w-4 h-4 text-[#FFAA00]" />
                      </button>

                      <div className="min-w-0">
                        {pastWeight !== null ? (
                          <div className="text-xs sm:text-sm text-[#8FAFBD] leading-tight truncate">
                            Ant: <strong className="text-[#E8F4F8] font-black">{String(pastWeight).replace('.', ',')} kg</strong>
                          </div>
                        ) : (
                          <div className="text-[11px] sm:text-xs text-[#64879A] leading-tight">
                            Carga livre
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Campo para digitar peso (sem botões -5 e +5), indicador de evolução e botão Concluir */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                      {/* Campo apenas para digitar o peso */}
                      <div className={`relative w-20 sm:w-24 h-9 sm:h-10 bg-[#031F38] border rounded-xl flex items-center px-2 shadow-inner transition-all ${
                        isCurrentActiveSet
                          ? 'border-[#FFAA00] focus-within:ring-2 focus-within:ring-[#FFAA00]/50'
                          : 'border-[#14527A] focus-within:border-[#FFAA00] focus-within:ring-2 focus-within:ring-[#FFAA00]/40'
                      }`}>
                        <WeightField
                          id={`weight-input-${exercise.id}-${setIdx}`}
                          value={set.weightKg}
                          onChange={(newVal) =>
                            updateSet(exercise.id, setIdx, 'weightKg', newVal)
                          }
                          className="w-full text-center font-black font-mono text-sm sm:text-base text-[#E8F4F8] bg-transparent focus:outline-none min-w-0 pr-4"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-[#8FAFBD] font-bold pointer-events-none select-none">
                          kg
                        </span>
                      </div>

                      <label className="flex h-9 w-16 items-center rounded-xl border border-[#14527A] bg-[#031F38] px-1.5 sm:h-10 sm:w-20">
                        <span className="sr-only">Repetições da série {set.setNumber}</span>
                        <input type="number" inputMode="numeric" min={1} max={9999}
                          value={set.repsCompleted || ''}
                          onChange={(event) => updateSet(exercise.id, setIdx, 'repsCompleted',
                            Math.max(0, Math.min(9999, Math.trunc(Number(event.target.value) || 0))))}
                          onBlur={(event) => {
                            if (!event.currentTarget.value) {
                              updateSet(exercise.id, setIdx, 'repsCompleted', Number(exercise.reps.match(/\d+/)?.[0]) || 8);
                            }
                          }}
                          className="w-full min-w-0 bg-transparent text-center text-sm font-bold" />
                        <span aria-hidden="true" className="text-[10px] text-[#8FAFBD]">rep</span>
                      </label>

                      {/* Indicador de evolução de carga */}
                      {set.weightKg > 0 && pastWeight !== null ? (
                        <div className="hidden items-center justify-center shrink-0 sm:flex">
                          {set.weightKg > pastWeight ? (
                            <span title={`Aumento de carga (+${String(Math.round((set.weightKg - pastWeight) * 10) / 10).replace('.', ',')} kg)`}>
                              <TrendingUp className="w-4 h-4 text-[#00C98B] stroke-[3]" />
                            </span>
                          ) : set.weightKg === pastWeight ? (
                            <span title="Carga mantida" className="load-icon-maintained inline-flex">
                              <ThumbsUp className="w-4 h-4 load-icon-maintained stroke-[2.8]" style={{ color: '#FBBF24' }} />
                            </span>
                          ) : (
                            <span title={`Carga reduzida (${String(Math.round((set.weightKg - pastWeight) * 10) / 10).replace('.', ',')} kg)`}>
                              <TrendingDown className="w-4 h-4 text-[#FF5C5C] stroke-[3]" />
                            </span>
                          )}
                        </div>
                      ) : null}

                    </div>
                  </div>
                      <button
                        id={`set-check-btn-${exercise.id}-${setIdx}`}
                        type="button"
                        onClick={() => toggleSetCompleted(exercise, setIdx)}
                        className={`apple-press mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                          set.completed
                            ? 'bg-[#00C98B] text-[#031F38] hover:bg-[#00B07A] shadow-sm shadow-[#00C98B]/30'
                            : isCurrentActiveSet
                            ? 'bg-[#FFAA00] text-[#031F38]'
                            : 'bg-[#031F38] hover:bg-[#0B3A61] border-2 border-[#14527A] hover:border-[#FFAA00] text-[#64879A] hover:text-[#FFAA00]'
                        }`}
                        title={
                          set.completed
                            ? 'Série concluída! Toque para desmarcar'
                            : 'Toque para marcar série como concluída'
                        }
                      >
                        <Check className="h-4 w-4" />
                        {set.completed ? 'Desmarcar série' : 'Concluir série'}
                      </button>
                </div>
              );
            })}

            {/* Exercise Footer: Add Extra Set & Clear All Sets */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#14527A]/60">
              <button
                type="button"
                onClick={() => addExtraSet(exercise.id)}
                className="text-[#FFAA00] hover:text-[#FFB82E] hover:bg-[#FFAA00]/10 text-xs font-bold flex items-center gap-1.5 transition-colors py-1.5 px-2.5 rounded-lg border border-[#FFAA00]/30 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Série Extra</span>
              </button>

              {/* Botão de Apagar Todas as Séries deste Exercício */}
              <div>
                {clearingExerciseId === exercise.id ? (
                  <div className="flex items-center gap-1 bg-[#FF5C5C]/15 border border-[#FF5C5C]/40 rounded-lg p-1 animate-in fade-in">
                    <span className="text-[10px] text-[#FF5C5C] font-black pl-1">Apagar todas?</span>
                    <button
                      type="button"
                      onClick={() => handleClearExerciseSets(exercise.id)}
                      className="px-2 py-0.5 rounded bg-[#FF5C5C] text-white text-[10px] font-black shadow-sm active:scale-95"
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setClearingExerciseId(null)}
                      className="px-1.5 py-0.5 rounded bg-[#082F52] text-[#8FAFBD] text-[10px]"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setClearingExerciseId(exercise.id)}
                    className="text-[#FF5C5C]/80 hover:text-[#FF5C5C] hover:bg-[#FF5C5C]/10 text-[11px] font-bold flex items-center gap-1 transition-colors py-1.5 px-2 rounded-lg"
                    title="Apagar todas as séries deste exercício"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#FF5C5C]" />
                    <span>Apagar Séries</span>
                  </button>
                )}
              </div>
            </div>

            {/* Status quando todas as séries forem concluídas */}
            {allCompleted && (
              <div className="pt-2.5 border-t border-[#14527A] flex items-center justify-between gap-2">
                <div className="text-xs text-[#00C98B] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Todas as séries concluídas!</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleExerciseExpand(exercise.id, false)}
                  className="px-3 py-1.5 rounded-lg bg-[#0B3A61] hover:bg-[#10466D] border border-[#14527A] text-xs font-bold text-[#8FAFBD] hover:text-[#E8F4F8] transition-colors"
                >
                  Recolher
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="workout-active-container" className="space-y-3 sm:space-y-4 pb-8">
      {/* Workout Header & Realtime HUD */}
      <div className="bg-[#082F52] border border-[#14527A] rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Chip interativo: Trocar treino diretamente pelo badge */}
              <button
                type="button"
                onClick={() => setShowRoutineSwitcher((prev) => !prev)}
                className="px-2 py-0.5 rounded-md bg-[#FFAA00]/15 hover:bg-[#FFAA00]/25 text-[#FFAA00] text-[11px] font-black uppercase tracking-wider border border-[#FFAA00]/30 transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                title="Toque para alternar o treino"
              >
                <span>Treino {currentRoutine.code}</span>
                <ChevronDown className={`w-3 h-3 text-[#FFAA00] transition-transform ${showRoutineSwitcher ? 'rotate-180' : ''}`} />
              </button>

              <span className="text-[11px] text-[#8FAFBD] flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-[#FFD166]" />
                <span>{currentRoutine.restIntervalText}</span>
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-[#E8F4F8] mt-0.5 truncate">
              {currentRoutine.targetMuscles}
            </h1>
          </div>

          {/* Botão Finalizar Treino em destaque no cabeçalho */}
          <button
            id="finish-workout-btn"
            type="button"
            onClick={handleRequestFinishWorkout}
            className="apple-press flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] shadow-md shadow-[#FFAA00]/20 transition-all active:scale-95 cursor-pointer flex-shrink-0"
            title="Finalizar treino e registrar no histórico"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#031F38]" />
            <span>Finalizar Treino</span>
          </button>
        </div>

        {/* Routine Selector Dropdown (Aberto ao tocar no chip do Treino) */}
        {showRoutineSwitcher && (
          <div className="mt-2.5 pt-2.5 border-t border-[#14527A]/50 animate-in fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8FAFBD]">
                Alternar Treino
              </span>
              <button
                type="button"
                onClick={() => setShowRoutineSwitcher(false)}
                className="text-[10px] text-[#8FAFBD] hover:text-[#E8F4F8]"
              >
                Fechar
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {routines.map((routine) => {
                const isSelected = routine.id === currentRoutine.id;
                return (
                  <button
                    key={routine.id}
                    id={`routine-pill-${routine.code.toLowerCase()}`}
                    onClick={() => {
                      onSelectRoutine(routine.id);
                      setShowRoutineSwitcher(false);
                    }}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-[#FFAA00] text-[#031F38] font-black shadow-md shadow-[#FFAA00]/25'
                        : 'bg-[#031F38] text-[#8FAFBD] hover:bg-[#0B3A61] border border-[#14527A]'
                    }`}
                  >
                    <span className="font-black text-xs">{routine.code}</span>
                    <span className={`text-[11px] truncate max-w-[90px] ${isSelected ? 'font-bold' : ''}`}>
                      {routine.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Realtime HUD: Relógio do treino, Séries e Tonelagem (informações consolidadas do rodapé) */}
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-[#031F38] border border-[#14527A] flex flex-wrap items-center justify-between gap-2 shadow-inner animate-in fade-in">
          {/* Cronômetro / Relógio com controles */}
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${isTimerRunning ? 'text-[#FFAA00] animate-pulse' : 'text-[#64879A]'}`} />
            <span className="text-sm font-black font-mono text-[#E8F4F8]">
              {formattedTimer}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                isTimerRunning
                  ? 'bg-[#00C98B]/15 text-[#00C98B]'
                  : timerSeconds > 0
                  ? 'bg-[#FFAA00]/10 text-[#FFB82E]'
                  : 'bg-[#64879A]/15 text-[#8FAFBD]'
              }`}
            >
              {isTimerRunning ? 'Ativo' : timerSeconds > 0 ? 'Pausado' : 'Parado'}
            </span>

            {/* Ações do cronômetro */}
            <div className="flex items-center gap-1 ml-0.5">
              {!isTimerRunning && timerSeconds === 0 ? (
                <button
                  type="button"
                  onClick={startTimer}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00C98B] hover:bg-[#00C98B]/90 text-[#031F38] text-[10px] font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="Iniciar contagem do tempo de treino"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Iniciar</span>
                </button>
              ) : isTimerRunning ? (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0B3A61] hover:bg-[#10466D] border border-[#14527A] text-[#FFB82E] text-[10px] font-bold active:scale-95 transition-all cursor-pointer"
                  title="Pausar cronômetro"
                >
                  <Pause className="w-2.5 h-2.5" />
                  <span>Pausar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startTimer}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#00C98B] hover:bg-[#00C98B]/90 text-[#031F38] text-[10px] font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="Retomar cronômetro"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Retomar</span>
                </button>
              )}

              {timerSeconds > 0 && (
                <button
                  type="button"
                  onClick={resetTimer}
                  className="w-6 h-6 rounded-md bg-[#082F52] hover:bg-[#0B3A61] text-[#8FAFBD] hover:text-[#E8F4F8] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                  title="Zerar cronômetro (Reset)"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Séries & Tonelagem do treino */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[#FFAA00]">{stats.completedSets} de {stats.totalSets} séries</span>
              <span className="text-[11px] text-[#8FAFBD]">({stats.percent}%)</span>
            </div>

            <span className="text-[#14527A]">•</span>

            <div className="flex items-center gap-1">
              <span className="text-[#8FAFBD] hidden xs:inline">Tonelagem:</span>
              <span className="text-[#38C6D9] font-black">{stats.totalTonnage.toLocaleString('pt-BR')} kg</span>
            </div>
          </div>
        </div>

        {/* Barra de Alternância: Manter informações adicionais recolhidas por padrão */}
        <button
          id="btn-toggle-header-details"
          type="button"
          onClick={toggleHeaderDetailsCollapse}
          className="w-full mt-2 pt-1.5 border-t border-[#14527A]/50 flex items-center justify-between text-xs text-[#8FAFBD] hover:text-[#E8F4F8] transition-colors py-0.5 group cursor-pointer"
          title={isHeaderDetailsCollapsed ? 'Ampliar estatísticas e informações do treino' : 'Recolher informações para ocupar menos espaço'}
        >
          <span className="text-[10px] text-[#8FAFBD]">
            {currentRoutine.aerobics ? 'Ver aeróbico prescrito & detalhes adicionais' : 'Ver detalhes adicionais'}
          </span>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#FFAA00] group-hover:text-[#FFB82E] transition-colors flex-shrink-0">
            <span>{isHeaderDetailsCollapsed ? 'Detalhes' : 'Ocultar'}</span>
            {isHeaderDetailsCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {/* Informações detalhadas do treino - Recolhidas por padrão */}
        {!isHeaderDetailsCollapsed && (
          <div className="space-y-3 mt-2.5 pt-1 animate-in fade-in">
            {/* Aerobics Prescription Banner from sheet */}
            {currentRoutine.aerobics && (
              <div className="p-2.5 rounded-xl bg-[#0B3A61] border border-[#14527A] flex items-center justify-between text-xs text-[#8FAFBD]">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FFAA00] flex-shrink-0" />
                  <span>
                    <strong className="text-[#E8F4F8]">Aeróbico prescrito:</strong> {currentRoutine.aerobics.postWorkoutMin} min pós-treino
                    (ou {currentRoutine.aerobics.restDayMin} min em dias sem treino)
                  </span>
                </div>
              </div>
            )}

            {/* Progress Bar & Real-time Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] text-[#64879A] uppercase tracking-wider font-semibold block mb-0.5">
                  Progresso
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-base sm:text-lg font-extrabold text-[#FFAA00]">
                    {stats.completedSets}/{stats.totalSets}
                  </span>
                  <span className="text-[11px] text-[#8FAFBD] font-medium">séries</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] text-[#64879A] uppercase tracking-wider font-semibold block mb-0.5">
                  Concluído
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#E8F4F8]">
                  {stats.percent}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] text-[#64879A] uppercase tracking-wider font-semibold block mb-0.5">
                  Volume Total
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#38C6D9]">
                  {stats.totalTonnage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                </span>
              </div>
            </div>

            {/* Visual progress line */}
            <div className="w-full h-2 bg-[#031F38] rounded-full overflow-hidden border border-[#14527A]/50">
              <div
                className="h-full bg-gradient-to-r from-[#FFAA00] to-[#FFB82E] transition-all duration-300 rounded-full"
                style={{ width: `${stats.percent}%` }}
              />
            </div>

            {/* Exercício escolhido */}
            <div className="pt-2 border-t border-[#14527A]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#E8F4F8] min-w-0">
                <span className="text-[#FFAA00] font-black text-[11px] uppercase tracking-wider flex-shrink-0">
                  Exercício Atual:
                </span>
                <span className="truncate font-bold text-[#E8F4F8]">
                  {activeExercise
                    ? `${activeExerciseIndex + 1}. ${activeExercise.name}`
                    : pendingExercises.length > 0 ? 'Escolha um exercício' : 'Todos Concluídos!'}
                </span>
                <span className="text-[11px] text-[#8FAFBD] flex-shrink-0">
                  ({uncompletedSetsCount} {uncompletedSetsCount === 1 ? 'série restante' : 'séries restantes'})
                </span>
              </div>

            </div>
          </div>
        )}
      </div>

      {restTimer && (
        <section aria-label="Descanso entre séries"
          className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#14527A] bg-[#031F38] px-3 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-[#FFAA00]" />
            <div>
              <span className="block text-[10px] font-bold text-[#8FAFBD]">Descanso</span>
              <span className="font-mono text-lg font-black text-[#FFAA00]">
                {Math.floor(restTimerSeconds / 60).toString().padStart(2, '0')}
                :{(restTimerSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <span role="status" className="text-xs text-[#8FAFBD]">
              {isRestTimerActive ? 'Descansando' : restTimerSeconds > 0 ? 'Pausado' : 'Concluído'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {restTimerSeconds > 0 && (
              <>
                <button type="button" onClick={() => adjustRestTimer(-30)}
                  className="rounded-lg border border-[#14527A] px-2 py-2 text-xs font-bold"
                  title="Diminuir 30 segundos">−30s</button>
                <button type="button" onClick={toggleRestTimer}
                  className="rounded-lg bg-[#FFAA00] px-2 py-2 text-[#031F38]"
                  title={isRestTimerActive ? 'Pausar descanso' : 'Retomar descanso'}>
                  {isRestTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => adjustRestTimer(30)}
                  className="rounded-lg border border-[#14527A] px-2 py-2 text-xs font-bold"
                  title="Aumentar 30 segundos">+30s</button>
              </>
            )}
            <button type="button" onClick={dismissRestTimer} title="Fechar descanso" className="rounded-lg p-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Exercises Section with Pending (Minimized by Default) and Collapsed FINALIZADOS Group */}
      <div className="space-y-4">
        {/* 1. Exercícios a Realizar (Iniciam TODOS minimizados por padrão) */}
        {pendingExercises.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#8FAFBD]">
                  Exercícios
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0B3A61] text-[#E8F4F8] border border-[#14527A]">
                  {pendingExercises.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={expandAllPending}
                  className="text-[#8FAFBD] hover:text-[#FFAA00] font-semibold transition-colors cursor-pointer"
                >
                  Expandir tudo
                </button>
                <span className="text-[#64879A]">•</span>
                <button
                  type="button"
                  onClick={collapseAllPending}
                  className="text-[#8FAFBD] hover:text-[#FFAA00] font-semibold transition-colors cursor-pointer"
                >
                  Recolher tudo
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {pendingExercises.map((exercise) => renderExerciseCard(exercise, false))}
            </div>
          </div>
        )}

        {/* 2. Banner de Todos os Exercícios Concluídos */}
        {pendingExercises.length === 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#00C98B]/15 border-2 border-[#00C98B]/50 text-center space-y-3 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-[#00C98B] font-black text-base sm:text-lg">
              <Trophy className="w-5 h-5 text-[#00C98B]" />
              <span>Treino 100% Concluído!</span>
            </div>
            <p className="text-xs text-[#8FAFBD] max-w-md mx-auto">
              Todas as {stats.totalSets} séries foram registradas. Toque abaixo para revisar o resumo e salvar no histórico.
            </p>
            <button
              type="button"
              id="finish-workout-completed-banner-btn"
              onClick={handleRequestFinishWorkout}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-black text-sm shadow-lg shadow-[#FFAA00]/25 transition-all active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#031F38]" />
              <span>Finalizar Treino & Salvar Histórico</span>
            </button>
          </div>
        )}

        {/* 3. Seção FINALIZADOS (Colapsado por padrão, abre somente ao clicar) */}
        {completedExercises.length > 0 && (
          <div
            id="completed-exercises-section"
            className="rounded-2xl border border-[#00C98B]/40 bg-[#082F52]/80 overflow-hidden shadow-md transition-all"
          >
            <button
              type="button"
              id="toggle-finalizados-btn"
              onClick={() => setIsCompletedGroupOpen((prev) => !prev)}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-[#0B3A61]/60 transition-colors select-none cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#00C98B]/20 border border-[#00C98B]/40 text-[#00C98B] flex items-center justify-center font-black flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#00C98B]">
                      FINALIZADOS
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00C98B]/20 text-[#00C98B] border border-[#00C98B]/30">
                      {completedExercises.length} de {currentRoutine.exercises.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8FAFBD] truncate max-w-xs sm:max-w-md mt-0.5">
                    {completedExercises.map((e) => e.name).join(' • ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#8FAFBD] flex-shrink-0">
                <span className="text-[11px] text-[#00C98B]">
                  {isCompletedGroupOpen ? 'Ocultar' : 'Ver finalizados'}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg bg-[#0B3A61] border border-[#14527A] flex items-center justify-center transition-transform duration-200 ${
                    isCompletedGroupOpen ? 'rotate-180 text-[#00C98B]' : 'text-[#8FAFBD]'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Conteúdo colapsável dos exercícios finalizados: abre somente ao clicar */}
            {isCompletedGroupOpen && (
              <div className="p-3 sm:p-4 border-t border-[#14527A] space-y-3 bg-[#031F38]/40 animate-in fade-in duration-200">
                {completedExercises.map((exercise) => renderExerciseCard(exercise, true))}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Pending Sets Warning Dialog before Finish */}
      {isPendingSetsWarningOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#082F52] border border-[#14527A] rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#FFAA00]/15 border border-[#FFAA00]/30 text-[#FFAA00] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#E8F4F8]">
                Séries Pendentes
              </h3>
              <p className="text-xs text-[#8FAFBD] mt-1.5 leading-relaxed">
                Você ainda possui <strong className="text-[#FFAA00] font-bold">{uncompletedSetsCount}</strong> {uncompletedSetsCount === 1 ? 'série não concluída' : 'séries não concluídas'}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPendingSetsWarningOpen(false)}
                className="py-3 px-3 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] text-[#E8F4F8] text-xs font-bold transition-colors"
              >
                Continuar Treino
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPendingSetsWarningOpen(false);
                  setIsFinishModalOpen(true);
                }}
                className="py-3 px-3 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] text-xs font-black transition-colors shadow-md active:scale-95"
              >
                Finalizar Mesmo Assim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Workout Confirmation & Calories Modal */}
      {isFinishModalOpen && (
        <div
          id="finish-workout-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#082F52] border border-[#14527A] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#14527A] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFAA00]/15 border border-[#FFAA00]/30 flex items-center justify-center text-[#FFAA00]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#E8F4F8]">
                    Finalizar Treino {currentRoutine.code}
                  </h3>
                  <span className="text-xs text-[#8FAFBD]">
                    {currentRoutine.targetMuscles}
                  </span>
                </div>
              </div>
            </div>

            {/* Completion Status Confirmation Badge */}
            <div className="p-3 rounded-2xl bg-[#00C98B]/10 border border-[#00C98B]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#00C98B] text-[#031F38] flex items-center justify-center font-bold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#00C98B] block">
                    Treino Concluído com Sucesso
                  </span>
                  <span className="text-[11px] text-[#8FAFBD]">
                    Pronto para registrar no histórico
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-[#FFAA00] px-2.5 py-1 rounded-lg bg-[#0B3A61] border border-[#14527A]">
                {stats.completedSets}/{stats.totalSets} séries
              </span>
            </div>

            {/* Quick Metrics preview */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] uppercase font-semibold text-[#64879A] block">Tempo Total</span>
                <span className="text-base font-bold text-[#FFAA00] font-mono">
                  {formattedTimer}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] uppercase font-semibold text-[#64879A] block">Volume Total</span>
                <span className="text-base font-bold text-[#38C6D9]">
                  {stats.totalTonnage.toLocaleString('pt-BR')} kg
                </span>
              </div>
            </div>

            {/* Calories Input Field */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#031F38] border border-[#14527A]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="workout-calories-input"
                  className="text-xs font-bold text-[#E8F4F8] flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4 text-[#FFAA00]" />
                  <span>Calorias Gastas (kcal)</span>
                </label>
                <span className="text-[10px] text-[#8FAFBD] font-medium">Smartwatch / Estimativa</span>
              </div>

              <div className="relative">
                <input
                  id="workout-calories-input"
                  type="number"
                  min="0"
                  max="4000"
                  step="5"
                  placeholder="Ex: 380"
                  value={finishCalories}
                  onChange={(e) => setFinishCalories(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#082F52] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] font-bold text-base focus:outline-none focus:border-[#FFAA00] text-center"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8FAFBD]">
                  kcal
                </span>
              </div>

              {/* Quick preset chips */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                {['200', '350', '450', '600'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFinishCalories(preset)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                      finishCalories === preset
                        ? 'bg-[#FFAA00]/20 text-[#FFAA00] border-[#FFAA00]/50'
                        : 'bg-[#082F52] text-[#8FAFBD] hover:text-[#E8F4F8] border-[#14527A]'
                    }`}
                  >
                    {preset} kcal
                  </button>
                ))}
              </div>
            </div>

            {/* Session Notes */}
            <div className="space-y-1.5">
              <label htmlFor="workout-session-notes" className="text-xs font-bold text-[#8FAFBD] block">
                Observações Gerais do Treino (Opcional)
              </label>
              <textarea
                id="workout-session-notes"
                rows={2}
                placeholder="Ex: Treino muito produtivo, boa progressão de cargas..."
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#031F38] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00] resize-none"
              />
            </div>

            {finishError && <p role="alert" className="text-xs text-red-300">{finishError}</p>}
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                id="btn-cancel-finish-workout"
                onClick={() => setIsFinishModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] text-[#8FAFBD] hover:text-[#E8F4F8] font-bold text-xs transition-colors"
              >
                Voltar ao Treino
              </button>

              <button
                type="button"
                id="confirm-finish-workout-btn"
                onClick={handleConfirmFinishWorkout}
                className="py-3 px-4 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-black text-xs glow-primary active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#031F38]" />
                <span>Confirmar & Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary / Celebration Modal */}
      {isSummaryOpen && lastSavedLog && (
        <div
          id="workout-summary-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031F38]/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="w-full max-w-md bg-[#082F52] border border-[#14527A] rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/30 flex items-center justify-center">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00C98B]/20 text-[#00C98B] border border-[#00C98B]/30 uppercase tracking-wide">
                Treino Concluído!
              </span>
              <h2 className="text-xl font-black text-[#E8F4F8] mt-2">
                {lastSavedLog.routineName}
              </h2>
              <p className="text-xs text-[#8FAFBD]">
                Os dados foram gravados com sucesso no seu histórico.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="p-3 rounded-2xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] text-[#64879A] block uppercase font-semibold">Duração</span>
                <span className="text-base font-bold text-[#FFAA00]">
                  {lastSavedLog.durationMinutes} min
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] text-[#64879A] block uppercase font-semibold">Calorias</span>
                <span className="text-base font-bold text-[#FFAA00]">
                  {lastSavedLog.caloriesBurned ? `${lastSavedLog.caloriesBurned} kcal` : '—'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#031F38] border border-[#14527A]">
                <span className="text-[10px] text-[#64879A] block uppercase font-semibold">Volume</span>
                <span className="text-base font-bold text-[#38C6D9]">
                  {lastSavedLog.totalTonnageKg.toLocaleString('pt-BR')} kg
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                id="close-summary-btn"
                onClick={handleCloseSummary}
                className="w-full py-3 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-bold text-sm shadow-md transition-all"
              >
                Concluir & Visualizar Próximo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#082F52] border border-[#14527A] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[#FF5C5C] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#E8F4F8]">
                Reiniciar Treino {currentRoutine.code}?
              </h3>
              <p className="text-xs text-[#8FAFBD] mt-1.5 leading-relaxed">
                As séries marcadas e anotações deste treino voltarão ao estado inicial. Use apenas se desejar recomeçar os lançamentos.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                id="btn-cancel-reset"
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] text-[#8FAFBD] hover:text-[#E8F4F8] text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-reset"
                type="button"
                onClick={handleConfirmReset}
                className="py-2.5 px-4 rounded-xl bg-[#FF5C5C] hover:brightness-110 text-[#031F38] text-xs font-black transition-colors shadow-md shadow-[#FF5C5C]/20"
              >
                Sim, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Video Player Modal */}
      {activeVideoModal && (
        <ExerciseVideoModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          title={activeVideoModal.title}
          category={activeVideoModal.category}
          videoUrl={activeVideoModal.videoUrl}
          notes={activeVideoModal.notes}
        />
      )}
    </div>
  );
};
