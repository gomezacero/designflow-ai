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
                <h3 className="font-bold text-gray-700 text-sm">{status}</h3>
                <span className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
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
                    className="flex-1 rounded-2xl bg-gray-100/50 border border-gray-200/50 p-2.5 space-y-3 overflow-y-auto custom-scrollbar h-full min-h-[150px]"
                >
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <SortableTaskCard key={task.id} task={task} onClick={onClickTask} />
                        ))
                    ) : (
                        <div className="h-full min-h-[100px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};
