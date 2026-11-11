import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Info,
  Flame,
  Clock,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Play,
  Youtube,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ADVANCED_TECHNIQUES, getTechniqueById } from '../data/techniques';
import { MASTER_TECHNIQUE_INTRO_VIDEO } from '../data/exerciseVideosData';
import { ExerciseVideoModal } from './ExerciseVideoModal';

interface Props {
  selectedTechniqueId?: string | null;
  onClose: () => void;
  isOpen: boolean;
}

export const TechniquesDictionaryModal: React.FC<Props> = ({
  selectedTechniqueId,
  onClose,
  isOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTechniqueId, setExpandedTechniqueId] = useState<string | null>(() => {
    return selectedTechniqueId ? getTechniqueById(selectedTechniqueId)?.id || null : null;
  });

  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    category?: string;
    videoUrl: string;
    notes?: string;
  } | null>(null);

  // Auto-expand and scroll if a specific technique is requested from workout
  useEffect(() => {
    if (isOpen && selectedTechniqueId) {
      const t = getTechniqueById(selectedTechniqueId);
      if (t) {
        setExpandedTechniqueId(t.id);
        setTimeout(() => {
          const el = document.getElementById(`technique-accordion-${t.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      }
    }
  }, [selectedTechniqueId, isOpen]);

  // If search matches exactly 1 technique, auto-expand it
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const term = searchTerm.toLowerCase();
      const matches = Object.values(ADVANCED_TECHNIQUES).filter((t) =>
        t.name.toLowerCase().includes(term) ||
        t.shortName.toLowerCase().includes(term) ||
        t.subtitle.toLowerCase().includes(term)
      );
      if (matches.length === 1) {
        setExpandedTechniqueId(matches[0].id);
      }
    }
  }, [searchTerm]);

  if (!isOpen) return null;

  const allTechniques = Object.values(ADVANCED_TECHNIQUES);
  const filteredTechniques = allTechniques.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.shortName.toLowerCase().includes(term) ||
      t.subtitle.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.exampleFromWorkout.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div
        id="technique-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#031F38]/85 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          id="technique-modal-card"
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#082F52] border border-[#14527A] rounded-2xl shadow-2xl overflow-hidden text-[#E8F4F8]"
        >
          {/* Compact, Clean Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#14527A] bg-[#082F52]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/25 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[#E8F4F8] leading-tight truncate">
                  Técnicas Avançadas
                </h2>
                <p className="text-[11px] text-[#8FAFBD] truncate">
                  Metodologia & Vídeos Leandro Twin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Compact Intro Video Shortcut */}
              <button
                id="watch-intro-video-top-btn"
                type="button"
                onClick={() =>
                  setActiveVideoModal({
                    title: MASTER_TECHNIQUE_INTRO_VIDEO.title,
                    category: 'Obrigatório',
                    videoUrl: MASTER_TECHNIQUE_INTRO_VIDEO.videoUrl,
                    notes: MASTER_TECHNIQUE_INTRO_VIDEO.description,
                  })
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Assista as orientações primordiais sobre técnicas"
              >
                <Play className="w-3 h-3 fill-current text-red-500" />
                <span className="hidden xs:inline">Vídeo de Introdução</span>
                <span className="xs:hidden">Introdução</span>
              </button>

              <button
                id="close-technique-modal-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8FAFBD] hover:text-[#E8F4F8] hover:bg-[#0B3A61] transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-[#14527A] bg-[#031F38]/70 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64879A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="technique-search-input"
                type="text"
                placeholder="Pesquisar técnica (ex: FST-7, Rest-Pause, Gironda, SST...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#082F52] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64879A] hover:text-[#E8F4F8] p-0.5"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#8FAFBD] whitespace-nowrap hidden sm:inline px-1">
              {filteredTechniques.length} {filteredTechniques.length === 1 ? 'técnica' : 'técnicas'}
            </span>
          </div>

          {/* Collapsible Accordion List */}
          <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[68vh]">
            {filteredTechniques.length === 0 ? (
              <div className="text-center py-10 text-[#8FAFBD]">
                <p className="text-sm font-medium">Nenhuma técnica encontrada para &ldquo;{searchTerm}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs font-bold text-[#FFAA00] hover:underline"
                >
                  Limpar pesquisa
                </button>
              </div>
            ) : (
              filteredTechniques.map((tech) => {
                const isOpen = expandedTechniqueId === tech.id;
                return (
                  <div
                    key={tech.id}
                    id={`technique-accordion-${tech.id}`}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isOpen
                        ? 'bg-[#082F52] border-[#FFAA00]/50 shadow-md ring-1 ring-[#FFAA00]/30'
                        : 'bg-[#082F52] hover:bg-[#0B3A61]/50 border-[#14527A]'
                    }`}
                  >
                    {/* Collapsible Row Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedTechniqueId(isOpen ? null : tech.id)}
                      className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 transition-colors ${
                            isOpen
                              ? 'bg-[#FFAA00] text-[#031F38]'
                              : 'bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/25'
                          }`}
                        >
                          {tech.shortName}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-[#E8F4F8] leading-tight truncate">
                              {tech.name}
                            </h3>
                            {tech.videoUrl && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-600/15 px-2 py-0.5 rounded-full border border-red-500/20">
                                <Youtube className="w-3 h-3 text-red-500" />
                                <span className="hidden xs:inline">Vídeo</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8FAFBD] truncate mt-0.5">
                            {tech.subtitle} • <span className="text-[#FFAA00] font-semibold">Descanso: {tech.restInterval}</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 p-1 text-[#8FAFBD]">
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#FFAA00]" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    {isOpen && (
                      <div className="px-3.5 sm:px-4 pb-4 pt-2 border-t border-[#14527A] space-y-3.5 animate-in fade-in duration-200">
                        {/* Video Button */}
                        {tech.videoUrl && (
                          <div>
                            <button
                              id={`watch-tech-video-${tech.id}`}
                              type="button"
                              onClick={() =>
                                setActiveVideoModal({
                                  title: tech.name,
                                  category: 'Técnica Avançada',
                                  videoUrl: tech.videoUrl!,
                                  notes: tech.description,
                                })
                              }
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#CE3426] hover:bg-[#D83D31] text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Assistir Vídeo da Técnica (YouTube)</span>
                            </button>
                          </div>
                        )}

                        {/* Description */}
                        <div className="p-3 rounded-xl bg-[#031F38] border border-[#14527A]">
                          <p className="text-xs sm:text-sm text-[#E8F4F8] leading-relaxed">
                            {tech.description}
                          </p>
                        </div>

                        {/* Step by Step */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD] mb-2 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-[#FFAA00]" />
                            Passo a Passo de Execução
                          </h4>
                          <div className="space-y-1.5">
                            {tech.stepByStep.map((step, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0B3A61] border border-[#14527A]"
                              >
                                <span className="shrink-0 w-5 h-5 rounded-full bg-[#FFAA00]/20 text-[#FFAA00] text-[11px] font-black flex items-center justify-center border border-[#FFAA00]/30 mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-xs sm:text-sm text-[#E8F4F8]">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hypertrophic Mechanism & Example */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-xl bg-[#031F38] border border-[#14527A] space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFAA00]">
                              <Sparkles className="w-3.5 h-3.5" />
                              Mecanismo Hipertrófico
                            </div>
                            <p className="text-xs text-[#8FAFBD] leading-relaxed">
                              {tech.scientificPurpose}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-[#031F38] border border-[#14527A] space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#38C6D9]">
                              <Info className="w-3.5 h-3.5" />
                              Exemplo na Ficha Twin
                            </div>
                            <p className="text-xs text-[#8FAFBD] leading-relaxed">
                              {tech.exampleFromWorkout}
                            </p>
                          </div>
                        </div>

                        {/* Safety tips */}
                        <div className="p-3 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/25 flex items-start gap-2.5">
                          <ShieldAlert className="w-4 h-4 text-[#FF5C5C] shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-bold text-[#FF5C5C]">Dica de Segurança & Biomecânica</h5>
                            <p className="text-xs text-[#E8F4F8] mt-0.5">{tech.safetyTips}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Minimalist Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-[#14527A] bg-[#082F52] flex items-center justify-between gap-2">
            <div className="text-[11px] text-[#8FAFBD] flex items-center gap-1.5 truncate">
              <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">Vídeos oficiais Leandro Twin (CREF: 128544-G/SP)</span>
            </div>
            <button
              id="close-technique-modal-bottom-btn"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#0B3A61] hover:bg-[#10466D] text-[#E8F4F8] text-xs font-bold transition-colors border border-[#14527A] shrink-0 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Video Player Modal */}
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
    </>
  );
};
