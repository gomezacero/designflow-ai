
import React from 'react';
import { LayoutDashboard, Layers, Search, BarChart3, PlusCircle, Settings, User, LogOut } from 'lucide-react';
import { Button } from './Button';

export type ViewType = 'dashboard' | 'data' | 'sprints' | 'search' | 'profile';

interface SidebarProps {
  onMagicBriefClick: () => void;
  onSettingsClick: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMagicBriefClick, onSettingsClick, currentView, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'sprints', icon: Layers, label: 'Sprints' }, // Placeholder for now
    { id: 'search', icon: Search, label: 'Search Arb' }, // Placeholder for now
    { id: 'data', icon: BarChart3, label: 'Team Load' },
  ];

  return (
    <aside className="w-64 h-full bg-bg-surface border-r border-border-default flex flex-col justify-between p-6 shadow-xl md:shadow-none transition-colors duration-300">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Profile / Brand */}
        <div className="flex items-center gap-3 px-2 pt-2 md:pt-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xs">
            DF
          </div>
          <span className="font-semibold text-text-primary tracking-tight">DesignFlow AI</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            // Handle clicks
            const handleClick = () => {
              if (item.id === 'search') {
                onNavigate('dashboard');
              } else {
                onNavigate(item.id as ViewType);
              }
            }

            return (
              <button
                key={item.label}
                onClick={handleClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-bg-surface-hover text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
                  }`}
              >
                <item.icon size={18} className={isActive ? 'text-[#007AFF]' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-6">
        <div className="px-2">
          <Button variant="primary" className="w-full shadow-blue-500/20" onClick={onMagicBriefClick}>
            <PlusCircle size={18} />
            New Task
          </Button>
        </div>

        <div className="pt-4 border-t border-border-default px-2">
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors w-full px-2 py-2"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-3 text-sm font-medium transition-colors w-full px-2 py-2 mt-1 ${currentView === 'profile' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <User size={18} />
            <span>My Profile</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 text-sm font-medium text-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full px-2 py-2 mt-1 rounded-lg group"
          >
            <LogOut size={18} className="group-hover:text-red-600 transition-colors" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
