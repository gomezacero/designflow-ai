import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { Task } from '../models';

interface SortableTaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
    onDelete?: (task: Task) => void;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onClick, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Dim the original item while dragging
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <TaskCard task={task} onClick={onClick} onDelete={onDelete} />
        </div>
    );
};
