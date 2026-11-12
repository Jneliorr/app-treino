import type { WorkoutLog, WorkoutWeek } from '../types';

export interface WorkoutBackup {
  weeks: WorkoutWeek[];
  logs: WorkoutLog[];
}

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === 'string';
const id = (value: unknown): value is string => string(value) && value.trim().length > 0;
const number = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const integer = (value: unknown): value is number => number(value) && Number.isSafeInteger(value);
const date = (value: unknown): value is string => string(value) && Number.isFinite(Date.parse(value));
const optional = (value: unknown, check: (v: unknown) => boolean) => value === undefined || check(value);
const list = (value: unknown, check: (v: unknown) => boolean) => Array.isArray(value) && value.every(check);
const uniqueIds = (items: { id: string }[]) => new Set(items.map((item) => item.id)).size === items.length;
const boolean = (value: unknown) => typeof value === 'boolean';

function isExercise(value: unknown): boolean {
  return object(value) && id(value.id) && id(value.name) && integer(value.sets) &&
    value.sets >= 1 && value.sets <= 100 && id(value.reps) && integer(value.order) &&
    optional(value.defaultRestSeconds, integer) && optional(value.advancedTechniqueId, string) &&
    optional(value.advancedTechniqueNotes, string) && optional(value.notes, string);
}

function isRoutine(value: unknown): boolean {
  return object(value) && id(value.id) && id(value.code) && id(value.name) &&
    string(value.targetMuscles) && integer(value.dayOrder) && string(value.restIntervalText) &&
    integer(value.restIntervalSeconds) && optional(value.aerobics, (a) =>
      object(a) && integer(a.postWorkoutMin) && integer(a.restDayMin)) &&
    Array.isArray(value.exercises) && value.exercises.length > 0 &&
    value.exercises.every(isExercise) && uniqueIds(value.exercises);
}

function isWeek(value: unknown): value is WorkoutWeek {
  return object(value) && id(value.id) && id(value.name) && integer(value.number) &&
    date(value.createdAt) && optional(value.description, string) && Array.isArray(value.routines) &&
    value.routines.length > 0 && value.routines.every(isRoutine) && uniqueIds(value.routines);
}

function isEntry(value: unknown): boolean {
  return object(value) && id(value.exerciseId) && id(value.exerciseName) &&
    integer(value.targetSets) && string(value.targetReps) && optional(value.notes, string) &&
    optional(value.advancedTechniqueId, string) && optional(value.advancedTechniqueNotes, string) &&
    list(value.sets, (set) => object(set) && integer(set.setNumber) &&
      number(set.weightKg) && integer(set.repsCompleted) && boolean(set.completed) &&
      optional(set.techniqueApplied, boolean));
}

function isLog(value: unknown): value is WorkoutLog {
  return object(value) && id(value.id) && id(value.userId) && id(value.routineId) &&
    id(value.routineCode) && id(value.routineName) && string(value.targetMuscles) &&
    date(value.startedAt) && date(value.completedAt) && number(value.durationMinutes) &&
    number(value.totalTonnageKg) && optional(value.caloriesBurned, number) &&
    optional(value.weekId, string) && optional(value.weekName, string) &&
    optional(value.notes, string) && list(value.entries, isEntry);
}

export function parseWorkoutBackup(text: string): WorkoutBackup {
  const value: unknown = JSON.parse(text.replace(/^\uFEFF/, ''));
  if (!object(value) || !Array.isArray(value.logs) || !value.logs.every(isLog)) {
    throw new Error('O histórico do arquivo é inválido.');
  }
  if (value.version === 2 && Array.isArray(value.weeks) && value.weeks.length &&
      value.weeks.every(isWeek) && uniqueIds(value.weeks)) {
    return { weeks: value.weeks, logs: value.logs };
  }
  if (value.version === undefined) {
    const legacyWeek = {
      id: 'semana-importada',
      number: 1,
      name: 'Ficha restaurada',
      createdAt: value.exportedAt,
      routines: value.routines,
    };
    if (isWeek(legacyWeek)) return { weeks: [legacyWeek], logs: value.logs };
  }
  throw new Error('As fichas ou a versão do backup são inválidas.');
}

const weekContent = (week: WorkoutWeek) =>
  JSON.stringify([week.number, week.name, week.description, week.routines]);

export function planWorkoutRestore(current: WorkoutBackup, backup: WorkoutBackup) {
  const weeks = [...current.weeks];
  const weekIds = new Map<string, string>();
  for (const week of backup.weeks) {
    let candidateId = week.id;
    let suffix = 1;
    let existing = weeks.find((entry) => entry.id === candidateId);
    while (existing && weekContent(existing) !== weekContent(week)) {
      candidateId = `${week.id}-backup-${suffix++}`;
      existing = weeks.find((entry) => entry.id === candidateId);
    }
    weekIds.set(week.id, candidateId);
    if (!existing) weeks.push({ ...week, id: candidateId });
  }

  const logsById = new Map(current.logs.map((log) => [log.id, log]));
  for (const log of backup.logs) {
    if (logsById.has(log.id)) continue;
    const matchingWeeks = log.weekId ? [] : backup.weeks.filter((week) =>
      week.routines.some((routine) => routine.id === log.routineId));
    const originalWeekId = log.weekId ?? (matchingWeeks.length === 1 ? matchingWeeks[0].id : undefined);
    const weekId = originalWeekId ? weekIds.get(originalWeekId) ?? originalWeekId : undefined;
    logsById.set(log.id, { ...log, weekId });
  }
  return {
    weeks,
    logs: [...logsById.values()].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)),
    addedWeeks: weeks.length - current.weeks.length,
    addedLogs: logsById.size - current.logs.length,
  };
}
