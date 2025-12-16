
import React, { useState } from 'react';
import { X, Users, Calendar, Plus, Trash2, UserPlus, Archive, RotateCcw, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Designer, Sprint, Task, Requester } from '../models';
import { Button } from './Button';
import { openDatePicker } from '../utils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;

    designers: Designer[];
    requesters: Requester[];
    sprints: Sprint[];
    deletedSprints: Sprint[];
    deletedTasks: Task[];

    // New handlers
    onCreateSprint: (sprint: Partial<Sprint>) => void;
    onUpdateSprint: (id: string, updates: Partial<Sprint>) => void;
    onDeleteSprint: (id: string) => void;
    onRestoreSprint: (id: string) => void;

    onCreateDesigner: (designer: Partial<Designer>) => void;
    onDeleteDesigner: (id: string) => void;

    onCreateRequester: (requester: Partial<Requester>) => void;
    onUpdateRequester: (id: string, updates: Partial<Requester>) => void;
    onDeleteRequester: (name: string) => void;

    onRestoreTask: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, designers, requesters: _requesters, sprints, deletedSprints, deletedTasks,
    onCreateSprint, onUpdateSprint, onDeleteSprint, onRestoreSprint,
    onCreateDesigner, onDeleteDesigner,
    onCreateRequester, onUpdateRequester: _onUpdateRequester, onDeleteRequester,
    onRestoreTask
}) => {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'team' | 'sprints' | 'deleted' | 'appearance'>('team');

    // Temp states for inputs
    const [newDesignerName, setNewDesignerName] = useState('');
    const [newRequesterName, setNewRequesterName] = useState('');

    const [newSprint, setNewSprint] = useState({
        name: '',
        startDate: '',
        endDate: ''
    });

    // Filter designers by role
    // Users who set their role to "Designer" appear in Designers list
    // Users who set their role to "Requester" appear in Requesters list
    const designersList = designers.filter(d => d.role === 'Designer' || !d.role);
    const requestersList = designers.filter(d => d.role === 'Requester');

    if (!isOpen) return null;

    // --- Handlers for Team ---
    const addDesigner = () => {
        if (!newDesignerName.trim()) return;
        onCreateDesigner({
            name: newDesignerName,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newDesignerName}`
        });
        setNewDesignerName('');
    };

    const removeDesigner = (id: string) => {
        onDeleteDesigner(id);
    };

    const addRequester = () => {
        if (!newRequesterName.trim()) return;
        if (!requestersList.some(r => r.name === newRequesterName)) {
            onCreateRequester({ name: newRequesterName });
        }
        setNewRequesterName('');
    };

    const removeRequester = (name: string) => {
        onDeleteRequester(name);
    };

    // --- Handlers for Sprints ---
    const addSprint = () => {
        if (!newSprint.name || !newSprint.startDate || !newSprint.endDate) return;
        onCreateSprint({
            name: newSprint.name,
            startDate: newSprint.startDate,
            endDate: newSprint.endDate,
            isActive: false
        });
        setNewSprint({ name: '', startDate: '', endDate: '' });
    };

    const removeSprint = (id: string) => {
        onDeleteSprint(id);
    };

    const toggleSprintActive = (id: string) => {
        onUpdateSprint(id, { isActive: true });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-bg-canvas rounded-[24px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-[floatUp_0.2s_ease-out]">

                {/* Header */}
                <div className="bg-bg-surface/80 backdrop-blur px-6 py-4 border-b border-border-default flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-surface-hover text-text-secondary" aria-label="Close settings">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 gap-4 bg-bg-surface/50 border-b border-border-default overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    >
                        <Users size={18} /> Team & Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('sprints')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'sprints' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    >
                        <Calendar size={18} /> Sprint Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('deleted')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'deleted' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    >
                        <Archive size={18} /> Deleted Items
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Appearance
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">

                    {activeTab === 'team' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                            {/* Designers Panel */}
                            <div className="bg-bg-surface p-5 rounded-2xl shadow-sm border border-border-default">
                                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <UserPlus size={18} className="text-purple-500" /> Designers
                                </h3>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newDesignerName}
                                        onChange={(e) => setNewDesignerName(e.target.value)}
                                        placeholder="New Designer Name"
                                        className="flex-1 bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-purple-500/20"
                                        onKeyDown={(e) => e.key === 'Enter' && addDesigner()}
                                    />
                                    <button onClick={addDesigner} className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600" aria-label="Add designer">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {designersList.map(designer => (
                                        <div key={designer.id} className="flex items-center justify-between p-3 hover:bg-bg-surface-hover rounded-xl group border border-transparent hover:border-border-default transition-all">
                                            <div className="flex items-center gap-3">
                                                {designer.avatar ? (
                                                    <img src={designer.avatar} alt={designer.name} className="w-10 h-10 rounded-full bg-bg-canvas object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-bg-canvas flex items-center justify-center text-text-secondary font-bold text-xs">
                                                        {designer.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-sm font-semibold text-text-primary">{designer.name}</span>
                                            </div>
                                            <button onClick={() => removeDesigner(designer.id)} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2" aria-label={`Remove ${designer.name}`}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Requesters Panel */}
                            <div className="bg-bg-surface p-5 rounded-2xl shadow-sm border border-border-default">
                                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <UserPlus size={18} className="text-blue-500" /> Requesters
                                </h3>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newRequesterName}
                                        onChange={(e) => setNewRequesterName(e.target.value)}
                                        placeholder="New Requester Name"
                                        className="flex-1 bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-blue-500/20"
                                        onKeyDown={(e) => e.key === 'Enter' && addRequester()}
                                    />
                                    <button onClick={addRequester} className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600" aria-label="Add requester">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {requestersList.map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-3 hover:bg-bg-surface-hover rounded-xl group border border-transparent hover:border-border-default transition-all">
                                            <div className="flex items-center gap-3">
                                                {req.avatar ? (
                                                    <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full bg-bg-canvas object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                                        {req.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-sm font-semibold text-text-primary">{req.name}</span>
                                            </div>
                                            <button onClick={() => removeRequester(req.name)} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2" aria-label={`Remove ${req.name}`}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sprints' && (
                        <div className="bg-bg-surface p-4 md:p-6 rounded-2xl shadow-sm border border-border-default">
                            <h3 className="text-sm font-bold text-text-primary mb-4">Weekly Sprint Management</h3>

                            {/* Add Sprint Form */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-bg-canvas p-4 rounded-xl border border-border-default">
                                <input
                                    value={newSprint.name}
                                    onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                                    placeholder="Sprint Name"
                                    className="bg-bg-surface border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary outline-none w-full"
                                />
                                <div className="relative w-full">
                                    <Calendar size={18} className="absolute left-3 top-3 text-text-secondary pointer-events-none" />
                                    <input
                                        type="date"
                                        onClick={openDatePicker}
                                        value={newSprint.startDate}
                                        onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                                        className="bg-bg-surface border border-border-default rounded-xl pl-10 pr-3 py-3 text-sm text-text-primary outline-none w-full cursor-pointer"
                                    />
                                </div>
                                <div className="relative w-full">
                                    <Calendar size={18} className="absolute left-3 top-3 text-text-secondary pointer-events-none" />
                                    <input
                                        type="date"
                                        onClick={openDatePicker}
                                        value={newSprint.endDate}
                                        onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                                        className="bg-bg-surface border border-border-default rounded-xl pl-10 pr-3 py-3 text-sm text-text-primary outline-none w-full cursor-pointer"
                                    />
                                </div>
                                <Button variant="primary" onClick={addSprint} className="py-3">
                                    Add Sprint
                                </Button>
                            </div>

                            {/* Sprint List */}
                            <div className="space-y-3">
                                <div className="hidden md:grid grid-cols-12 text-xs font-bold text-text-secondary uppercase tracking-wider px-4 pb-2">
                                    <div className="col-span-4">Sprint Name</div>
                                    <div className="col-span-3">Start Date</div>
                                    <div className="col-span-3">End Date</div>
                                    <div className="col-span-2 text-right">Status</div>
                                </div>

                                {sprints.map(sprint => (
                                    <div key={sprint.id} className={`flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3 md:gap-0 p-4 rounded-xl border transition-all ${sprint.isActive ? 'bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-900/10 dark:border-blue-800' : 'bg-bg-surface border-border-default hover:bg-bg-surface-hover'}`}>
                                        <div className="col-span-4 font-bold text-sm text-text-primary w-full flex justify-between md:block">
                                            {sprint.name}
                                            <span className="md:hidden">
                                                {sprint.isActive && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Active</span>}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-sm text-text-secondary flex items-center gap-2 md:gap-0">
                                            <Calendar size={14} className="md:hidden text-gray-400" /> {sprint.startDate}
                                        </div>
                                        <div className="col-span-3 text-sm text-text-secondary flex items-center gap-2 md:gap-0">
                                            <Calendar size={14} className="md:hidden text-gray-400" /> {sprint.endDate}
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                                            <button
                                                onClick={() => toggleSprintActive(sprint.id)}
                                                className={`flex-1 md:flex-none px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sprint.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-bg-canvas text-text-secondary hover:bg-bg-surface-hover'}`}
                                            >
                                                {sprint.isActive ? 'Active Sprint' : 'Set Active'}
                                            </button>
                                            <button onClick={() => removeSprint(sprint.id)} className="text-gray-300 hover:text-red-500 p-2" aria-label={`Remove ${sprint.name}`}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'deleted' && (
                        <div className="space-y-6">
                            {/* Deleted Sprints */}
                            <div className="bg-bg-surface p-5 rounded-2xl shadow-sm border border-border-default">
                                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <Archive size={18} className="text-text-secondary" /> Deleted Sprints
                                </h3>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {deletedSprints.length > 0 ? (
                                        deletedSprints.map(sprint => (
                                            <div key={sprint.id} className="flex items-center justify-between p-3 bg-bg-canvas rounded-xl border border-border-default">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-text-primary">{sprint.name}</span>
                                                    <span className="text-xs text-text-secondary">{sprint.startDate} - {sprint.endDate}</span>
                                                </div>
                                                <button
                                                    onClick={() => onRestoreSprint(sprint.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-border-default shadow-sm rounded-lg text-xs font-semibold text-text-primary hover:bg-bg-surface-hover transition-colors"
                                                >
                                                    <RotateCcw size={14} /> Restore
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-text-secondary italic">No deleted sprints.</p>
                                    )}
                                </div>
                            </div>

                            {/* Deleted Tasks */}
                            <div className="bg-bg-surface p-5 rounded-2xl shadow-sm border border-border-default">
                                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <Trash2 size={18} className="text-red-500" /> Deleted Tasks
                                </h3>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {deletedTasks.length > 0 ? (
                                        deletedTasks.map(task => (
                                            <div key={task.id} className="flex items-center justify-between p-3 bg-bg-canvas rounded-xl border border-border-default">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-text-primary line-clamp-1">{task.title}</span>
                                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                        <span>{task.sprint || 'No Sprint'}</span>
                                                        <span>•</span>
                                                        <span>{task.designer?.name || 'Unassigned'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onRestoreTask(task.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-border-default shadow-sm rounded-lg text-xs font-semibold text-text-primary hover:bg-bg-surface-hover transition-colors"
                                                >
                                                    <RotateCcw size={14} /> Restore
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-text-secondary italic">No deleted tasks.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default">
                            <h3 className="text-sm font-bold text-text-primary mb-6">Appearance</h3>

                            <div className="flex items-center justify-between p-4 bg-bg-canvas rounded-xl border border-border-default">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-amber-400 text-white'}`}>
                                        {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary">Dark Mode</h4>
                                        <p className="text-sm text-text-secondary">
                                            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div >
    );
};
