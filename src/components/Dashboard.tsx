import React, { useState, useMemo } from 'react';
import { Task, Status, TaskType, Designer, Sprint, Requester } from '../models';
import { TaskCard } from './TaskCard';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from './TaskDetailModal';
import { Filter, List as ListIcon, Search, X, Calendar, User, Tag, Kanban, Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { openDatePicker, getPriorityWeight } from '../utils';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface DashboardProps {
    tasks: Task[];
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
    designers: Designer[];
    requesters: Requester[];
    sprints: Sprint[];
    activeSprint?: string; // Made optional to match usage
    onTaskClick?: (task: Task) => void;
    onTaskDrop?: (taskId: string, newStatus: Status) => void;
    onDeleteTask?: (taskId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    tasks,
    designers,
    requesters,
    sprints,
    onUpdateTask,
    onTaskClick: _onTaskClick, // Prefixed to silence unused warning, kept for future use
    onTaskDrop,
    onDeleteTask,
}) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateStart: '',
        dateEnd: '',
        designerId: '',
        requester: '',
        type: '',
        priority: '',
        sprint: ''
    });

    const activeSprint = sprints.find(s => s.isActive);

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        // Text Search (Title, Desc, Requester, Designer Name)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesTitle = task.title.toLowerCase().includes(q);
            const matchesDesc = task.description?.toLowerCase().includes(q);
            const matchesRequester = task.requester.toLowerCase().includes(q);
            const matchesDesigner = task.designer?.name.toLowerCase().includes(q);

            if (!matchesTitle && !matchesDesc && !matchesRequester && !matchesDesigner) return false;
        }

        // Advanced Filters
        if (filters.designerId && task.designer?.id !== filters.designerId) return false;
        if (filters.requester && task.requester !== filters.requester) return false;
        if (filters.type && task.type !== filters.type) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.sprint && task.sprint !== filters.sprint) return false;

        // Date Range (Comparing against Due Date or Request Date)
        const taskDate = new Date(task.dueDate || task.requestDate);
        if (filters.dateStart && taskDate < new Date(filters.dateStart)) return false;
        if (filters.dateEnd && taskDate > new Date(filters.dateEnd)) return false;

        return true;
    });

    // Archive / Segmentation Logic
    const { visibleTasks, archivedTasks } = useMemo(() => {
        // Threshold: Only archive if we have > 20 tasks in the current view
        if (filteredTasks.length <= 20) {
            return { visibleTasks: filteredTasks, archivedTasks: [] };
        }

        // Sort by Date (Newest first) to prioritize keeping recent tasks visible
        const sorted = [...filteredTasks].sort((a, b) =>
            new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
        );

        const visible: Task[] = [];
        const archived: Task[] = [];
        let doneCount = 0;

        sorted.forEach(task => {
            if (task.status === Status.DONE) {
                // Keep the 5 most recent DONE tasks, archive the rest
                if (doneCount < 5) {
                    visible.push(task);
                    doneCount++;
                } else {
                    archived.push(task);
                }
            } else {
                // Always show active tasks
                visible.push(task);
            }
        });

        return { visibleTasks: visible, archivedTasks: archived };
    }, [filteredTasks]);

    const clearFilters = () => {
        setFilters({
            dateStart: '',
            dateEnd: '',
            designerId: '',
            requester: '',
            type: '',
            priority: '',
            sprint: ''
        });
        setSearchQuery('');
    };

    const hasActiveFilters = searchQuery || Object.values(filters).some(Boolean);

    // Drag and Drop Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';

        if (!isActiveTask) return;

        // Implements dropping a Task over another Task (and potentially changing columns)
        if (isActiveTask && isOverTask) {
            // Logic handled by SortableContext in background for reordering
            // But if we wanted to force state updates here we could.
            // keeping it simple as we rely on dragEnd for final commit
            return;
        }

        // Dropping a Task over a Column
        const isOverColumn = Object.values(Status).includes(overId as Status);
        if (isActiveTask && isOverColumn) {
            // Visual feedback handled by DndKit
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        // Find the dropped task
        const task = tasks.find(t => t.id === active.id);

        if (task && over) {
            // Check if dropped on a container (Status column) or another item
            const overId = over.id as string;

            // If dropped on a specific task, find its status
            const overTask = tasks.find(t => t.id === overId);
            let newStatus: Status | undefined;

            if (overTask) {
                newStatus = overTask.status;
            } else if (Object.values(Status).includes(overId as Status)) {
                // Dropped directly on a column container
                newStatus = overId as Status;
            }

            if (newStatus && newStatus !== task.status) {
                onTaskDrop?.(task.id, newStatus);
                onUpdateTask(task.id, { status: newStatus });
            }
        }
    };

    // Metrics
    const velocity = filteredTasks.reduce((acc, curr) => curr.status === Status.DONE ? acc + curr.points : acc, 0);
    const pending = filteredTasks.filter(t => t.status !== Status.DONE).length;

    return (
        <div className="p-4 md:p-6 space-y-4 w-full h-full flex flex-col overflow-y-auto custom-scrollbar">

            {/* Header & Metrics */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2 pt-10 md:pt-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-1">Good morning, Team.</h1>
                    <p className="text-sm text-text-secondary">
                        {activeSprint ? `Working on ${activeSprint.name} (${activeSprint.startDate} - ${activeSprint.endDate})` : 'No active sprint selected.'}
                    </p>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                    <div className="bg-bg-surface/60 backdrop-blur-md px-5 py-3 rounded-xl shadow-sm border border-border-default min-w-[140px] flex-shrink-0">
                        <div className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Velocity</div>
                        <div className="text-2xl font-bold text-text-primary">{velocity} <span className="text-sm font-normal text-text-secondary">pts</span></div>
                    </div>
                    <div className="bg-bg-surface/60 backdrop-blur-md px-5 py-3 rounded-xl shadow-sm border border-border-default min-w-[140px] flex-shrink-0">
                        <div className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Pending</div>
                        <div className="text-2xl font-bold text-text-primary">{pending} <span className="text-sm font-normal text-text-secondary">tasks</span></div>
                    </div>
                </div>
            </header>

            {/* SEARCH & CONTROLS BAR */}
            <div className="flex flex-col gap-3 sticky top-0 z-30 bg-bg-canvas/95 backdrop-blur-sm py-2 -mx-4 px-4 md:-mx-6 md:px-6 shadow-sm md:shadow-none transition-colors">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 md:py-2.5 text-base md:text-sm rounded-xl border-none bg-bg-surface shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-text-secondary text-text-primary"
                            placeholder="Search tasks..."
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-text-primary" aria-label="Clear search">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 md:py-2 text-sm rounded-xl font-medium transition-all whitespace-nowrap ${showFilters ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-bg-surface text-text-secondary border border-border-default shadow-sm hover:bg-bg-surface-hover hover:text-text-primary'}`}
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            {Object.values(filters).some(Boolean) && <div className="w-2 h-2 rounded-full bg-red-400 border border-white" />}
                        </button>

                        <div className="flex items-center bg-bg-surface p-1 rounded-xl shadow-sm border border-border-default whitespace-nowrap">
                            <button
                                onClick={() => setViewMode('board')}
                                className={`p-2.5 md:p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-bg-canvas text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                                title="Board View"
                            >
                                <Kanban size={20} className="md:w-4 md:h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 md:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-bg-canvas text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                                title="List View"
                            >
                                <ListIcon size={20} className="md:w-4 md:h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ADVANCED FILTER PANEL */}
                {showFilters && (
                    <div className="bg-bg-surface p-5 rounded-xl shadow-sm border border-border-default animate-slideDown">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                            {/* Sprint Filter */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={12} /> Sprint
                                </label>
                                <select
                                    className="w-full bg-bg-canvas border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                    value={filters.sprint}
                                    onChange={e => setFilters({ ...filters, sprint: e.target.value })}
                                >
                                    <option value="">All Sprints</option>
                                    {sprints.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={12} /> Date Range
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <Calendar size={14} className="absolute left-3 top-3 text-text-secondary pointer-events-none" />
                                        <input
                                            type="date"
                                            onClick={openDatePicker}
                                            className="w-full bg-bg-canvas border border-border-default rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer transition-colors"
                                            value={filters.dateStart}
                                            onChange={e => setFilters({ ...filters, dateStart: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <Calendar size={14} className="absolute left-3 top-3 text-text-secondary pointer-events-none" />
                                        <input
                                            type="date"
                                            onClick={openDatePicker}
                                            className="w-full bg-bg-canvas border border-border-default rounded-xl pl-9 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer transition-colors"
                                            value={filters.dateEnd}
                                            onChange={e => setFilters({ ...filters, dateEnd: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Designer */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <User size={12} /> Designer
                                </label>
                                <select
                                    className="w-full bg-bg-canvas border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                    value={filters.designerId}
                                    onChange={e => setFilters({ ...filters, designerId: e.target.value })}
                                >
                                    <option value="">All Designers</option>
                                    {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            {/* Requester */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <User size={12} /> Requester
                                </label>
                                <select
                                    className="w-full bg-bg-canvas border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                    value={filters.requester}
                                    onChange={e => setFilters({ ...filters, requester: e.target.value })}
                                >
                                    <option value="">All Requesters</option>
                                    {requesters.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>

                            {/* Type */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag size={12} /> Type
                                </label>
                                <select
                                    className="w-full bg-bg-canvas border border-border-default rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                    value={filters.type}
                                    onChange={e => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option value="">All Types</option>
                                    {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {hasActiveFilters && (
                    <div className="text-sm text-gray-500 font-medium px-1">
                        Found <span className="font-bold text-gray-900">{filteredTasks.length}</span> tasks matching criteria
                        <button onClick={clearFilters} className="ml-2 text-blue-600 hover:text-blue-700 hover:underline font-semibold">Clear all</button>
                    </div>
                )}
            </div>

            {/* Content View - Uses visibleTasks (Active + recent done) */}
            {viewMode === 'board' ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 overflow-x-auto pb-4 w-full snap-x snap-mandatory md:snap-none min-h-[300px]">
                        {Object.values(Status).map((status) => {
                            const columnTasks = visibleTasks
                                .filter(t => t.status === status)
                                .sort((a, b) => {
                                    if (status !== Status.DONE) {
                                        // First, sort by priority (Critical > High > Normal)
                                        const weightA = getPriorityWeight(a.priority);
                                        const weightB = getPriorityWeight(b.priority);
                                        if (weightB !== weightA) {
                                            return weightB - weightA;
                                        }
                                        // Then, sort by request date ascending (oldest first, newest at bottom)
                                        return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
                                    }
                                    // For DONE tasks, sort by completion date (most recent first)
                                    return new Date(b.completionDate || b.requestDate).getTime() - new Date(a.completionDate || a.requestDate).getTime();
                                });

                            return (
                                <div
                                    key={status}
                                    className="min-w-[280px] w-[85vw] md:w-full md:max-w-xs flex-shrink-0 flex flex-col h-full snap-center"
                                >
                                    <KanbanColumn
                                        status={status}
                                        tasks={columnTasks}
                                        onClickTask={setSelectedTask}
                                    />
                                </div>
                            );
                        })}

                    </div>
                    <DragOverlay>
                        {activeId ? (
                            <TaskCard
                                task={tasks.find(t => t.id === activeId)!}
                                onClick={() => { }}
                                className="shadow-2xl rotate-2 scale-105 cursor-grabbing"
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            ) : (
                <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-default overflow-hidden mb-12 w-full">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-bg-canvas border-b border-border-default">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Requester</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Designer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {visibleTasks.map(task => (
                                    <tr
                                        key={task.id}
                                        onClick={() => setSelectedTask(task)}
                                        className="hover:bg-bg-surface-hover cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-sm text-text-primary">{task.title}</div>
                                            <div className="text-xs text-text-secondary mt-0.5">{task.type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-text-primary">{task.requester}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.designer ? (
                                                <div className="flex items-center gap-3">
                                                    <img src={task.designer.avatar} alt={task.designer.name} className="w-6 h-6 rounded-full" />
                                                    <span className="text-sm text-text-primary font-medium">{task.designer.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-text-secondary italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold
                                        ${task.status === Status.DONE ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    task.status === Status.IN_PROGRESS ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary font-medium">
                                            {task.dueDate}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
            }

            {/* Archive Section */}
            {
                archivedTasks.length > 0 && (
                    <div className="mt-8 mb-8">
                        <button
                            onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                            className="w-full bg-bg-surface hover:bg-bg-surface-hover hover:shadow-sm border border-border-default rounded-2xl p-4 flex items-center justify-between transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-bg-canvas text-text-secondary rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    <Archive size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold text-text-primary">Project Archive</h3>
                                    <p className="text-xs text-text-secondary font-medium">{archivedTasks.length} older tasks completed</p>
                                </div>
                            </div>
                            {isArchiveOpen ? <ChevronUp className="text-text-secondary" /> : <ChevronDown className="text-text-secondary" />}
                        </button>

                        {isArchiveOpen && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 animate-slideDown p-1">
                                {archivedTasks.map(task => (
                                    <div key={task.id} className="opacity-70 hover:opacity-100 transition-all grayscale hover:grayscale-0">
                                        <TaskCard task={task} onClick={setSelectedTask} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {/* Task Details Modal */}
            {
                selectedTask && (
                    <TaskDetailModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onUpdate={(updates) => {
                            onUpdateTask(selectedTask.id, updates);
                            setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
                        }}
                        designers={designers}
                        requesters={requesters}
                        onDelete={onDeleteTask}
                    />
                )
            }

        </div >
    );
};