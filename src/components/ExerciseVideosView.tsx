import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  ExternalLink,
  Youtube,
  ShieldCheck,
  Dumbbell,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import {
  EXERCISE_VIDEOS_CATALOG,
  MASTER_TECHNIQUE_INTRO_VIDEO,
  LEANDRO_TWIN_CONTACT,
  ExerciseVideoItem,
} from '../data/exerciseVideosData';
import { ExerciseVideoModal } from './ExerciseVideoModal';

interface Props {
  onOpenTechniqueModal: () => void;
}

const MUSCLE_GROUPS = [
  'Todos',
  'Peitoral',
  'Dorsais',
  'Deltóides',
  'Trapézio',
  'Tríceps',
  'Bíceps',
  'Antebraço',
  'Coxas',
  'Glúteos',
  'Panturrilhas',
  'Abdômen / Core',
  'Alongamentos',
];

export const ExerciseVideosView: React.FC<Props> = ({ onOpenTechniqueModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    category?: string;
    videoUrl: string;
  } | null>(null);

  const filteredVideos = useMemo(() => {
    return EXERCISE_VIDEOS_CATALOG.filter((item) => {
      const matchesGroup =
        selectedGroup === 'Todos' || item.muscleGroup === selectedGroup;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.muscleGroup.toLowerCase().includes(term);

      return matchesGroup && matchesSearch;
    });
  }, [selectedGroup, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#082F52] via-[#0A3D68] to-[#082F52] border border-[#14527A] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold">
              <Youtube className="w-3.5 h-3.5" />
              <span>Vídeos dos Exercícios • Leandro Twin</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#E8F4F8] tracking-tight">
              Biblioteca de Execução Técnica
            </h2>
            <p className="text-xs sm:text-sm text-[#8FAFBD] leading-relaxed">
              {LEANDRO_TWIN_CONTACT.channelNotice}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              id="watch-intro-video-btn"
              onClick={() =>
                setActiveVideoModal({
                  title: MASTER_TECHNIQUE_INTRO_VIDEO.title,
                  category: 'Obrigatório',
                  videoUrl: MASTER_TECHNIQUE_INTRO_VIDEO.videoUrl,
                })
              }
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#CE3426] hover:bg-[#D83D31] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Assista Antes Esse Vídeo</span>
            </button>

            <button
              id="open-techniques-from-videos-btn"
              onClick={onOpenTechniqueModal}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#031F38] hover:bg-[#14527A]/40 border border-[#14527A] text-[#FFAA00] text-xs font-bold transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Menu de Técnicas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64879A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-exercise-videos-input"
            type="text"
            placeholder="Buscar por nome do exercício (ex: Supino, Puxada, Remada, Agachamento, Tríceps, Stiff...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#082F52] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00] focus:ring-1 focus:ring-[#FFAA00]/30 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8FAFBD] hover:text-[#E8F4F8] bg-[#031F38] px-2 py-0.5 rounded"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Muscle Groups Horizontal Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {MUSCLE_GROUPS.map((group) => {
            const isSelected = selectedGroup === group;
            const count =
              group === 'Todos'
                ? EXERCISE_VIDEOS_CATALOG.length
                : EXERCISE_VIDEOS_CATALOG.filter((i) => i.muscleGroup === group).length;

            return (
              <button
                key={group}
                id={`filter-group-${group.toLowerCase().replace(/[ /]/g, '-')}`}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#FFAA00] text-[#031F38] font-bold shadow-sm'
                    : 'bg-[#082F52] text-[#8FAFBD] hover:text-[#E8F4F8] hover:bg-[#0B3A61] border border-[#14527A]/50'
                }`}
              >
                <span>{group}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black/20 text-[#031F38]' : 'bg-[#031F38] text-[#64879A]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#8FAFBD] px-1">
        <span>
          Exibindo <strong className="text-[#E8F4F8]">{filteredVideos.length}</strong> exercícios mapeados
        </span>
        <span className="text-[11px] text-[#64879A]">Clique no card para reproduzir o vídeo</span>
      </div>

      {/* Exercise Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredVideos.map((item: ExerciseVideoItem) => (
          <div
            key={item.id}
            id={`exercise-video-card-${item.id}`}
            onClick={() =>
              setActiveVideoModal({
                title: item.name,
                category: item.muscleGroup,
                videoUrl: item.videoUrl,
              })
            }
            className="group bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] hover:border-[#FFAA00]/40 rounded-xl p-3.5 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between gap-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#031F38] text-[#38C6D9] border border-[#14527A]/60">
                  {item.muscleGroup}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-red-400 group-hover:text-red-300 font-medium">
                  <Youtube className="w-3 h-3" />
                  YouTube
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-[#E8F4F8] group-hover:text-white leading-snug line-clamp-2">
                {item.name}
              </h4>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#14527A]/40 text-xs">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFAA00] group-hover:underline">
                <Play className="w-3.5 h-3.5 fill-[#FFAA00]" />
                Ver Execução
              </span>

              <a
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(e) => e.stopPropagation()}
                className="p-1 text-[#64879A] hover:text-[#E8F4F8] transition-colors"
                title="Abrir diretamente no YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}

        {filteredVideos.length === 0 && (
          <div className="col-span-full py-12 text-center space-y-3 bg-[#082F52]/50 border border-dashed border-[#14527A] rounded-2xl">
            <Dumbbell className="w-10 h-10 text-[#64879A] mx-auto opacity-40" />
            <p className="text-sm text-[#8FAFBD]">
              Nenhum exercício encontrado para "{searchTerm}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGroup('Todos');
              }}
              className="text-xs font-bold text-[#FFAA00] hover:underline"
            >
              Limpar filtros de busca
            </button>
          </div>
        )}
      </div>

      {/* Footer Info / Support Leandro Twin */}
      <div className="bg-[#082F52]/60 border border-[#14527A] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8FAFBD]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00C98B] shrink-0" />
          <span>
            Material pedagógico oficial <strong>Leandro Twin</strong> (CREF: {LEANDRO_TWIN_CONTACT.cref}).
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={LEANDRO_TWIN_CONTACT.website}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-[#FFAA00] hover:underline font-bold"
          >
            <span>Não encontrou o que queria? Clique aqui!</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <ExerciseVideoModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          title={activeVideoModal.title}
          category={activeVideoModal.category}
          videoUrl={activeVideoModal.videoUrl}
        />
      )}
    </div>
  );
};
