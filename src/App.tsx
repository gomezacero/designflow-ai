
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataView } from './components/DataView';
import { MagicBriefModal } from './components/MagicBriefModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { Menu } from 'lucide-react';
import { useAuth, useUIState, useAppState } from './hooks';
import { Task } from './models';

function App() {
  // Custom Hooks
  const { isAuthenticated, login } = useAuth();
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
    designers,
    requesters,
    sprints,
    activeSprint,
    setDesigners,
    setRequesters,
    setSprints,
    handleCreateTask,
    handleUpdateTask,
  } = useAppState();

  // Wrap handleCreateTask to also close the modal
  const onCreateTask = (taskData: Partial<Task>) => {
    handleCreateTask(taskData);
    closeModal();
  };

  // --- Render Login Gate ---
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
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
        onUpdateDesigners={setDesigners}
        onUpdateRequesters={setRequesters}
        onUpdateSprints={setSprints}
      />
    </div>
  );
}

export default App;
