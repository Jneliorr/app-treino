import { useMemo, useState } from 'react';
import type { ExerciseProgressionPoint, WorkoutLog } from '../types';
import { getExerciseProgression } from '../services/storage';

const format = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const formatKg = (value: number) => `${format.format(value)} kg`;

function SessionChart({ points, metric, title }: {
  points: ExerciseProgressionPoint[];
  metric: 'maxWeightKg' | 'totalVolumeKg';
  title: string;
}) {
  const recent = points.slice(-6);
  const max = Math.max(1, ...recent.map((point) => point[metric]));
  return (
    <figure className="min-w-0 rounded-lg bg-[#031F38] p-2">
      <figcaption className="text-xs font-bold">{title}</figcaption>
      <ol className="mt-2 flex gap-1">
        {recent.map((point, index) => (
          <li key={`${point.date}-${index}`} className="flex min-w-0 flex-1 flex-col items-center text-[10px]">
            <span className="font-semibold">{format.format(point[metric])}</span>
            <div className="flex h-16 w-full items-end" aria-hidden="true">
              <div className="w-full rounded-t bg-[#38C6D9]"
                style={{ height: `${point[metric] ? Math.max(4, point[metric] / max * 100) : 0}%` }} />
            </div>
            <time dateTime={point.date}>{point.formattedDate}</time>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function ExerciseProgression({ logs, initialExerciseName }: {
  logs: WorkoutLog[];
  initialExerciseName?: string;
}) {
  const names = useMemo(() => {
    const byName = new Map<string, string>();
    if (initialExerciseName) byName.set(initialExerciseName.toLowerCase().trim(), initialExerciseName);
    for (const log of logs) {
      for (const entry of log.entries) {
        if (entry.sets.some((set) => set.completed)) {
          byName.set(entry.exerciseName.toLowerCase().trim(), entry.exerciseName);
        }
      }
    }
    return [...byName.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [logs, initialExerciseName]);
  const [selected, setSelected] = useState(initialExerciseName ?? '');
  const exercise = names.find((name) => name.toLowerCase().trim() === selected.toLowerCase().trim()) ?? names[0];
  const points = useMemo(() => exercise ? getExerciseProgression(exercise, logs) : [], [exercise, logs]);
  const latest = points.at(-1);
  const previous = points.at(-2);

  if (!names.length) return null;

  return (
    <section aria-labelledby="exercise-progression-title" className="space-y-3 rounded-2xl border border-[#14527A] bg-[#082F52] p-3">
      <h2 id="exercise-progression-title" className="text-sm font-bold">Evolução por exercício</h2>
      <label className="block text-xs">Exercício
        <select className="mt-1 w-full rounded-lg border border-[#14527A] bg-[#031F38] p-2 text-sm"
          value={exercise} onChange={(event) => setSelected(event.target.value)}>
          {names.map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      {latest ? (
        <>
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            {[{ label: 'Última sessão', point: latest }, { label: 'Sessão anterior', point: previous }].map(({ label, point }) => (
              <div key={label} className="rounded-lg border border-[#14527A] p-2">
                <p className="font-bold">{label}{point && ` · ${new Date(point.date).toLocaleDateString('pt-BR')}`}</p>
                {point ? (
                  <>
                    <p>Carga máxima {formatKg(point.maxWeightKg)} · {point.totalReps} repetições</p>
                    <p>Volume {formatKg(point.totalVolumeKg)}</p>
                    <p className="break-words text-[#8FAFBD]">{point.repsSummary}</p>
                  </>
                ) : <p>Ainda não há outra sessão para comparar.</p>}
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <SessionChart points={points} metric="maxWeightKg" title="Carga máxima (kg)" />
            <SessionChart points={points} metric="totalVolumeKg" title="Volume (kg)" />
          </div>
        </>
      ) : <p className="text-xs text-[#8FAFBD]">Conclua uma sessão com este exercício para ver a evolução.</p>}
    </section>
  );
}
