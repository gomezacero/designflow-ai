import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, Status } from '../models';
import { SortableTaskCard } from './SortableTaskCard';

interface KanbanColumnProps {
    status: Status;
    tasks: Task[];
    onClickTask: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onClickTask }) => {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div className="min-w-[280px] w-[85vw] md:w-full md:max-w-xs flex-shrink-0 flex flex-col h-full snap-center">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-text-secondary text-sm uppercase tracking-wider">{status}</h3>
                <span className="bg-bg-surface border border-border-default text-text-secondary px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                    {tasks.length}
                </span>
            </div>

            {/* Drop Zone */}
            <SortableContext
                id={status}
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className="flex-1 rounded-2xl bg-black/5 dark:bg-bg-surface/30 border border-transparent dark:border-border-default p-2.5 space-y-3 overflow-y-auto custom-scrollbar h-full min-h-[150px] transition-colors"
                >
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <SortableTaskCard key={task.id} task={task} onClick={onClickTask} />
                        ))
                    ) : (
                        <div className="h-full min-h-[100px] border-2 border-dashed border-border-default rounded-xl flex items-center justify-center text-text-secondary text-sm font-medium opacity-60">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};
