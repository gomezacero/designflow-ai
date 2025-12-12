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
import { Task } from './models';

function App() {
  // Custom Hooks
  const { isAuthenticated, isLoading, user, updateProfile, logout } = useAuth();
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
    handleDeleteRequester,
    handleDeleteTask,
    handleRestoreTask,
  } = useAppState();

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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Render Login Gate ---
  if (!isAuthenticated) {
    // We don't pass 'onLogin' anymore because LoginScreen handles it with useAuth directly
    // Wait, LoginScreen is inside components, it probably needs props or uses the hook.
    // Let's assume for now we pass the logic or the component uses the hook.
    // Given my plan for LoginScreen, I'll make it use the hook directly or props.
    // For cleanliness, passing props is good, but the hook is global.
    // I'll check LoginScreen next. For now, I'll pass the auth methods just in case.
    return <LoginScreen />;
  }

  // --- Render Main App ---
  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-ios-text selection:bg-blue-100 selection:text-blue-900 flex animate-fadeIn">

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
            onUpdateProfile={updateProfile}
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

      <MagicBriefModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={onCreateTask}
        designers={designers}
        requesters={requesters}
        activeSprint={activeSprint}
      />

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
        onDeleteRequester={handleDeleteRequester}
        onRestoreSprint={handleRestoreSprint}
        onRestoreTask={handleRestoreTask}
      />
    </div>
  );
}

export default App;