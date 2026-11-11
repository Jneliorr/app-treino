import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Activity,
  Flame,
  Scale,
  Award,
  Calendar,
  Save,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Dumbbell,
  Clock,
  RotateCcw,
  Moon,
  Sun,
  ChevronRight,
  Heart,
} from 'lucide-react';
import {
  loadWorkoutLogs,
  resetToTwinRoutines,
  clearRoutineDraft,
  loadRoutines,
  loadSavedTheme,
  saveTheme,
  ThemeMode,
  loadUserProfileData,
  saveUserProfileData,
  loadAthleteProfiles,
  getActiveProfileId,
} from '../services/storage';

export const UserProfileView: React.FC<{
  onOpenFirestoreDoc: () => void;
  onOpenSpreadsheetTab: () => void;
  onSelectRoutine: (routineId: string) => void;
  currentTheme?: ThemeMode;
  onToggleTheme?: (theme: ThemeMode) => void;
  onOpenAthleteModal?: () => void;
}> = ({
  onOpenFirestoreDoc,
  onOpenSpreadsheetTab,
  onSelectRoutine,
  currentTheme = 'dark',
  onToggleTheme,
  onOpenAthleteModal,
}) => {
  const [profile, setProfile] = useState(() => loadUserProfileData());
  const [isSaved, setIsSaved] = useState(false);

  const activeProfileId = getActiveProfileId();
  const athleteProfiles = loadAthleteProfiles();
  const currentAthlete = athleteProfiles.find((p) => p.id === activeProfileId) || athleteProfiles[0];

  useEffect(() => {
    setProfile(loadUserProfileData());
  }, [activeProfileId]);

  const logs = loadWorkoutLogs();
  const routines = loadRoutines();

  const totalWorkouts = logs.length;
  const totalTonnage = logs.reduce((acc, l) => acc + (l.totalTonnageKg || 0), 0);
  const totalCalories = logs.reduce((acc, l) => acc + (l.caloriesBurned || 0), 0);
  const totalMinutes = logs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveUserProfileData(profile);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    }
  };

  return (
    <div id="user-profile-container" className="space-y-4 pb-28 text-[#E8F4F8]">
      {/* Athlete Selector Quick Card */}
      {onOpenAthleteModal && (
        <div
          onClick={onOpenAthleteModal}
          className="p-3.5 bg-gradient-to-r from-[#082F52] to-[#0B3A61] border border-[#FFAA00]/40 rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:border-[#FFAA00] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-[#031F38] shadow-sm flex-shrink-0"
              style={{ backgroundColor: currentAthlete?.color || '#FFAA00' }}
            >
              {currentAthlete?.avatarInitial || currentAthlete?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FFAA00] uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Atleta Ativo
                </span>
                {currentAthlete?.gender === 'female' && (
                  <span className="text-[10px] text-[#EC4899] font-bold">♀ Feminino</span>
                )}
                {currentAthlete?.gender === 'male' && (
                  <span className="text-[10px] text-[#38C6D9] font-bold">♂ Masculino</span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-[#E8F4F8] leading-tight">
                {currentAthlete?.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFAA00] group-hover:text-[#FFB82E]">
            <span>Trocar Atleta</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-[#031F38] shadow-sm"
            style={{ backgroundColor: currentAthlete?.color || '#FFAA00' }}
          >
            {currentAthlete?.avatarInitial || profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#E8F4F8]">{profile.name}</h2>
            <p className="text-xs text-[#8FAFBD]">Perfil do Atleta & Estatísticas Individuais</p>
          </div>
        </div>
      </div>


      {/* Global Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#082F52] border border-[#14527A] shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-[#64879A] block">Treinos Concluídos</span>
          <span className="text-lg font-black text-[#FFAA00] mt-0.5 block">{totalWorkouts}</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#082F52] border border-[#14527A] shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-[#64879A] block">Volume Total</span>
          <span className="text-lg font-black text-[#38C6D9] mt-0.5 block">
            {totalTonnage > 1000 ? `${(totalTonnage / 1000).toFixed(1)} t` : `${totalTonnage} kg`}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#082F52] border border-[#14527A] shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-[#64879A] block">Calorias Queimadas</span>
          <span className="text-lg font-black text-[#FFAA00] mt-0.5 block">
            {totalCalories.toLocaleString('pt-BR')} kcal
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#082F52] border border-[#14527A] shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-[#64879A] block">Tempo Total</span>
          <span className="text-lg font-black text-[#E8F4F8] mt-0.5 block">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD] flex items-center gap-1.5 pb-1 border-b border-[#14527A]">
          <Scale className="w-3.5 h-3.5 text-[#FFAA00]" />
          Dados Físicos & Metas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-[#8FAFBD] block mb-1">Nome / Identificação</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#031F38] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-[#8FAFBD] block mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-[#031F38] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00] text-center"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#8FAFBD] block mb-1">Altura (cm)</label>
              <input
                type="number"
                inputMode="numeric"
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-xs bg-[#031F38] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00] text-center"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-[#8FAFBD] block mb-1">Objetivo Atual</label>
            <input
              type="text"
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#031F38] border border-[#14527A] rounded-xl text-[#E8F4F8] placeholder-[#64879A] focus:outline-none focus:border-[#FFAA00]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Dados Salvos!' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>

      {/* Aparência & Tema (Modo Escuro / Modo Claro) */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFAA00]/15 text-[#FFAA00]">
              {currentTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8F4F8]">
                Aparência da Aplicação
              </h3>
              <p className="text-[11px] text-[#8FAFBD]">
                Alterne entre o Dark Blue esportivo ou o Modo Claro Leandro Twin
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            id="theme-select-dark"
            onClick={() => onToggleTheme && onToggleTheme('dark')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
              currentTheme === 'dark'
                ? 'bg-[#031F38] border-[#FFAA00] shadow-md shadow-[#FFAA00]/15 text-[#FFAA00]'
                : 'bg-[#031F38] border-[#14527A] text-[#8FAFBD] hover:text-[#E8F4F8]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#082F52] border border-[#14527A] flex items-center justify-center text-[#FFAA00]">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">Modo Escuro</span>
              <span className="text-[10px] text-[#8FAFBD]">Dark Blue & Laranja</span>
            </div>
          </button>

          <button
            type="button"
            id="theme-select-light"
            onClick={() => onToggleTheme && onToggleTheme('light')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
              currentTheme === 'light'
                ? 'bg-[#082F52] border-[#FFAA00] shadow-md text-[#FFAA00]'
                : 'bg-[#031F38] border-[#14527A] text-[#8FAFBD] hover:text-[#E8F4F8]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFAA00]/20 border border-[#FFAA00]/40 flex items-center justify-center text-[#FFAA00]">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">Modo Claro</span>
              <span className="text-[10px] text-[#8FAFBD]">Branco & Vermelho Twin</span>
            </div>
          </button>
        </div>
      </div>

      {/* Advanced Quick Navigation Links */}
      <div className="p-4 bg-[#082F52] border border-[#14527A] rounded-2xl shadow-md space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8FAFBD]">Recursos do Sistema</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenSpreadsheetTab}
            className="p-3 rounded-xl bg-[#031F38] border border-[#14527A] hover:border-[#FFAA00]/50 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-[#00C98B]" />
              <div>
                <span className="text-xs font-bold text-[#E8F4F8] block group-hover:text-[#FFAA00]">
                  Importar / Exportar Fichas
                </span>
                <span className="text-[10px] text-[#8FAFBD]">Excel (.xlsx), CSV ou Backup JSON</span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenFirestoreDoc}
            className="p-3 rounded-xl bg-[#031F38] border border-[#14527A] hover:border-[#FFAA00]/50 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#FFAA00]" />
              <div>
                <span className="text-xs font-bold text-[#E8F4F8] block group-hover:text-[#FFAA00]">
                  Arquitetura NoSQL Firestore
                </span>
                <span className="text-[10px] text-[#8FAFBD]">Diagrama ABAC, coleções e regras</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
