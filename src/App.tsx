import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataView } from './components/DataView';
import { SprintsView } from './components/SprintsView';
import { ProfileView } from './components/ProfileView';
import { MagicBriefModal } from './components/MagicBriefModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { Menu } from 'lucide-react';
import { useAuth, useUIState, useAppState } from './hooks';
import { useTheme } from './contexts/ThemeContext';
import { Task } from './models';

function App() {
  // Custom Hooks
  const { isAuthenticated, isLoading, user, updateProfile, logout, isPasswordRecovery } = useAuth();
  const {
    currentView,
    setCurrentView,
    isModalOpen,
    openModal,
    closeModal,
    isSettingsOpen,
    openSettings,
    closeSettings,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  } = useUIState();
  const {
    tasks,
    deletedTasks,
    designers,
    requesters,
    sprints,
    deletedSprints,
    activeSprint,
    isLoading: isDataLoading,

    handleCreateTask,
    handleUpdateTask,
    // Sprint Handlers
    handleCreateSprint,
    handleUpdateSprint,
    handleDeleteSprint,
    handleRestoreSprint,
    // Designer Handlers
    handleCreateDesigner,
    handleDeleteDesigner,
    // Requester Handlers
    handleCreateRequester,
    handleUpdateRequester,
    handleDeleteRequester,
    handleDeleteTask,
    handleRestoreTask,
    refreshData,
  } = useAppState();

  const { theme, setTheme } = useTheme();

  // Sync theme from user profile
  useEffect(() => {
    if (user?.theme && (user.theme === 'light' || user.theme === 'dark')) {
      if (theme !== user.theme) {
        setTheme(user.theme);
      }
    }
  }, [user?.theme, theme]);

  // State for showing loading when refreshing data (e.g., after role change)

  // State for showing loading when refreshing data (e.g., after role change)
  // IMPORTANT: Must be before any early returns to comply with Rules of Hooks
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Wrappers to inject user ID
  const onDeleteSprint = (id: string) => {
    if (user?.id) handleDeleteSprint(id, user.id);
  };

  const onDeleteTask = (id: string) => {
    if (user?.id) handleDeleteTask(id, user.id);
  };

  // Wrap handleCreateTask to also close the modal
  const onCreateTask = (taskData: Partial<Task>) => {
    handleCreateTask(taskData);
    closeModal();
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // --- Render Login Gate ---
  // Show LoginScreen if not authenticated OR if in password recovery mode
  if (!isAuthenticated || isPasswordRecovery) {
    // Pass the recovery state from App's useAuth instance to LoginScreen
    // preventing the internal hook state from overriding the event detection
    return <LoginScreen isRecoveryMode={isPasswordRecovery} />;
  }

  // --- Render Main App ---
  return (
    <div className="min-h-screen bg-bg-canvas font-sans text-text-primary selection:bg-blue-100 selection:text-blue-900 flex animate-fadeIn transition-colors duration-300">

      {/* Full-screen Loading Overlay - Blocks ALL interactions during initial load */}
      {isDataLoading && (
        <div className="fixed inset-0 z-[100] bg-bg-canvas flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-text-secondary text-sm font-medium">Loading your workspace...</p>
          </div>
        </div>
      )}

      {/* Refresh Overlay - Shows when updating profile/refreshing data */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[90] bg-bg-canvas/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-bg-surface p-8 rounded-2xl shadow-lg border border-border-default">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-text-primary text-sm font-medium">Updating...</p>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm md:hidden text-gray-600"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar with Responsive Logic */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block`}>
        <Sidebar
          onMagicBriefClick={() => { openModal(); closeMobileMenu(); }}
          onSettingsClick={() => { openSettings(); closeMobileMenu(); }}
          currentView={currentView}
          onNavigate={(view) => { setCurrentView(view); closeMobileMenu(); }}
          onLogout={logout}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content - Full Width Adaptable */}
      <main className="flex-1 min-w-0 transition-all duration-300 w-full h-screen overflow-hidden">
        {currentView === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            designers={designers}
            requesters={requesters}
            sprints={sprints}
            onDeleteTask={onDeleteTask}
          />
        )}
        {currentView === 'sprints' && (
          <SprintsView
            sprints={sprints}
            tasks={tasks}
            onDeleteSprint={onDeleteSprint}
            onDeleteTask={onDeleteTask}
          />
        )}
        {currentView === 'profile' && user && (
          <ProfileView
            user={user}
            onUpdateProfile={async (updates) => {
              if (updates.role) {
                setIsRefreshing(true);
              }
              await updateProfile(updates);
              // Refresh designers list to reflect role changes immediately
              if (updates.role) {
                await refreshData();
                setIsRefreshing(false);
              }
            }}
          />
        )}
        {currentView === 'data' && (
          <DataView
            tasks={tasks}
            designers={designers}
            requesters={requesters}
          />
        )}
      </main>

      {isModalOpen && (
        <MagicBriefModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={onCreateTask}
          designers={designers}
          requesters={requesters}
          activeSprint={activeSprint}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        designers={designers}
        requesters={requesters}
        sprints={sprints}
        deletedSprints={deletedSprints}
        deletedTasks={deletedTasks}
        onCreateSprint={handleCreateSprint}
        onUpdateSprint={handleUpdateSprint}
        onDeleteSprint={onDeleteSprint}
        onCreateDesigner={handleCreateDesigner}
        onDeleteDesigner={handleDeleteDesigner}
        onCreateRequester={handleCreateRequester}
        onUpdateRequester={handleUpdateRequester}
        onDeleteRequester={handleDeleteRequester}
        onRestoreSprint={handleRestoreSprint}
        onRestoreTask={handleRestoreTask}
      />
    </div>
  );
}

export default App;