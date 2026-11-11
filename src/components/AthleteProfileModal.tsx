import React, { useState } from 'react';
import {
  X,
  User,
  Users,
  Check,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Heart,
  Dumbbell,
  Shield,
  Save,
} from 'lucide-react';
import { AthleteProfile } from '../types';
import {
  loadAthleteProfiles,
  addAthleteProfile,
  updateAthleteProfile,
  deleteAthleteProfile,
} from '../services/storage';

interface AthleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
}

const COLOR_PALETTE = [
  { name: 'Dourado', hex: '#FFAA00' },
  { name: 'Rosa / Pink', hex: '#EC4899' },
  { name: 'Esmeralda', hex: '#00C98B' },
  { name: 'Roxo / Violeta', hex: '#8B5CF6' },
  { name: 'Ciano', hex: '#06B6D4' },
  { name: 'Vermelho / Coral', hex: '#EF4444' },
  { name: 'Azul', hex: '#3B82F6' },
];

export const AthleteProfileModal: React.FC<AthleteProfileModalProps> = ({
  isOpen,
  onClose,
  activeProfileId,
  onSelectProfile,
}) => {
  const [profiles, setProfiles] = useState<AthleteProfile[]>(() => loadAthleteProfiles());
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // New profile form state
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('female');
  const [newColor, setNewColor] = useState('#EC4899');

  // Edit profile form state
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>('female');
  const [editColor, setEditColor] = useState('#EC4899');

  if (!isOpen) return null;

  const refreshProfiles = () => {
    setProfiles(loadAthleteProfiles());
  };

  const handleSelect = (id: string) => {
    onSelectProfile(id);
    onClose();
  };

  const handleStartAdd = () => {
    setNewName('');
    setNewGender('female');
    setNewColor('#EC4899');
    setIsAddingNew(true);
    setEditingProfileId(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addAthleteProfile(newName.trim(), newGender, newColor);
    refreshProfiles();
    setIsAddingNew(false);
    onSelectProfile(created.id);
    onClose();
  };

  const handleStartEdit = (p: AthleteProfile) => {
    setEditingProfileId(p.id);
    setEditName(p.name);
    setEditGender(p.gender || 'female');
    setEditColor(p.color || '#FFAA00');
    setIsAddingNew(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfileId || !editName.trim()) return;

    const target = profiles.find((p) => p.id === editingProfileId);
    if (target) {
      updateAthleteProfile({
        ...target,
        name: editName.trim(),
        gender: editGender,
        color: editColor,
        avatarInitial: editName.trim().charAt(0).toUpperCase(),
      });
      refreshProfiles();
      setEditingProfileId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (id === 'default') return;
    if (window.confirm('Tem certeza que deseja apagar este perfil? Todos os treinos e registros dele serão excluídos.')) {
      const remaining = deleteAthleteProfile(id);
      setProfiles(remaining);
      if (activeProfileId === id) {
        onSelectProfile('default');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#082F52] border border-[#14527A] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#14527A] flex items-center justify-between bg-[#031F38]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFAA00]/15 border border-[#FFAA00]/30 text-[#FFAA00] flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#E8F4F8] leading-tight">
                Trocar Atleta / Perfil
              </h2>
              <p className="text-[11px] text-[#8FAFBD]">
                Cada atleta tem fichas, cargas e histórico 100% individuais
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8FAFBD] hover:text-[#E8F4F8] hover:bg-[#14527A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* New Profile Form */}
          {isAddingNew && (
            <form onSubmit={handleSaveNew} className="p-3.5 rounded-xl bg-[#031F38] border border-[#FFAA00]/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FFAA00] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Novo Atleta
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[11px] text-[#8FAFBD] hover:text-[#E8F4F8]"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8FAFBD] uppercase tracking-wider block mb-1">
                  Nome do Atleta
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Esposa, Camila, João..."
                  required
                  autoFocus
                  className="w-full bg-[#082F52] border border-[#14527A] focus:border-[#FFAA00] rounded-xl px-3 py-2 text-xs font-semibold text-[#E8F4F8] placeholder-[#64879A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8FAFBD] uppercase tracking-wider block mb-1">
                  Gênero / Estilo de Treino
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewGender('female');
                      setNewColor('#EC4899');
                    }}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newGender === 'female'
                        ? 'bg-[#EC4899]/20 border-[#EC4899] text-[#EC4899]'
                        : 'bg-[#082F52] border-[#14527A] text-[#8FAFBD]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Feminino</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewGender('male');
                      setNewColor('#FFAA00');
                    }}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newGender === 'male'
                        ? 'bg-[#FFAA00]/20 border-[#FFAA00] text-[#FFAA00]'
                        : 'bg-[#082F52] border-[#14527A] text-[#8FAFBD]'
                    }`}
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Masculino</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8FAFBD] uppercase tracking-wider block mb-1.5">
                  Cor do Perfil
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PALETTE.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setNewColor(col.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        newColor === col.hex ? 'scale-125 border-white shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00C98B] hover:bg-[#00B07A] text-[#031F38] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Criar Perfil e Ativar</span>
              </button>
            </form>
          )}

          {/* Profiles List */}
          <div className="space-y-2.5">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              const isEditing = profile.id === editingProfileId;

              if (isEditing) {
                return (
                  <form
                    key={profile.id}
                    onSubmit={handleSaveEdit}
                    className="p-3 rounded-xl bg-[#031F38] border border-[#FFAA00]/40 space-y-2.5 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FFAA00]">Editar Perfil</span>
                      <button
                        type="button"
                        onClick={() => setEditingProfileId(null)}
                        className="text-[11px] text-[#8FAFBD] hover:text-[#E8F4F8]"
                      >
                        Cancelar
                      </button>
                    </div>

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome do atleta"
                      required
                      className="w-full bg-[#082F52] border border-[#14527A] focus:border-[#FFAA00] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#E8F4F8] focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                      {COLOR_PALETTE.map((col) => (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setEditColor(col.hex)}
                          className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                            editColor === col.hex ? 'scale-125 border-white' : 'border-transparent opacity-70'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 rounded-lg bg-[#FFAA00] text-[#031F38] text-xs font-bold transition-all active:scale-95"
                    >
                      Salvar Alterações
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelect(profile.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#082F52] border-2 border-[#FFAA00] shadow-md shadow-[#FFAA00]/10 ring-1 ring-[#FFAA00]/30'
                      : 'bg-[#031F38]/80 hover:bg-[#031F38] border-[#14527A]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-[#031F38] shadow-sm flex-shrink-0"
                      style={{ backgroundColor: profile.color || '#FFAA00' }}
                    >
                      {profile.avatarInitial || profile.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#E8F4F8] truncate">
                          {profile.name}
                        </span>
                        {profile.id === 'default' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0B3A61] text-[#8FAFBD] font-semibold border border-[#14527A]">
                            Principal
                          </span>
                        )}
                        {profile.gender === 'female' && (
                          <span className="text-[10px] text-[#EC4899]">♀</span>
                        )}
                        {profile.gender === 'male' && (
                          <span className="text-[10px] text-[#38C6D9]">♂</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8FAFBD]">
                        {isActive ? (
                          <span className="text-[#00C98B] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Perfil Ativo no Momento
                          </span>
                        ) : (
                          <span>Toque para usar a ficha de {profile.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(profile)}
                      className="p-1.5 rounded-lg text-[#64879A] hover:text-[#FFAA00] hover:bg-[#0B3A61] transition-colors cursor-pointer"
                      title="Editar nome/cor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {profile.id !== 'default' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id)}
                        className="p-1.5 rounded-lg text-[#64879A] hover:text-[#FF5C5C] hover:bg-[#FF5C5C]/10 transition-colors cursor-pointer"
                        title="Excluir perfil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Profile Trigger Button */}
          {!isAddingNew && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#14527A] hover:border-[#FFAA00] text-[#FFAA00] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-[#FFAA00]/5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Outro Atleta (Esposa / Amigo)</span>
            </button>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 border-t border-[#14527A] bg-[#031F38]/80 text-[10px] text-[#8FAFBD] text-center">
          Os treinos, cargas e histórico de cada perfil ficam salvos de forma independente e isolada.
        </div>
      </div>
    </div>
  );
};
