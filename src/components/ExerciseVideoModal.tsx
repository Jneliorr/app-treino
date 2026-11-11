import React from 'react';
import { X, ExternalLink, Play, Check, Share2, Youtube } from 'lucide-react';
import { getYoutubeEmbedUrl, getYoutubeVideoId } from '../data/exerciseVideosData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  videoUrl: string;
  notes?: string;
}

export const ExerciseVideoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  category,
  videoUrl,
  notes,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !videoUrl) return null;

  const youtubeId = getYoutubeVideoId(videoUrl);
  const embedUrl = getYoutubeEmbedUrl(youtubeId || videoUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="exercise-video-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#031F38]/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="exercise-video-modal-card"
        className="relative w-full max-w-2xl bg-[#082F52] border border-[#14527A] rounded-2xl shadow-2xl overflow-hidden text-[#E8F4F8] flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#14527A] bg-[#031F38]/70">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Youtube className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#14527A]/50 text-[#38C6D9]">
                  {category || 'Execução'}
                </span>
                <span className="text-[10px] text-[#8FAFBD] hidden sm:inline">Guia Leandro Twin</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#E8F4F8] truncate leading-snug">
                {title}
              </h3>
            </div>
          </div>

          <button
            id="close-video-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8FAFBD] hover:text-[#E8F4F8] hover:bg-[#0B3A61] transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-center p-6 space-y-3">
              <Play className="w-12 h-12 text-[#8FAFBD] mx-auto opacity-50" />
              <p className="text-sm text-[#8FAFBD]">Vídeo de demonstração técnica</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#CE3426] text-white text-xs font-bold hover:bg-[#D83D31] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Assistir no YouTube
              </a>
            </div>
          )}
        </div>

        {/* Footer info and quick links */}
        <div className="p-3.5 sm:p-4 bg-[#082F52] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-[#14527A]">
          <div className="text-[#8FAFBD] text-center sm:text-left w-full sm:w-auto">
            {notes ? (
              <p className="line-clamp-2">{notes}</p>
            ) : (
              <p>
                Siga rigorosamente a cadência, pegada e amplitude demonstradas pelo professor.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="copy-video-link-btn"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#031F38] border border-[#14527A] text-[#8FAFBD] hover:text-[#E8F4F8] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <a
              id="open-youtube-external-btn"
              href={videoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#CE3426] hover:bg-[#D83D31] text-white font-bold transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
