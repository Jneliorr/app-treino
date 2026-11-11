import React, { useState, useEffect, useMemo } from 'react';
import {
  Dumbbell,
  TrendingUp,
  Trophy,
  BookOpen,
  ClipboardList,
  User,
  Users,
  Info,
  Calendar,
  Sparkles,
  Moon,
  Sun,
  Youtube,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { Routine } from './types';
import {
  loadRoutines,
  loadSavedActiveRoutineId,
  saveSavedActiveRoutineId,
  loadSavedTheme,
  saveTheme,
  ThemeMode,
  loadWeeks,
  loadActiveWeekId,
  saveActiveWeekId,
  getActiveProfileId,
  setActiveProfileId,
  loadAthleteProfiles,
} from './services/storage';
import { WorkoutActiveView } from './components/WorkoutActiveView';
import { WorkoutWeeksHubView } from './components/WorkoutWeeksHubView';
import { ProgressionHistoryView } from './components/ProgressionHistoryView';
import { TechniquesDictionaryModal } from './components/TechniquesDictionaryModal';
import { SpreadsheetImportView } from './components/SpreadsheetImportView';
import { FirestoreArchitectureView } from './components/FirestoreArchitectureView';
import { UserProfileView } from './components/UserProfileView';
import { ExerciseVideosView } from './components/ExerciseVideosView';
import { AthleteProfileModal } from './components/AthleteProfileModal';

type TabType = 'workout' | 'videos' | 'history' | 'sheets' | 'profile' | 'firestore_doc';

export default function App() {
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => getActiveProfileId());
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState<boolean>(false);
  const athleteProfiles = loadAthleteProfiles();

  const activeAthlete = useMemo(() => {
    return athleteProfiles.find((p) => p.id === activeProfileId) || athleteProfiles[0];
  }, [activeProfileId, athleteProfiles]);

  const [activeWeekId, setActiveWeekId] = useState<string>(() => loadActiveWeekId());
  const [routines, setRoutines] = useState<Routine[]>(() => loadRoutines());
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(() => {
    const loaded = loadRoutines();
    const saved = loadSavedActiveRoutineId();
    if (saved && loaded.some((r) => r.id === saved)) {
      return saved;
    }
    return loaded.length > 0 ? loaded[0].id : 'treino-a';
  });

  const handleSwitchAthleteProfile = (newProfileId: string) => {
    setActiveProfileId(newProfileId);
    setActiveProfileIdState(newProfileId);

    const newActiveWeekId = loadActiveWeekId(newProfileId);
    setActiveWeekId(newActiveWeekId);
    const newRoutines = loadRoutines(newProfileId);
    setRoutines(newRoutines);
    const savedActiveRoutine = loadSavedActiveRoutineId(newProfileId);
    if (savedActiveRoutine && newRoutines.some((r) => r.id === savedActiveRoutine)) {
      setSelectedRoutineId(savedActiveRoutine);
    } else {
      setSelectedRoutineId(newRoutines.length > 0 ? newRoutines[0].id : '');
    }
    setIsWorkoutActiveScreen(false);
  };

  // Controla se está visualizando a tela do menu de semanas ou o treino ativo
  const [isWorkoutActiveScreen, setIsWorkoutActiveScreen] = useState<boolean>(false);

  // Nome da semana ativa atual
  const activeWeekName = useMemo(() => {
    const weeks = loadWeeks();
    const current = weeks.find((w) => w.id === activeWeekId);
    return current?.name || 'Semana 1';
  }, [activeWeekId, routines]);

  // Dark / Light Theme Mode state
  const [theme, setTheme] = useState<ThemeMode>(() => loadSavedTheme());

  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0A0A0A');
      }
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#F5F6F8');
      }
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = (newTheme?: ThemeMode) => {
    setTheme((prev) => {
      const next = newTheme ? newTheme : prev === 'dark' ? 'light' : 'dark';
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState<TabType>('workout');
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [isTechniqueModalOpen, setIsTechniqueModalOpen] = useState(false);
  const [targetExerciseForHistory, setTargetExerciseForHistory] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openTechniqueModal = (techniqueId: string) => {
    setSelectedTechniqueId(techniqueId);
    setIsTechniqueModalOpen(true);
  };

  const handleStartWorkout = (routineId: string, weekId: string) => {
    saveActiveWeekId(weekId);
    setActiveWeekId(weekId);
    const weekRoutines = loadRoutines();
    setRoutines(weekRoutines);
    setSelectedRoutineId(routineId);
    saveSavedActiveRoutineId(routineId);
    setIsWorkoutActiveScreen(true);
  };

  const handleSelectRoutine = (routineId: string) => {
    setSelectedRoutineId(routineId);
    saveSavedActiveRoutineId(routineId);
  };

  const handleViewHistoryForExercise = (exerciseName: string) => {
    setTargetExerciseForHistory(exerciseName);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-[#031F38] text-[#E8F4F8] flex flex-col antialiased">
      {/* Top Mobile/Desktop Header */}
      <header className="sticky top-0 z-30 apple-nav-glass border-b border-[#14527A]/70 px-3 sm:px-4 py-2.5 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* If in active workout screen, show iOS back button */}
            {isWorkoutActiveScreen && activeTab === 'workout' ? (
              <button
                type="button"
                onClick={() => setIsWorkoutActiveScreen(false)}
                className="apple-press flex items-center gap-1 py-1.5 px-2.5 rounded-full bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#FFAA00] text-xs font-bold transition-colors cursor-pointer"
                title="Voltar às Semanas"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                <span>Semanas</span>
              </button>
            ) : (
              /* Hamburger Menu Button */
              <button
                id="hamburger-menu-btn"
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="apple-press w-9 h-9 rounded-xl flex items-center justify-center bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#FFAA00] hover:text-[#FFB82E] transition-colors shadow-xs cursor-pointer flex-shrink-0"
                title="Abrir menu lateral"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
            )}

            <div
              id="app-header-logo-badge"
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-xs bg-[#CE3426] dark:bg-gradient-to-br dark:from-[#FFAA00] dark:to-[#FFB82E] text-white dark:text-[#031F38] shadow-[#FFAA00]/20 flex-shrink-0"
            >
              <Dumbbell className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Athlete Profile Switcher Button in Header */}
            <button
              id="header-athlete-profile-btn"
              type="button"
              onClick={() => setIsAthleteModalOpen(true)}
              className="apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] hover:border-[#FFAA00]/50 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title={`Atleta ativo: ${activeAthlete.name}. Toque para alternar.`}
            >
              <span
                className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black text-[#031F38] shadow-xs flex-shrink-0"
                style={{ backgroundColor: activeAthlete.color || '#FFAA00' }}
              >
                {activeAthlete.avatarInitial || activeAthlete.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-[11px] font-bold text-[#E8F4F8] max-w-[65px] sm:max-w-[100px] truncate">
                {activeAthlete.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#8FAFBD] flex-shrink-0" />
            </button>

            {/* Quick Theme Toggle Button */}
            <button
              id="header-theme-toggle-btn"
              type="button"
              onClick={() => toggleTheme()}
              className="apple-press flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#082F52]/80 hover:bg-[#0B3A61] text-[#FFAA00] border border-[#14527A] text-xs font-bold transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mudar para Modo Claro (Leandro Twin)' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Escuro</span>
                </>
              )}
            </button>

            {/* Quick Dictionary Button */}
            <button
              id="header-technique-dict-btn"
              onClick={() => {
                setSelectedTechniqueId(null);
                setIsTechniqueModalOpen(true);
              }}
              className="apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#082F52]/80 hover:bg-[#0B3A61] text-[#FFAA00] border border-[#14527A] text-xs font-bold transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Técnicas</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-3 sm:p-4 pb-8">
        <div className={activeTab === 'workout' ? 'block' : 'hidden'}>
          {!isWorkoutActiveScreen ? (
            <WorkoutWeeksHubView
              key={`hub-${activeProfileId}`}
              onStartWorkout={handleStartWorkout}
              onOpenSpreadsheetTab={() => setActiveTab('sheets')}
            />
          ) : (
            <WorkoutActiveView
              key={`workout-${activeProfileId}-${selectedRoutineId}`}
              routines={routines}
              selectedRoutineId={selectedRoutineId}
              weekName={activeWeekName}
              onSelectRoutine={handleSelectRoutine}
              onOpenTechniqueModal={openTechniqueModal}
              onViewHistoryForExercise={handleViewHistoryForExercise}
              onBackToWeeks={() => setIsWorkoutActiveScreen(false)}
            />
          )}
        </div>

        <div className={activeTab === 'videos' ? 'block' : 'hidden'}>
          <ExerciseVideosView
            onOpenTechniqueModal={() => {
              setSelectedTechniqueId(null);
              setIsTechniqueModalOpen(true);
            }}
          />
        </div>

        <div className={activeTab === 'history' ? 'block' : 'hidden'}>
          <ProgressionHistoryView
            key={`history-${activeProfileId}`}
            initialExerciseName={targetExerciseForHistory}
            onOpenTechniqueModal={openTechniqueModal}
          />
        </div>

        <div className={activeTab === 'sheets' ? 'block' : 'hidden'}>
          <SpreadsheetImportView
            key={`sheets-${activeProfileId}`}
            onRoutinesUpdated={(newRoutines) => {
              setRoutines(newRoutines);
              if (newRoutines.length > 0) {
                handleSelectRoutine(newRoutines[0].id);
              }
            }}
            onWeekCreated={(weekId) => {
              saveActiveWeekId(weekId);
              setActiveWeekId(weekId);
              setRoutines(loadRoutines());
              setActiveTab('workout');
              setIsWorkoutActiveScreen(false);
            }}
          />
        </div>

        <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
          <UserProfileView
            key={`profile-${activeProfileId}`}
            onOpenFirestoreDoc={() => setActiveTab('firestore_doc')}
            onOpenSpreadsheetTab={() => setActiveTab('sheets')}
            onOpenAthleteModal={() => setIsAthleteModalOpen(true)}
            onSelectRoutine={(id) => {
              handleSelectRoutine(id);
              setIsWorkoutActiveScreen(true);
              setActiveTab('workout');
            }}
            currentTheme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>

        <div className={activeTab === 'firestore_doc' ? 'block' : 'hidden'}>
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              ← Voltar ao Perfil
            </button>
          </div>
          <FirestoreArchitectureView />
        </div>
      </main>

      {/* Global Techniques Modal */}
      <TechniquesDictionaryModal
        selectedTechniqueId={selectedTechniqueId}
        isOpen={isTechniqueModalOpen}
        onClose={() => setIsTechniqueModalOpen(false)}
      />

      {/* Athlete Profile Switcher Modal */}
      <AthleteProfileModal
        isOpen={isAthleteModalOpen}
        onClose={() => setIsAthleteModalOpen(false)}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSwitchAthleteProfile}
      />

      {/* Lateral Drawer Backdrop Overlay */}
      {isDrawerOpen && (
        <div
          id="drawer-backdrop"
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Lateral Menu / Drawer Hambúrguer */}
      <aside
        id="side-hamburger-drawer"
        className={`fixed top-0 bottom-0 left-0 w-[300px] sm:w-[320px] max-w-[85vw] bg-[#031F38] border-r border-[#14527A] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Principal"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#14527A] flex items-center justify-between bg-[#082F52]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black bg-[#CE3426] dark:bg-gradient-to-br dark:from-[#FFAA00] dark:to-[#FFB82E] text-white dark:text-[#031F38] shadow-md flex-shrink-0">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-black text-[#E8F4F8] leading-tight">
                Menu de Treino
              </div>
              <div className="text-[11px] text-[#FFAA00] font-semibold">
                {activeWeekName}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#8FAFBD] hover:text-[#E8F4F8] transition-colors cursor-pointer"
            title="Fechar menu lateral"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Drawer Athlete Card */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-gradient-to-r from-[#0B3A61] to-[#082F52] border border-[#FFAA00]/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-[#031F38] shadow-xs flex-shrink-0"
              style={{ backgroundColor: activeAthlete.color || '#FFAA00' }}
            >
              {activeAthlete.avatarInitial || activeAthlete.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#FFAA00] font-bold uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" />
                Atleta Ativo
              </div>
              <div className="text-xs font-extrabold text-[#E8F4F8] truncate">
                {activeAthlete.name}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(false);
              setIsAthleteModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#FFAA00] hover:bg-[#FFB82E] text-[#031F38] text-[10px] font-black transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            Trocar
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          <div>
            <span className="px-3 text-[10px] uppercase font-bold text-[#64879A] tracking-wider block mb-1.5">
              Navegação
            </span>
            <div className="space-y-1">
              {/* Item 1: Treino */}
              <button
                id="drawer-tab-workout"
                type="button"
                onClick={() => {
                  setActiveTab('workout');
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'workout'
                    ? 'bg-[#FFAA00]/15 border border-[#FFAA00]/40 text-[#FFAA00] font-bold shadow-sm'
                    : 'bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#E8F4F8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'workout'
                        ? 'bg-[#FFAA00] text-[#031F38]'
                        : 'bg-[#0B3A61] text-[#FFAA00]'
                    }`}
                  >
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold leading-tight">Treino</div>
                    <div className="text-[11px] text-[#8FAFBD]">
                      {isWorkoutActiveScreen ? 'Ficha em execução' : 'Fichas da semana'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8FAFBD] flex-shrink-0" />
              </button>

              {/* Item 2: Vídeos */}
              <button
                id="drawer-tab-videos"
                type="button"
                onClick={() => {
                  setActiveTab('videos');
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'videos'
                    ? 'bg-red-600/15 border border-red-500/40 text-red-400 font-bold shadow-sm'
                    : 'bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#E8F4F8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'videos'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#0B3A61] text-red-400'
                    }`}
                  >
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold leading-tight">Vídeos de Execução</div>
                    <div className="text-[11px] text-[#8FAFBD]">
                      Leandro Twin no YouTube
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8FAFBD] flex-shrink-0" />
              </button>

              {/* Item 3: Histórico */}
              <button
                id="drawer-tab-history"
                type="button"
                onClick={() => {
                  setActiveTab('history');
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#FFAA00]/15 border border-[#FFAA00]/40 text-[#FFAA00] font-bold shadow-sm'
                    : 'bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#E8F4F8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'history'
                        ? 'bg-[#FFAA00] text-[#031F38]'
                        : 'bg-[#0B3A61] text-[#FFAA00]'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold leading-tight">Histórico & Cargas</div>
                    <div className="text-[11px] text-[#8FAFBD]">
                      Evolução de exercícios
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8FAFBD] flex-shrink-0" />
              </button>

              {/* Item 4: Fichas */}
              <button
                id="drawer-tab-sheets"
                type="button"
                onClick={() => {
                  setActiveTab('sheets');
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'sheets'
                    ? 'bg-[#FFAA00]/15 border border-[#FFAA00]/40 text-[#FFAA00] font-bold shadow-sm'
                    : 'bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#E8F4F8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'sheets'
                        ? 'bg-[#FFAA00] text-[#031F38]'
                        : 'bg-[#0B3A61] text-[#FFAA00]'
                    }`}
                  >
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold leading-tight">Fichas & Semanas</div>
                    <div className="text-[11px] text-[#8FAFBD]">
                      Gerenciar planilha
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8FAFBD] flex-shrink-0" />
              </button>

              {/* Item 5: Perfil */}
              <button
                id="drawer-tab-profile"
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#FFAA00]/15 border border-[#FFAA00]/40 text-[#FFAA00] font-bold shadow-sm'
                    : 'bg-[#082F52] hover:bg-[#0B3A61] border border-[#14527A] text-[#E8F4F8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'profile'
                        ? 'bg-[#FFAA00] text-[#031F38]'
                        : 'bg-[#0B3A61] text-[#FFAA00]'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold leading-tight">Meu Perfil</div>
                    <div className="text-[11px] text-[#8FAFBD]">
                      Metas, dados e peso
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8FAFBD] flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Quick Tools & Settings Section */}
          <div className="pt-2 border-t border-[#14527A]">
            <span className="px-3 text-[10px] uppercase font-bold text-[#64879A] tracking-wider block mb-1.5">
              Ferramentas & Recursos
            </span>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedTechniqueId(null);
                  setIsTechniqueModalOpen(true);
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#082F52]/60 hover:bg-[#0B3A61] border border-[#14527A] text-left transition-colors cursor-pointer text-xs font-semibold text-[#E8F4F8]"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#FFAA00]" />
                  <span>Dicionário de Técnicas</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#64879A]" />
              </button>

              <button
                type="button"
                onClick={() => toggleTheme()}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#082F52]/60 hover:bg-[#0B3A61] border border-[#14527A] text-left transition-colors cursor-pointer text-xs font-semibold text-[#E8F4F8]"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-[#FFAA00]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#FFAA00]" />
                  )}
                  <span>{theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}</span>
                </div>
                <span className="text-[10px] text-[#8FAFBD] px-1.5 py-0.5 rounded bg-[#031F38] border border-[#14527A]">
                  {theme === 'dark' ? 'Escuro' : 'Claro'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('firestore_doc');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#082F52]/60 hover:bg-[#0B3A61] border border-[#14527A] text-left transition-colors cursor-pointer text-xs font-semibold text-[#E8F4F8]"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#38C6D9]" />
                  <span>Estrutura Firestore</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#64879A]" />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#14527A] bg-[#082F52]/40 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#00C98B] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Treinos salvos localmente</span>
          </div>
        </div>
      </aside>

      {/* Apple Dynamic Island / Live Activity Pill (shown when workout is active in background) */}
      {isWorkoutActiveScreen && activeTab !== 'workout' && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveTab('workout')}
              className="apple-press w-full py-2.5 px-4 rounded-full apple-glass border border-[#FFAA00]/50 shadow-xl shadow-black/40 flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C98B] animate-ping" />
                <div>
                  <div className="text-xs font-black text-[#E8F4F8] leading-tight flex items-center gap-1">
                    <span>Treino em andamento</span>
                    <span className="text-[#FFAA00]">({activeWeekName})</span>
                  </div>
                  <div className="text-[10px] text-[#8FAFBD]">Toque para retornar ao treino</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#FFAA00] text-xs font-bold">
                <span>Retornar</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
