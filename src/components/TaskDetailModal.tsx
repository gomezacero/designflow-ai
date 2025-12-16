
import React from 'react';
import { X, Calendar, User, Link as LinkIcon, Clock, Send, ChevronDown } from 'lucide-react';
import { Task, Priority, Status, Designer, Requester } from '../models';

interface TaskDetailModalProps {
    task: Task | null;
    onClose: () => void;
    onUpdate: (updates: Partial<Task>) => void;
    onDelete?: (taskId: string) => void;
    designers: Designer[];
    requesters: Requester[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onUpdate, onDelete, designers, requesters }) => {
    if (!task) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-bg-surface rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-[floatUp_0.2s_ease-out] transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between px-8 py-6 border-b border-border-default">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{task.sprint}</span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${task.priority === Priority.HIGH || task.priority === Priority.CRITICAL ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {task.priority}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary leading-tight">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary" aria-label="Close task details">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-bg-canvas">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                        {/* Main Content (Left) */}
                        <div className="md:col-span-8 space-y-8">
                            <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default space-y-3">
                                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Brief / Description</h3>
                                <textarea
                                    value={task.description || ''}
                                    onChange={(e) => onUpdate({ description: e.target.value })}
                                    placeholder="Add a description for this task..."
                                    className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm text-text-secondary leading-relaxed focus:bg-bg-surface focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none min-h-[150px]"
                                />
                            </div>

                            {/* Delivery Section - NEW */}
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-2">
                                    <Send size={16} /> Delivery Center
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-blue-700 mb-1">Final Delivery Link (Figma/Drive)</label>
                                        <div className="relative">
                                            <LinkIcon size={14} className="absolute left-3 top-3 text-blue-400" />
                                            <input
                                                type="url"
                                                placeholder="Paste link here..."
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-blue-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                value={task.deliveryLink || ''}
                                                onChange={(e) => onUpdate({ deliveryLink: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-blue-700 mb-1">Delivery Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2.5 rounded-xl border border-blue-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-600"
                                            value={task.completionDate || ''}
                                            onChange={(e) => onUpdate({ completionDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* References Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">References</h3>

                                {/* Links */}
                                {task.referenceLinks.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-medium text-gray-500">External Links</span>
                                        <div className="space-y-2">
                                            {task.referenceLinks.map((link, i) => (
                                                <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-white p-3 bg-white rounded-xl border border-gray-100 shadow-sm transition-all">
                                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                        <LinkIcon size={16} />
                                                    </div>
                                                    <span className="truncate flex-1 font-medium">{link}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Images */}
                                {task.referenceImages.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-medium text-gray-500">Images</span>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {task.referenceImages.map((img, i) => (
                                                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-white shadow-sm">
                                                    <img src={img} alt={`Ref ${i}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Info (Right) - Controls */}
                        <div className="md:col-span-4 space-y-6">

                            {/* Status Control - NEW */}
                            <div className="bg-bg-surface rounded-2xl p-5 shadow-sm border border-border-default">
                                <label className="text-xs text-text-secondary font-bold uppercase tracking-wider block mb-2">Current Status</label>
                                <div className="relative">
                                    <select
                                        className={`w-full appearance-none px-4 py-3 rounded-xl border-2 font-bold text-sm outline-none cursor-pointer transition-colors
                                    ${task.status === Status.DONE ? 'border-green-100 bg-green-50 text-green-700 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300' :
                                                task.status === Status.IN_PROGRESS ? 'border-blue-100 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300' :
                                                    task.status === Status.REVIEW ? 'border-purple-100 bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:border-purple-800 dark:text-purple-300' :
                                                        'border-gray-100 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}
                                `}
                                        value={task.status}
                                        onChange={(e) => onUpdate({ status: e.target.value as Status })}
                                    >
                                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-4 opacity-50 pointer-events-none" />
                                </div>
                            </div>

                            {/* People Controls - UPDATED */}
                            <div className="bg-bg-surface rounded-2xl p-5 shadow-sm border border-border-default space-y-5">

                                {/* Designer Reassignment */}
                                <div>
                                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block mb-2">Assigned Designer</span>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none pl-12 pr-4 py-3 rounded-xl border border-border-default bg-bg-canvas text-sm font-medium text-text-primary outline-none focus:border-blue-500 transition-colors"
                                            value={task.designer?.id || ''}
                                            onChange={(e) => {
                                                const newDesigner = e.target.value
                                                    ? designers.find(d => d.id === e.target.value)
                                                    : undefined;
                                                onUpdate({ designer: newDesigner });
                                            }}
                                        >
                                            <option value="">Unassigned</option>
                                            {designers.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-2.5 pointer-events-none">
                                            {task.designer ? (
                                                <img src={task.designer.avatar} alt={task.designer.name} className="w-6 h-6 rounded-full" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
                                            )}
                                        </div>
                                        <ChevronDown size={16} className="absolute right-4 top-3.5 text-text-secondary pointer-events-none" />
                                    </div>
                                </div>

                                <div className="h-px bg-border-default" />

                                <div>
                                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block mb-2">Requester</span>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none pl-8 pr-4 py-2 rounded-xl border border-border-default bg-bg-canvas text-sm font-medium text-text-primary outline-none focus:border-blue-500 transition-colors"
                                            value={task.requester}
                                            onChange={(e) => onUpdate({ requester: e.target.value })}
                                        >
                                            {requesters.map(r => (
                                                <option key={r.id} value={r.name}>{r.name}</option>
                                            ))}
                                        </select>
                                        <User size={14} className="absolute left-3 top-3 text-text-secondary pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-bg-surface rounded-2xl p-5 shadow-sm border border-border-default space-y-4">
                                <div>
                                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block mb-2">Due Date</span>
                                    <div className="flex items-center gap-2 text-sm text-text-primary bg-bg-canvas px-3 py-2 rounded-lg border border-border-default">
                                        <Calendar size={14} className="text-text-secondary" />
                                        {task.dueDate}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider block mb-2">Estimation</span>
                                    <div className="flex items-center gap-2 text-sm text-text-primary bg-bg-canvas px-3 py-2 rounded-lg border border-border-default">
                                        <Clock size={14} className="text-text-secondary" />
                                        {task.points} Sprint Points
                                    </div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            {onDelete && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this task?')) {
                                            onDelete(task.id);
                                            onClose();
                                        }
                                    }}
                                    className="w-full py-3 text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-xl transition-colors border border-red-100 dark:border-red-900/50"
                                >
                                    Delete Task
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
