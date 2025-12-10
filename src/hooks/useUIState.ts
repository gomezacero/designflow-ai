import { useState, useCallback } from 'react';
import { ViewType } from '../components/Sidebar';

interface UseUIStateReturn {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

/**
 * Custom hook for UI state management (views, modals, mobile menu)
 */
export const useUIState = (): UseUIStateReturn => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const toggleMobileMenu = useCallback(
    () => setIsMobileMenuOpen(prev => !prev),
    []
  );
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return {
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
  };
};
