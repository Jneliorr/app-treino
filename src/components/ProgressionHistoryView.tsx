import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { WorkoutLog } from '../types';
import { loadWorkoutLogs, deleteWorkoutLog } from '../services/storage';

interface Props {
  initialExerciseName?: string;
  onOpenTechniqueModal?: (techniqueId: string) => void;
}

export const ProgressionHistoryView: React.FC<Props> = ({
  onOpenTechniqueModal,
}) => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => loadWorkoutLogs());
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  const handleDeleteLog = (logId: string) => {
    const updated = deleteWorkoutLog(logId);
    setWorkoutLogs(updated);
    setDeletingLogId(null);
  };

  // Resumo estatístico geral
  const totalStats = useMemo(() => {
    const totalSessions = workoutLogs.length;
    const totalMinutes = workoutLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
    const totalCalories = workoutLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0);
    const totalTonnage = workoutLogs.reduce((acc, log) => acc + (log.totalTonnageKg || 0), 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

    return {
      totalSessions,
      formattedDuration,
      totalCalories,
      totalTonnage,
    };
  }, [workoutLogs]);

  // Filtro de treinos por nome, código ou data
  const filteredLogs = useMemo(() => {
    if (!searchFilter.trim()) return workoutLogs;
    const term = searchFilter.toLowerCase().trim();
    return workoutLogs.filter((log) => {
      const routineName = (log.routineName || '').toLowerCase();
      const routineCode = (log.routineCode || '').toLowerCase();
      const weekName = (log.weekName || '').toLowerCase();
      const dateStr = new Date(log.completedAt).toLocaleDateString('pt-BR');
      return (
        routineName.includes(term) ||
        routineCode.includes(term) ||
        weekName.includes(term) ||
        dateStr.includes(term)
      );
    });
  }, [workoutLogs, searchFilter]);

  return (
    <div id="progression-history-container" className="space-y-4 pb-20 text-[#E8F4F8]">
      {/* Top Header Card */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/25">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#E8F4F8]">
                Treinos Finalizados
              </h2>
              <p className="text-xs text-[#8FAFBD]">
                Fichas concluídas e calorias gastas
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/30">
            {workoutLogs.length} {workoutLogs.length === 1 ? 'Treino' : 'Treinos'}
          </span>
        </div>

        {/* Global Summary Stats Cards */}
        {workoutLogs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A] text-center">
              <span className="text-[10px] uppercase font-bold text-[#64879A] flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#00C98B]" />
                Concluídos
              </span>
              <span className="text-base font-black text-[#E8F4F8] mt-0.5 block">
                {totalStats.totalSessions}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A] text-center">
              <span className="text-[10px] uppercase font-bold text-[#64879A] flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#FFAA00]" />
                Tempo Total
              </span>
              <span className="text-base font-black text-[#E8F4F8] mt-0.5 block">
                {totalStats.formattedDuration}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A] text-center">
              <span className="text-[10px] uppercase font-bold text-[#64879A] flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#FFAA00]" />
                Gasto Calórico
              </span>
              <span className="text-base font-black text-[#FFAA00] mt-0.5 block">
                {totalStats.totalCalories > 0 ? `${totalStats.totalCalories} kcal` : '—'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A] text-center">
              <span className="text-[10px] uppercase font-bold text-[#64879A] flex items-center justify-center gap-1">
                <Dumbbell className="w-3 h-3 text-[#38C6D9]" />
                Volume Total
              </span>
              <span className="text-base font-black text-[#38C6D9] mt-0.5 block">
                {totalStats.totalTonnage.toLocaleString('pt-BR')} kg
              </span>
            </div>
          </div>
        )}

        {/* Search / Filter input */}
        {workoutLogs.length > 2 && (
          <div className="relative pt-1">
            <Search className="w-4 h-4 text-[#64879A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Buscar por nome, letra do treino ou data..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#031F38] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00]"
            />
          </div>
        )}
      </div>

      {/* Finished Workouts List */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isDeleting = deletingLogId === log.id;

            return (
              <div
                key={log.id}
                id={`workout-log-card-${log.id}`}
                className="p-4 rounded-2xl bg-[#082F52] border border-[#14527A] shadow-md space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-black bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/30 uppercase">
                        {log.routineCode || 'Treino'}
                      </span>
                      {log.weekName && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#38C6D9]/15 text-[#38C6D9] border border-[#38C6D9]/25">
                          {log.weekName}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-[#E8F4F8] mt-1.5">
                      {log.routineName}
                    </h3>

                    <span className="text-xs text-[#8FAFBD] flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FFAA00]" />
                      {new Date(log.completedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#00C98B]/15 text-[#00C98B] border border-[#00C98B]/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluído
                    </span>

                    {/* Delete log button */}
                    <button
                      type="button"
                      onClick={() => setDeletingLogId(isDeleting ? null : log.id)}
                      className="p-1.5 rounded-lg text-[#64879A] hover:text-[#FF5C5C] hover:bg-[#FF5C5C]/10 transition-colors"
                      title="Excluir este registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confirmation for deleting log */}
                {isDeleting && (
                  <div className="p-3 rounded-xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#E8F4F8] font-bold">
                      Deseja apagar este treino do histórico?
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDeletingLogId(null)}
                        className="px-2 py-1 rounded-lg bg-[#082F52] text-[#8FAFBD] font-bold text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#FF5C5C] text-white font-bold text-xs"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                )}

                {/* Stats 3 columns */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                    <span className="text-[10px] uppercase font-bold text-[#64879A] flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-[#FFAA00]" />
                      Duração
                    </span>
                    <span className="text-sm font-black text-[#E8F4F8] mt-0.5 block">
                      {log.durationMinutes} min
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                    <span className="text-[10px] uppercase font-bold text-[#64879A] flex items-center justify-center gap-1">
                      <Flame className="w-3 h-3 text-[#FFAA00]" />
                      Calorias
                    </span>
                    <span className="text-sm font-black text-[#FFAA00] mt-0.5 block">
                      {log.caloriesBurned ? `${log.caloriesBurned} kcal` : '—'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A]">
                    <span className="text-[10px] uppercase font-bold text-[#64879A] flex items-center justify-center gap-1">
                      <Dumbbell className="w-3 h-3 text-[#38C6D9]" />
                      Volume
                    </span>
                    <span className="text-sm font-black text-[#38C6D9] mt-0.5 block">
                      {log.totalTonnageKg.toLocaleString('pt-BR')} kg
                    </span>
                  </div>
                </div>

                {log.notes && (
                  <div className="p-2.5 rounded-xl bg-[#031F38] border border-[#14527A] text-xs text-[#8FAFBD] italic">
                    "{log.notes}"
                  </div>
                )}

                {/* Details Accordion Button */}
                {log.entries && log.entries.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="w-full py-2 px-3 rounded-xl bg-[#031F38] hover:bg-[#0B3A61] border border-[#14527A] text-xs font-bold text-[#8FAFBD] hover:text-[#E8F4F8] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFAA00]" />
                        <span>
                          {isExpanded
                            ? 'Ocultar detalhes dos exercícios'
                            : `Ver ${log.entries.length} exercícios executados`}
                        </span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#FFAA00]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8FAFBD]" />
                      )}
                    </button>

                    {/* Expanded Exercises List */}
                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-[#031F38] border border-[#14527A] space-y-2.5 animate-in fade-in">
                        {log.entries.map((entry, eIdx) => {
                          const validSets = entry.sets.filter((s) => s.completed && s.weightKg > 0);
                          const maxWeight =
                            validSets.length > 0 ? Math.max(...validSets.map((s) => s.weightKg)) : 0;

                          return (
                            <div
                              key={eIdx}
                              className="p-2.5 rounded-lg bg-[#082F52] border border-[#14527A]/80 flex items-start justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-bold text-[#E8F4F8] flex items-center gap-2">
                                  <span>{entry.exerciseName}</span>
                                  {entry.advancedTechniqueId && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenTechniqueModal?.(entry.advancedTechniqueId!)
                                      }
                                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/30 hover:bg-[#FFAA00]/30"
                                    >
                                      {entry.advancedTechniqueId.toUpperCase()}
                                    </button>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#8FAFBD] mt-0.5">
                                  {entry.sets.length} séries • Alvo: {entry.targetReps} reps
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {entry.sets.map((set, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                        set.completed
                                          ? 'bg-[#00C98B]/15 text-[#00C98B] border border-[#00C98B]/30'
                                          : 'bg-[#031F38] text-[#64879A] border border-[#14527A]'
                                      }`}
                                    >
                                      S{set.setNumber}: {set.weightKg}kg × {set.repsCompleted}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {maxWeight > 0 && (
                                <div className="text-right flex-shrink-0">
                                  <span className="text-[10px] text-[#64879A] uppercase block font-semibold">
                                    Carga Máx.
                                  </span>
                                  <span className="text-sm font-black text-[#FFAA00]">
                                    {String(maxWeight).replace('.', ',')} kg
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-2xl bg-[#082F52] border border-[#14527A] text-center text-[#8FAFBD] space-y-3">
            <Trophy className="w-10 h-10 text-[#64879A] mx-auto" />
            <h4 className="text-sm font-bold text-[#E8F4F8]">
              {searchFilter
                ? 'Nenhum treino corresponde à busca'
                : 'Nenhum treino finalizado ainda'}
            </h4>
            <p className="text-xs text-[#8FAFBD] max-w-sm mx-auto">
              {searchFilter
                ? 'Tente pesquisar com outro termo ou limpe o campo de busca.'
                : 'Ao concluir sua primeira sessão na aba "Treino", o histórico de duração, calorias e cargas aparecerá registrado aqui.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

