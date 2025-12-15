
import React, { useState } from 'react';
import { X, Users, Calendar, Plus, Trash2, UserPlus, Archive, RotateCcw, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Designer, Sprint, Task } from '../models';
import { Button } from './Button';
import { openDatePicker } from '../utils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;

    designers: Designer[];
    requesters: string[];
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

    onCreateRequester: (name: string) => void;
    onDeleteRequester: (name: string) => void;

    onRestoreTask: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, designers, requesters, sprints, deletedSprints, deletedTasks,
    onCreateSprint, onUpdateSprint, onDeleteSprint, onRestoreSprint,
    onCreateDesigner, onDeleteDesigner,
    onCreateRequester, onDeleteRequester,
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
        if (!requesters.includes(newRequesterName)) {
            onCreateRequester(newRequesterName);
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

            <div className="relative bg-[#F5F5F7] rounded-[24px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-[floatUp_0.2s_ease-out]">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500" aria-label="Close settings">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 gap-4 bg-white/50 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <Users size={18} /> Team & Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('sprints')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'sprints' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <Calendar size={18} /> Sprint Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('deleted')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'deleted' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <Archive size={18} /> Deleted Items
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Appearance
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">

                    {activeTab === 'team' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                            {/* Designers Panel */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <UserPlus size={18} className="text-purple-500" /> Designers
                                </h3>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newDesignerName}
                                        onChange={(e) => setNewDesignerName(e.target.value)}
                                        placeholder="New Designer Name"
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                        onKeyDown={(e) => e.key === 'Enter' && addDesigner()}
                                    />
                                    <button onClick={addDesigner} className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600" aria-label="Add designer">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {designers.map(designer => (
                                        <div key={designer.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl group border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                {designer.avatar ? (
                                                    <img src={designer.avatar} alt={designer.name} className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                                                        {designer.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-sm font-semibold text-gray-700">{designer.name}</span>
                                            </div>
                                            <button onClick={() => removeDesigner(designer.id)} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2" aria-label={`Remove ${designer.name}`}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Requesters Panel */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <UserPlus size={18} className="text-blue-500" /> Requesters
                                </h3>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={newRequesterName}
                                        onChange={(e) => setNewRequesterName(e.target.value)}
                                        placeholder="New Requester Name"
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                        onKeyDown={(e) => e.key === 'Enter' && addRequester()}
                                    />
                                    <button onClick={addRequester} className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600" aria-label="Add requester">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {requesters.map(req => (
                                        <div key={req} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl group border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {req.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{req}</span>
                                            </div>
                                            <button onClick={() => removeRequester(req)} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2" aria-label={`Remove ${req}`}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sprints' && (
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Weekly Sprint Management</h3>

                            {/* Add Sprint Form */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <input
                                    value={newSprint.name}
                                    onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                                    placeholder="Sprint Name"
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none w-full"
                                />
                                <div className="relative w-full">
                                    <Calendar size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        onClick={openDatePicker}
                                        value={newSprint.startDate}
                                        onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                                        className="bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm outline-none w-full cursor-pointer"
                                    />
                                </div>
                                <div className="relative w-full">
                                    <Calendar size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        onClick={openDatePicker}
                                        value={newSprint.endDate}
                                        onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                                        className="bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm outline-none w-full cursor-pointer"
                                    />
                                </div>
                                <Button variant="primary" onClick={addSprint} className="py-3">
                                    Add Sprint
                                </Button>
                            </div>

                            {/* Sprint List */}
                            <div className="space-y-3">
                                <div className="hidden md:grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pb-2">
                                    <div className="col-span-4">Sprint Name</div>
                                    <div className="col-span-3">Start Date</div>
                                    <div className="col-span-3">End Date</div>
                                    <div className="col-span-2 text-right">Status</div>
                                </div>

                                {sprints.map(sprint => (
                                    <div key={sprint.id} className={`flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3 md:gap-0 p-4 rounded-xl border transition-all ${sprint.isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                                        <div className="col-span-4 font-bold text-sm text-gray-900 w-full flex justify-between md:block">
                                            {sprint.name}
                                            <span className="md:hidden">
                                                {sprint.isActive && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Active</span>}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-sm text-gray-600 flex items-center gap-2 md:gap-0">
                                            <Calendar size={14} className="md:hidden text-gray-400" /> {sprint.startDate}
                                        </div>
                                        <div className="col-span-3 text-sm text-gray-600 flex items-center gap-2 md:gap-0">
                                            <Calendar size={14} className="md:hidden text-gray-400" /> {sprint.endDate}
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                                            <button
                                                onClick={() => toggleSprintActive(sprint.id)}
                                                className={`flex-1 md:flex-none px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sprint.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
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
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Archive size={18} className="text-gray-500" /> Deleted Sprints
                                </h3>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {deletedSprints.length > 0 ? (
                                        deletedSprints.map(sprint => (
                                            <div key={sprint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-gray-900">{sprint.name}</span>
                                                    <span className="text-xs text-gray-500">{sprint.startDate} - {sprint.endDate}</span>
                                                </div>
                                                <button
                                                    onClick={() => onRestoreSprint(sprint.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <RotateCcw size={14} /> Restore
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No deleted sprints.</p>
                                    )}
                                </div>
                            </div>

                            {/* Deleted Tasks */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Trash2 size={18} className="text-red-500" /> Deleted Tasks
                                </h3>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {deletedTasks.length > 0 ? (
                                        deletedTasks.map(task => (
                                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-gray-900 line-clamp-1">{task.title}</span>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{task.sprint || 'No Sprint'}</span>
                                                        <span>•</span>
                                                        <span>{task.designer?.name || 'Unassigned'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onRestoreTask(task.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <RotateCcw size={14} /> Restore
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No deleted tasks.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Appearance</h3>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-amber-400 text-white'}`}>
                                        {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Dark Mode</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
        </div>
    );
};
