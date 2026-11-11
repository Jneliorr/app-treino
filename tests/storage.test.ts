import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import {
  addWorkoutLog,
  clearRoutineDraft,
  createNewWeek,
  findLastWorkoutForRoutine,
  loadRoutineDraft,
  loadWeeks,
  loadWorkoutLogs,
  saveRoutineDraft,
  updateWeekRoutines,
} from '../src/services/storage';
import type { ActiveWorkoutDraft, WorkoutLog } from '../src/types';

const stored = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
    removeItem: (key: string) => stored.delete(key),
  },
});
beforeEach(() => stored.clear());

const timestamp = '2026-11-10T19:00:00.000Z';
const logsKey = 'consultoria_twin_logs_v1';
const weeksKey = 'consultoria_twin_weeks_v1';

test('criar, copiar e importar uma semana mantém a ficha anterior e cria novos IDs', () => {
  const [original] = loadWeeks();
  const imported = updateWeekRoutines(original.id, original.routines.slice(0, 1));
  const createdFromTemplate = createNewWeek('Semana modelo');
  const copied = createNewWeek('Semana copiada', original.id);
  const importedAgain = createNewWeek('Nova importação', undefined, imported);

  assert.deepEqual(loadWeeks().find((week) => week.id === original.id)?.routines, imported);
  assert.equal(createdFromTemplate.routines.length, 6);
  assert.equal(copied.routines[0].exercises[0].name, imported[0].exercises[0].name);
  assert.notEqual(copied.routines[0].id, imported[0].id);
  assert.notEqual(importedAgain.routines[0].id, imported[0].id);
  assert.notEqual(importedAgain.routines[0].exercises[0].id, imported[0].exercises[0].id);
});

test('isola rascunhos por semana e perfil mesmo quando o ID da rotina coincide', () => {
  const [original] = loadWeeks();
  const routineId = original.routines[0].id;
  const legacyKey = `consultoria_twin_draft_v1_${routineId}`;
  const exerciseId = original.routines[0].exercises[0].id;
  const draft: ActiveWorkoutDraft = {
    routineId,
    sessionStartTime: timestamp,
    updatedAt: timestamp,
    exerciseLogs: { [exerciseId]: [{ setNumber: 1, weightKg: 15, repsCompleted: 8, completed: true }] },
    exerciseNotes: {},
  };
  stored.set(legacyKey, JSON.stringify(draft));
  assert.deepEqual(loadRoutineDraft(routineId, original.id), draft);

  const otherWeek = { ...original, id: 'semana-legada-2', number: 2 };
  stored.set(weeksKey, JSON.stringify([original, otherWeek]));
  assert.equal(loadRoutineDraft(routineId, otherWeek.id), null);

  saveRoutineDraft({ ...draft, weekId: original.id });
  saveRoutineDraft({ ...draft, weekId: otherWeek.id, elapsedSeconds: 42 });
  saveRoutineDraft({ ...draft, weekId: original.id, elapsedSeconds: 10 }, 'perfil-esposa');
  clearRoutineDraft(routineId, original.id);
  assert.equal(loadRoutineDraft(routineId, original.id), null);
  assert.equal(loadRoutineDraft(routineId, otherWeek.id)?.elapsedSeconds, 42);
  assert.equal(loadRoutineDraft(routineId, original.id, 'perfil-esposa')?.elapsedSeconds, 10);
});

test('histórico ignora os exemplos e só marca como concluída a rotina da semana certa', () => {
  const [original] = loadWeeks();
  const routine = original.routines[0];
  const other = createNewWeek('Próxima semana', original.id);
  const log: WorkoutLog = {
    id: 'sessao-real',
    userId: 'default',
    routineId: routine.id,
    routineCode: routine.code,
    routineName: routine.name,
    targetMuscles: routine.targetMuscles,
    weekId: original.id,
    startedAt: timestamp,
    completedAt: timestamp,
    durationMinutes: 30,
    entries: [],
    totalTonnageKg: 0,
  };
  assert.deepEqual(loadWorkoutLogs(), []);
  stored.set(logsKey, JSON.stringify([{ ...log, id: 'log-twin-1' }]));
  assert.deepEqual(addWorkoutLog(log), [log]);
  assert.deepEqual(loadWorkoutLogs(), [log]);
  assert.deepEqual(loadWorkoutLogs('perfil-esposa'), []);
  const weeks = loadWeeks();
  assert.deepEqual(findLastWorkoutForRoutine([log], weeks, original.id, routine.id), log);
  assert.equal(findLastWorkoutForRoutine([log], weeks, other.id, other.routines[0].id), undefined);

  const legacy = { ...log, weekId: undefined };
  assert.deepEqual(findLastWorkoutForRoutine([legacy], weeks, original.id, routine.id), legacy);
  assert.equal(findLastWorkoutForRoutine([legacy], [...weeks, { ...original, id: 'duplicada' }], original.id, routine.id), undefined);
});
