import { Routine, WorkoutWeek, WorkoutLog, ExerciseProgressionPoint, ActiveWorkoutDraft, AthleteProfile } from '../types';
import { INITIAL_ROUTINES_TWIN } from '../data/consultoriaTwinData';

const WEEKS_STORAGE_KEY = 'consultoria_twin_weeks_v1';
const ACTIVE_WEEK_KEY = 'consultoria_twin_active_week_id';
const ROUTINES_STORAGE_KEY = 'consultoria_twin_routines_v1';
const WORKOUT_LOGS_STORAGE_KEY = 'consultoria_twin_logs_v1';
const DRAFT_STORAGE_PREFIX = 'consultoria_twin_draft_v1_';
const ACTIVE_ROUTINE_KEY = 'consultoria_twin_active_routine_id';
const THEME_MODE_STORAGE_KEY = 'consultoria_twin_theme_mode_v1';
const ATHLETE_PROFILES_KEY = 'consultoria_twin_athlete_profiles_v1';
const ACTIVE_PROFILE_KEY = 'consultoria_twin_active_profile_id_v1';
// IDs reservados das sessões fictícias gravadas por versões anteriores.
const SAMPLE_LOG_IDS = new Set(['log-twin-1', 'log-twin-2', 'log-twin-3', 'log-twin-4']);

export type ThemeMode = 'dark' | 'light';

export function newRecordId(prefix: string): string {
  // Também funciona quando o app é acessado pelo celular em um servidor HTTP local.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return prefix + Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// --- GESTÃO DE MÚLTIPLOS PERFIS DE ATLETAS ---
export function getActiveProfileId(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (saved) return saved;
  } catch {
    // fallback
  }
  return 'default';
}

export function setActiveProfileId(profileId: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    window.dispatchEvent(new CustomEvent('athlete_profile_changed', { detail: { profileId } }));
  } catch (error) {
    console.error('Erro ao definir perfil de atleta ativo:', error);
  }
}

export function loadAthleteProfiles(): AthleteProfile[] {
  try {
    const raw = localStorage.getItem(ATHLETE_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Tenta recuperar o nome já cadastrado no perfil do usuário
  let defaultName = 'Atleta';
  try {
    const userProfileRaw = localStorage.getItem('consultoria_twin_user_profile_v1');
    if (userProfileRaw) {
      const parsed = JSON.parse(userProfileRaw);
      if (parsed?.name) {
        defaultName = parsed.name;
      }
    }
  } catch {
    // fallback
  }

  const initialProfiles: AthleteProfile[] = [
    {
      id: 'default',
      name: defaultName || 'Atleta',
      gender: 'male',
      color: '#FFAA00',
      avatarInitial: (defaultName || 'A').charAt(0).toUpperCase(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'perfil-esposa',
      name: 'Esposa',
      gender: 'female',
      color: '#EC4899',
      avatarInitial: 'E',
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    localStorage.setItem(ATHLETE_PROFILES_KEY, JSON.stringify(initialProfiles));
  } catch (error) {
    console.error('Erro ao salvar perfis iniciais:', error);
  }

  return initialProfiles;
}

export function saveAthleteProfiles(profiles: AthleteProfile[]): void {
  try {
    localStorage.setItem(ATHLETE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Erro ao salvar perfis de atletas:', error);
  }
}

export function addAthleteProfile(
  name: string,
  gender: 'male' | 'female' | 'other' = 'female',
  color?: string
): AthleteProfile {
  const profiles = loadAthleteProfiles();
  const id = `perfil-${Date.now()}`;
  const defaultColor = gender === 'female' ? '#EC4899' : '#00C98B';
  const newProfile: AthleteProfile = {
    id,
    name: name.trim() || 'Novo Atleta',
    gender,
    color: color || defaultColor,
    avatarInitial: (name.trim() || 'A').charAt(0).toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  const updated = [...profiles, newProfile];
  saveAthleteProfiles(updated);
  return newProfile;
}

export function updateAthleteProfile(updatedProfile: AthleteProfile): void {
  const profiles = loadAthleteProfiles();
  const updated = profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p));
  saveAthleteProfiles(updated);
}

export function deleteAthleteProfile(profileId: string): AthleteProfile[] {
  if (profileId === 'default') {
    return loadAthleteProfiles(); // Protege o perfil padrão
  }
  const profiles = loadAthleteProfiles();
  const updated = profiles.filter((p) => p.id !== profileId);
  saveAthleteProfiles(updated);

  if (getActiveProfileId() === profileId) {
    setActiveProfileId('default');
  }
  return updated;
}

// Helper para isolar chaves no LocalStorage por perfil
function getProfileStorageKey(baseKey: string, profileId?: string): string {
  const pid = profileId || getActiveProfileId();
  if (pid === 'default') {
    return baseKey; // Preserva 100% os dados originais existentes
  }
  return `${baseKey}_p_${pid}`;
}

export interface UserProfileData {
  name: string;
  weightKg: number;
  heightCm: number;
  goal: string;
  focusMuscles: string;
}

const PROFILE_STORAGE_KEY = 'consultoria_twin_user_profile_v1';

export function loadUserProfileData(profileId?: string): UserProfileData {
  const pid = profileId || getActiveProfileId();
  const key = getProfileStorageKey(PROFILE_STORAGE_KEY, pid);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}

  const profiles = loadAthleteProfiles();
  const current = profiles.find((p) => p.id === pid);

  if (pid === 'perfil-esposa' || current?.gender === 'female') {
    return {
      name: current?.name || 'Esposa',
      weightKg: 58.0,
      heightCm: 165,
      goal: 'Definição muscular e Ganho de Massa',
      focusMuscles: 'Glúteos, Quadríceps e Posterior',
    };
  }

  return {
    name: current?.name || 'Atleta Consultoria',
    weightKg: 78.5,
    heightCm: 178,
    goal: 'Hipertrofia e Progressão de Cargas',
    focusMuscles: 'Peito, Costas e Ombros',
  };
}

export function saveUserProfileData(data: UserProfileData, profileId?: string): void {
  const pid = profileId || getActiveProfileId();
  const key = getProfileStorageKey(PROFILE_STORAGE_KEY, pid);
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (data.name) {
      const profiles = loadAthleteProfiles();
      const target = profiles.find((p) => p.id === pid);
      if (target && target.name !== data.name) {
        target.name = data.name;
        target.avatarInitial = data.name.charAt(0).toUpperCase();
        saveAthleteProfiles(profiles);
      }
    }
  } catch (error) {
    console.error('Erro ao salvar dados do perfil:', error);
  }
}

function getProfileDraftKey(routineId: string, profileId?: string): string {
  const pid = profileId || getActiveProfileId();
  if (pid === 'default') {
    return `${DRAFT_STORAGE_PREFIX}${routineId}`;
  }
  return `${DRAFT_STORAGE_PREFIX}p_${pid}_${routineId}`;
}

export function loadSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'dark';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Erro ao salvar tema:', error);
  }
}

function getWeekDraftKey(routineId: string, weekId: string, profileId: string): string {
  return `consultoria_twin_draft_v2_${JSON.stringify([profileId, weekId, routineId])}`;
}

function getUnambiguousRoutineWeekId(routineId: string, weeks: WorkoutWeek[]): string | undefined {
  const matches = weeks.filter((week) => week.routines.some((routine) => routine.id === routineId));
  return matches.length === 1 ? matches[0].id : undefined;
}

function readRoutineDraft(key: string): ActiveWorkoutDraft | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const draft = JSON.parse(raw);
  if (typeof draft?.sessionStartTime !== 'string' || !Number.isFinite(Date.parse(draft.sessionStartTime))) return null;
  return draft.exerciseLogs && typeof draft.exerciseLogs === 'object' ? draft : null;
}

function loadLegacyDraft(routineId: string, weekId: string, profileId: string): ActiveWorkoutDraft | null {
  const draft = readRoutineDraft(getProfileDraftKey(routineId, profileId));
  if (!draft) return null;
  const draftWeekId = draft.weekId ?? getUnambiguousRoutineWeekId(routineId, loadWeeks(profileId));
  return draftWeekId === weekId ? draft : null;
}

export function loadRoutineDraft(routineId: string, weekId: string, profileId = getActiveProfileId()): ActiveWorkoutDraft | null {
  try {
    return readRoutineDraft(getWeekDraftKey(routineId, weekId, profileId)) ??
      loadLegacyDraft(routineId, weekId, profileId);
  } catch (error) {
    console.warn('Erro ao carregar rascunho de treino:', error);
    return null;
  }
}

export function saveRoutineDraft(draft: ActiveWorkoutDraft & { weekId: string }, profileId = getActiveProfileId()): void {
  try {
    const key = getWeekDraftKey(draft.routineId, draft.weekId, profileId);
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (error) {
    console.error('Erro ao salvar rascunho de treino:', error);
  }
}

export function clearRoutineDraft(routineId: string, weekId: string, profileId = getActiveProfileId()): void {
  try {
    localStorage.removeItem(getWeekDraftKey(routineId, weekId, profileId));
    if (loadLegacyDraft(routineId, weekId, profileId)) {
      localStorage.removeItem(getProfileDraftKey(routineId, profileId));
    }
  } catch (error) {
    console.error('Erro ao limpar rascunho de treino:', error);
  }
}

export function loadSavedActiveRoutineId(profileId?: string): string | null {
  try {
    const key = getProfileStorageKey(ACTIVE_ROUTINE_KEY, profileId);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveSavedActiveRoutineId(routineId: string, profileId?: string): void {
  try {
    const key = getProfileStorageKey(ACTIVE_ROUTINE_KEY, profileId);
    localStorage.setItem(key, routineId);
  } catch (error) {
    console.error('Erro ao salvar ID da rotina ativa:', error);
  }
}

// --- GESTÃO DE SEMANAS DE TREINO ---
export function loadWeeks(profileId?: string): WorkoutWeek[] {
  const pid = profileId || getActiveProfileId();
  const weeksKey = getProfileStorageKey(WEEKS_STORAGE_KEY, pid);
  try {
    const raw = localStorage.getItem(weeksKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Se é o perfil principal (default) e ainda não tem semanas salvas, verifica se já havia rotinas salvas
    if (pid === 'default') {
      const existingRoutinesRaw = localStorage.getItem(ROUTINES_STORAGE_KEY);
      let initialRoutines = INITIAL_ROUTINES_TWIN;
      if (existingRoutinesRaw) {
        try {
          const parsedRoutines = JSON.parse(existingRoutinesRaw);
          if (Array.isArray(parsedRoutines) && parsedRoutines.length > 0) {
            initialRoutines = parsedRoutines;
          }
        } catch {
          // fallback
        }
      }

      const defaultWeeks: WorkoutWeek[] = [
        {
          id: 'semana-1',
          number: 1,
          name: 'Semana 1',
          description: 'Consultoria Twin • Treinos A ao F',
          createdAt: new Date().toISOString(),
          routines: initialRoutines,
        },
      ];

      saveWeeks(defaultWeeks, 'default');
      saveActiveWeekId('semana-1', 'default');
      return defaultWeeks;
    } else {
      // Para perfis secundários (ex: Esposa), gera uma ficha independente e pronta para personalizar
      const defaultWeeks: WorkoutWeek[] = [
        {
          id: `semana-1-${pid}`,
          number: 1,
          name: 'Semana 1',
          description: 'Ficha de Treinos • Semana 1',
          createdAt: new Date().toISOString(),
          routines: INITIAL_ROUTINES_TWIN.map((r, rIdx) => ({
            ...r,
            id: `rotina-${r.code.toLowerCase()}-${pid}-${rIdx + 1}`,
            exercises: r.exercises.map((ex, exIdx) => ({
              ...ex,
              id: `ex-${r.code.toLowerCase()}-${pid}-${exIdx + 1}`,
            })),
          })),
        },
      ];

      saveWeeks(defaultWeeks, pid);
      saveActiveWeekId(`semana-1-${pid}`, pid);
      return defaultWeeks;
    }
  } catch (error) {
    console.warn('Erro ao carregar semanas:', error);
    return [
      {
        id: `semana-1-${pid}`,
        number: 1,
        name: 'Semana 1',
        description: 'Ficha de Treinos',
        createdAt: new Date().toISOString(),
        routines: INITIAL_ROUTINES_TWIN,
      },
    ];
  }
}

function saveWeeks(weeks: WorkoutWeek[], profileId: string): void {
  localStorage.setItem(getProfileStorageKey(WEEKS_STORAGE_KEY, profileId), JSON.stringify(weeks));
}

export function loadActiveWeekId(profileId?: string): string {
  try {
    const pid = profileId || getActiveProfileId();
    const key = getProfileStorageKey(ACTIVE_WEEK_KEY, pid);
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    return pid === 'default' ? 'semana-1' : `semana-1-${pid}`;
  } catch {
    return 'semana-1';
  }
}

export function saveActiveWeekId(weekId: string, profileId?: string): void {
  try {
    const pid = profileId || getActiveProfileId();
    const key = getProfileStorageKey(ACTIVE_WEEK_KEY, pid);
    localStorage.setItem(key, weekId);
  } catch (error) {
    console.error('Erro ao salvar semana ativa:', error);
  }
}

export function createNewWeek(
  customName?: string,
  copyFromWeekId?: string,
  customRoutines?: Routine[]
): WorkoutWeek {
  const pid = getActiveProfileId();
  const weeks = loadWeeks(pid);
  const nextNum = weeks.length > 0 ? Math.max(...weeks.map((w) => w.number)) + 1 : 1;
  const newId = newRecordId('semana-');
  const weekName = customName?.trim() || `Semana ${nextNum}`;

  const source = customRoutines?.length ? customRoutines : weeks.find((w) => w.id === copyFromWeekId)?.routines;
  const routinesToUse = copyRoutines(source?.length ? source : INITIAL_ROUTINES_TWIN, newId);

  const newWeek: WorkoutWeek = {
    id: newId,
    number: nextNum,
    name: weekName,
    description: `Ficha da ${weekName} • ${routinesToUse.length} treinos`,
    createdAt: new Date().toISOString(),
    routines: routinesToUse,
  };

  const updatedWeeks = [...weeks, newWeek];
  saveWeeks(updatedWeeks, pid);
  saveActiveWeekId(newId, pid);
  return newWeek;
}

function copyRoutines(routines: Routine[], namespace: string): Routine[] {
  return routines.map((routine, routineIndex) => {
    const id = `${namespace}-rotina-${routineIndex + 1}`;
    return {
      ...routine,
      id,
      exercises: routine.exercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        id: `${id}-ex-${exerciseIndex + 1}`,
      })),
    };
  });
}

export function updateWeekRoutines(weekId: string, routines: Routine[]): Routine[] {
  const pid = getActiveProfileId();
  const weeks = loadWeeks(pid);
  if (!weeks.some((week) => week.id === weekId)) throw new Error('Semana de treino não encontrada.');
  const replacement = copyRoutines(routines, newRecordId(`${weekId}-`));
  const updated = weeks.map((w) => (w.id === weekId ? { ...w, routines: replacement } : w));
  saveWeeks(updated, pid);
  return replacement;
}

export function deleteWeek(weekId: string): WorkoutWeek[] {
  const pid = getActiveProfileId();
  const weeks = loadWeeks(pid);
  const filtered = weeks.filter((w) => w.id !== weekId);

  if (filtered.length === 0) {
    // Se excluiu a única semana existente, recria uma nova Semana 1 limpa
    const resetWeek: WorkoutWeek = {
      id: newRecordId('semana-'),
      number: 1,
      name: 'Semana 1',
      description: 'Ficha de Treinos • Semana 1',
      createdAt: new Date().toISOString(),
      routines: copyRoutines(INITIAL_ROUTINES_TWIN, newRecordId('ficha-')),
    };
    saveWeeks([resetWeek], pid);
    saveActiveWeekId(resetWeek.id, pid);
    return [resetWeek];
  }

  saveWeeks(filtered, pid);

  const activeId = loadActiveWeekId(pid);
  if (activeId === weekId) {
    saveActiveWeekId(filtered[0].id, pid);
  }
  return filtered;
}

export function loadRoutines(profileId?: string): Routine[] {
  try {
    const pid = profileId || getActiveProfileId();
    const weeks = loadWeeks(pid);
    const activeWeekId = loadActiveWeekId(pid);
    const activeWeek = weeks.find((w) => w.id === activeWeekId) || weeks[0];
    if (activeWeek && activeWeek.routines.length > 0) {
      return activeWeek.routines;
    }
    return INITIAL_ROUTINES_TWIN;
  } catch (error) {
    console.warn('Erro ao carregar rotinas do armazenamento:', error);
    return INITIAL_ROUTINES_TWIN;
  }
}

export function resetToTwinRoutines(): Routine[] {
  return updateWeekRoutines(loadActiveWeekId(), INITIAL_ROUTINES_TWIN);
}

export function loadWorkoutLogs(profileId?: string): WorkoutLog[] {
  try {
    const pid = profileId || getActiveProfileId();
    const logsKey = getProfileStorageKey(WORKOUT_LOGS_STORAGE_KEY, pid);
    const raw = localStorage.getItem(logsKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((log: WorkoutLog) => !SAMPLE_LOG_IDS.has(log.id));
  } catch (error) {
    console.warn('Erro ao carregar logs de treino:', error);
    return [];
  }
}

function saveWorkoutLogs(logs: WorkoutLog[], profileId: string): void {
  const logsKey = getProfileStorageKey(WORKOUT_LOGS_STORAGE_KEY, profileId);
  localStorage.setItem(logsKey, JSON.stringify(logs));
}

export function addWorkoutLog(log: WorkoutLog, pid = getActiveProfileId()): WorkoutLog[] {
  const currentLogs = loadWorkoutLogs(pid);
  const updated = [log, ...currentLogs];
  saveWorkoutLogs(updated, pid);
  return updated;
}

export function deleteWorkoutLog(logId: string): WorkoutLog[] {
  const pid = getActiveProfileId();
  const currentLogs = loadWorkoutLogs(pid);
  const updated = currentLogs.filter((l) => l.id !== logId);
  saveWorkoutLogs(updated, pid);
  return updated;
}

export function findLastWorkoutForRoutine(
  logs: WorkoutLog[], weeks: WorkoutWeek[], weekId: string, routineId: string
): WorkoutLog | undefined {
  const legacyWeekId = getUnambiguousRoutineWeekId(routineId, weeks);
  return logs.filter((log) => log.routineId === routineId && (log.weekId ?? legacyWeekId) === weekId)
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))[0];
}

export function getLastSessionForExercise(exerciseName: string, profileId?: string): {
  date: string;
  weights: number[];
  reps: number[];
  maxWeight: number;
} | null {
  const logs = loadWorkoutLogs(profileId);
  const lowerName = exerciseName.toLowerCase().trim();

  // Search from newest to oldest
  for (const log of logs) {
    for (const entry of log.entries) {
      if (entry.exerciseName.toLowerCase().trim() === lowerName && entry.sets.length > 0) {
        const completedSets = entry.sets.filter((s) => s.completed && s.weightKg > 0);
        if (completedSets.length > 0) {
          const weights = completedSets.map((s) => s.weightKg);
          const reps = completedSets.map((s) => s.repsCompleted);
          const maxWeight = Math.max(...weights);
          return {
            date: log.completedAt || log.startedAt,
            weights,
            reps,
            maxWeight,
          };
        }
      }
    }
  }

  return null;
}

export function getExerciseProgression(exerciseName: string): ExerciseProgressionPoint[] {
  const logs = loadWorkoutLogs();
  const lowerName = exerciseName.toLowerCase().trim();
  const points: ExerciseProgressionPoint[] = [];

  // Sort logs chronologically (oldest first for chart progression)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  for (const log of sortedLogs) {
    for (const entry of log.entries) {
      if (entry.exerciseName.toLowerCase().trim() === lowerName) {
        const validSets = entry.sets.filter((s) => s.completed && s.weightKg > 0);
        if (validSets.length > 0) {
          const weights = validSets.map((s) => s.weightKg);
          const maxWeightKg = Math.max(...weights);
          const avgWeightKg = Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;
          const totalVolumeKg = Math.round(validSets.reduce((acc, s) => acc + s.weightKg * s.repsCompleted, 0) * 10) / 10;
          const repsSummary = validSets.map((s) => `${String(s.weightKg).replace('.', ',')}kg×${s.repsCompleted}`).join(', ');

          const d = new Date(log.startedAt);
          const formattedDate = d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          });

          points.push({
            date: log.startedAt,
            formattedDate,
            maxWeightKg,
            avgWeightKg,
            totalVolumeKg,
            setsCount: validSets.length,
            repsSummary,
            technique: entry.advancedTechniqueId,
          });
        }
      }
    }
  }

  return points;
}

export function getAllTrackedExerciseNames(): string[] {
  const names = new Set<string>();
  const routines = loadRoutines();
  for (const r of routines) {
    for (const ex of r.exercises) {
      names.add(ex.name);
    }
  }
  const logs = loadWorkoutLogs();
  for (const l of logs) {
    for (const en of l.entries) {
      names.add(en.exerciseName);
    }
  }
  return Array.from(names).sort();
}
