import React, { useState, useMemo } from 'react';
import { Sprint, Task, Status } from '../models';
import { TaskCard } from './TaskCard';
import { SortableTaskCard } from './SortableTaskCard';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

interface SprintsViewProps {
    sprints: Sprint[];
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onDeleteSprint?: (id: string) => void;
    onDeleteTask?: (id: string) => void;
}

export const SprintsView: React.FC<SprintsViewProps> = ({ sprints, tasks, onTaskClick, onDeleteSprint, onDeleteTask }) => {
    const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);
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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        // TODO: Implement actual reordering logic here when backend supports it
        if (over && active.id !== over.id) {
            console.log(`Moved task ${active.id} to position of ${over.id}`);
        }
    };

    // Group tasks by sprint
    const tasksBySprint = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        sprints.forEach(s => {
            grouped[s.name] = tasks.filter(t => t.sprint === s.name);
        });
        // Handle backlog or tasks without sprint
        grouped['Backlog'] = tasks.filter(t => !t.sprint || t.sprint === 'Backlog');
        return grouped;
    }, [sprints, tasks]);

    // Sort sprints: Active first, then by date (newest first)
    const sortedSprints = useMemo(() => {
        return [...sprints].sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
    }, [sprints]);

    // Auto-expand active sprint on load
    React.useEffect(() => {
        const active = sprints.find(s => s.isActive);
        if (active && expandedSprintId === null) {
            setExpandedSprintId(active.id);
        }
    }, [sprints]);

    const toggleSprint = (sprintId: string) => {
        setExpandedSprintId(prev => prev === sprintId ? null : sprintId);
    };

    return (
        <div className="p-6 space-y-6 w-full h-full overflow-y-auto custom-scrollbar">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">Sprints Overview</h1>
                <p className="text-text-secondary">Manage and track progress across all development cycles.</p>
            </header>

            <div className="space-y-4">
                {sortedSprints.map(sprint => {
                    const sprintTasks = tasksBySprint[sprint.name] || [];
                    const isExpanded = expandedSprintId === sprint.id;
                    const completedTasks = sprintTasks.filter(t => t.status === Status.DONE).length;
                    const totalTasks = sprintTasks.length;
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    // Determine sprint status color
                    const statusColor = sprint.isActive
                        ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                        : new Date(sprint.endDate) < new Date()
                            ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' // Past
                            : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'; // Future

                    const statusLabel = sprint.isActive ? 'Active' : new Date(sprint.endDate) < new Date() ? 'Completed' : 'Planned';

                    return (
                        <div key={sprint.id} className="bg-bg-surface rounded-2xl border border-border-default shadow-sm overflow-hidden transition-all duration-300">

                            {/* Sprint Header (Clickable) */}
                            <div
                                onClick={() => toggleSprint(sprint.id)}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-bg-surface-hover transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${isExpanded ? 'bg-bg-surface-hover' : 'bg-bg-canvas'} transition-colors`}>
                                        {isExpanded ? <ChevronDown size={20} className="text-text-secondary" /> : <ChevronRight size={20} className="text-text-secondary" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-text-primary">{sprint.name}</h3>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-text-secondary font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {sprint.startDate} - {sprint.endDate}
                                            </span>
                                            <span>•</span>
                                            <span>{totalTasks} tasks</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Progress Bar (Mini) */}
                                    <div className="hidden md:flex flex-col items-end gap-1 w-48">
                                        <div className="flex justify-between w-full text-xs font-semibold text-text-secondary">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-bg-canvas rounded-full overflow-hidden border border-border-default">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${sprint.isActive ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Delete Sprint Button */}
                                    {onDeleteSprint && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Are you sure you want to delete "${sprint.name}"? This will also remove ${totalTasks} associated tasks.`)) {
                                                    onDeleteSprint(sprint.id);
                                                }
                                            }}
                                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete Sprint"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Sprint Content (Accordion) */}
                            {isExpanded && (
                                <div className="border-t border-border-default bg-bg-canvas/50 p-5 animate-slideDown">
                                    {sprintTasks.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCorners}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={sprintTasks.map(t => t.id)}
                                                    strategy={rectSortingStrategy}
                                                >
                                                    {sprintTasks.map(task => (
                                                        <SortableTaskCard
                                                            key={task.id}
                                                            task={task}
                                                            onClick={(t) => onTaskClick?.(t)}
                                                            onDelete={(t) => {
                                                                if (window.confirm(`Are you sure you want to delete "${t.title}"?`)) {
                                                                    onDeleteTask?.(t.id);
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </SortableContext>
                                                <DragOverlay>
                                                    {activeId ? (
                                                        <div className="rotate-2 scale-105 cursor-grabbing">
                                                            <TaskCard
                                                                task={tasks.find(t => t.id === activeId)!}
                                                                onClick={() => { }}
                                                            // onDelete omitted in overlay for cleaner look
                                                            />
                                                        </div>
                                                    ) : null}
                                                </DragOverlay>
                                            </DndContext>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-text-secondary text-sm italic">
                                            No tasks assigned to this sprint yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
