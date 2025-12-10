
import React from 'react';
import { LayoutDashboard, Layers, Search, BarChart3, PlusCircle, Settings, User } from 'lucide-react';
import { Button } from './Button';

export type ViewType = 'dashboard' | 'data' | 'sprints' | 'search';

interface SidebarProps {
  onMagicBriefClick: () => void;
  onSettingsClick: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMagicBriefClick, onSettingsClick, currentView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'sprints', icon: Layers, label: 'Sprints' }, // Placeholder for now
    { id: 'search', icon: Search, label: 'Search Arb' }, // Placeholder for now
    { id: 'data', icon: BarChart3, label: 'Team Load' },
  ];

  return (
    <aside className="w-64 h-full bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col justify-between p-6 shadow-xl md:shadow-none">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Profile / Brand */}
        <div className="flex items-center gap-3 px-2 pt-2 md:pt-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xs">
            DF
          </div>
          <span className="font-semibold text-ios-text tracking-tight">DesignFlow AI</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
             const isActive = currentView === item.id;
             // Handle clicks: Sprints/Search fallback to dashboard or do nothing if not implemented,
             // but user specifically asked for Data section so 'data' works.
             const handleClick = () => {
                 if (item.id === 'sprints' || item.id === 'search') {
                     // For now, keep them on dashboard or just don't switch
                     // OR switch to dashboard to avoid empty screens
                     onNavigate('dashboard');
                 } else {
                     onNavigate(item.id as ViewType);
                 }
             }

             return (
                <button
                key={item.label}
                onClick={handleClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                    ? 'bg-black/5 text-ios-text'
                    : 'text-ios-secondary hover:text-ios-text hover:bg-black/5'
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

        <div className="pt-4 border-t border-black/5 px-2">
            <button
                onClick={onSettingsClick}
                className="flex items-center gap-3 text-sm font-medium text-ios-secondary hover:text-ios-text transition-colors w-full px-2 py-2"
            >
                <Settings size={18} />
                <span>Settings</span>
            </button>
            <button className="flex items-center gap-3 text-sm font-medium text-ios-secondary hover:text-ios-text transition-colors w-full px-2 py-2 mt-1">
                <User size={18} />
                <span>My Profile</span>
            </button>
        </div>
      </div>
    </aside>
  );
};
