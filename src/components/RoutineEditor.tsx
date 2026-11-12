import React, { useState } from 'react';
import type { Routine, RoutineExercise, WorkoutWeek } from '../types';
import { newRecordId, saveEditedRoutine } from '../services/storage';

const field = 'w-full rounded-lg border border-[#14527A] bg-[#031F38] px-3 py-2 text-sm';

export function RoutineEditor({ week, routine, onSaved, onCancel }: {
  week: WorkoutWeek;
  routine: Routine;
  onSaved: (weeks: WorkoutWeek[]) => void;
  onCancel: () => void;
}) {
  const [exercises, setExercises] = useState(routine.exercises);
  const [error, setError] = useState('');

  const changeExercise = (id: string, changes: Partial<RoutineExercise>) => {
    setExercises((previous) => previous.map((item) => item.id === id ? { ...item, ...changes } : item));
  };

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (exercises.some((exercise) => !exercise.name.trim() || !exercise.reps.trim())) {
      setError('Preencha o nome e as repetições de cada exercício.');
      return;
    }
    const editedExercises = exercises.map((exercise, index) => {
      const name = exercise.name.trim();
      const original = routine.exercises.find((item) => item.id === exercise.id);
      const edited = { ...exercise, name, reps: exercise.reps.trim(), order: index + 1 };
      return original && original.name.toLowerCase().trim() !== name.toLowerCase()
        ? { ...edited, id: newRecordId('ex-'), advancedTechniqueId: undefined, advancedTechniqueNotes: undefined, notes: undefined }
        : edited;
    });
    try {
      onSaved(saveEditedRoutine(week.id, { ...routine, exercises: editedExercises }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível salvar a ficha.');
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 pb-8">
      <div>
        <h2 className="text-lg font-bold">Editar {routine.name}</h2>
        <p className="text-sm text-[#8FAFBD]">{week.name} · {routine.targetMuscles}</p>
      </div>
      {exercises.map((exercise, index) => (
        <fieldset key={exercise.id} className="space-y-2 rounded-xl border border-[#14527A] bg-[#082F52] p-3">
          <legend className="px-1 text-xs font-bold">Exercício {index + 1}</legend>
          <label className="block text-xs">Nome do exercício
            <input required maxLength={160} className={field} value={exercise.name}
              onChange={(event) => changeExercise(exercise.id, { name: event.target.value })} />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs">Séries
              <input required type="number" min={1} max={100} className={field} value={exercise.sets || ''}
                onChange={(event) => changeExercise(exercise.id, { sets: Number(event.target.value) })} />
            </label>
            <label className="text-xs">Repetições
              <input required maxLength={40} placeholder="8–12" className={field} value={exercise.reps}
                onChange={(event) => changeExercise(exercise.id, { reps: event.target.value })} />
            </label>
            <label className="text-xs">Descanso (s)
              <input type="number" min={1} max={3600} placeholder={String(routine.restIntervalSeconds)} className={field}
                value={exercise.defaultRestSeconds ?? ''}
                onChange={(event) => changeExercise(exercise.id, {
                  defaultRestSeconds: event.target.value ? Number(event.target.value) : undefined,
                })} />
            </label>
          </div>
          <button type="button" disabled={exercises.length === 1}
            onClick={() => setExercises((previous) => previous.filter((item) => item.id !== exercise.id))}
            className="py-2 text-xs font-bold text-[#FF8888] disabled:opacity-50">Remover exercício</button>
        </fieldset>
      ))}
      {error && <p role="alert" className="text-sm text-[#FF8888]">{error}</p>}
      <button type="button" className="rounded-xl border border-[#14527A] px-4 py-2 text-sm font-bold"
        onClick={() => setExercises((previous) => [...previous, {
          id: newRecordId('ex-'), name: '', sets: 3, reps: '8–12', order: previous.length + 1,
        }])}>Adicionar exercício</button>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-[#14527A] px-4 py-2 text-sm">Cancelar</button>
        <button type="submit" className="rounded-xl bg-[#FFAA00] px-4 py-2 text-sm font-bold text-[#031F38]">Salvar ficha</button>
      </div>
    </form>
  );
}
