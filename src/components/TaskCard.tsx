
import React from 'react';
import { Task, Status, Priority } from '../models';
import { Calendar, Flame, Link as LinkIcon, Image as ImageIcon, UserCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onDelete?: (task: Task) => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDelete, className = '' }) => {

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.DONE: return 'bg-green-100 text-green-800';
      case Status.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case Status.REVIEW: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isHot = task.priority === Priority.HIGH || task.priority === Priority.CRITICAL;

  return (
    <div
      onClick={() => onClick(task)}
      className={`group cursor-pointer relative bg-white/90 backdrop-blur-md rounded-xl p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-white/60 flex flex-col gap-2.5 ${className}`}
    >
      {/* Delete Button (Visible on Hover) */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 z-10"
          title="Delete Task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      )}

      {/* Header: Status & Priority */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold tracking-tight">{task.sprint}</span>
        </div>

        {isHot && (
          <div className="text-red-500 animate-pulse bg-red-50 p-1 rounded-full">
            <Flame size={14} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
          {task.title}
        </h3>
        <p className="text-[11px] text-gray-500 line-clamp-1 font-medium">{task.type}</p>

        {/* Requester & Points Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg">
            <UserCircle size={12} />
            <span className="truncate max-w-[90px] font-semibold">{task.requester}</span>
          </div>

          <div className="flex items-center gap-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${task.points >= 5 ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
              {task.points}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-1">
        <div className="flex items-center gap-2">
          {task.designer && task.designer.avatar ? (
            <img
              src={task.designer.avatar}
              alt={task.designer.name}
              className="w-6 h-6 rounded-full border border-white object-cover shadow-sm"
              title={task.designer.name}
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold"
              title={task.designer?.name || 'Unassigned'}
            >
              {task.designer ? task.designer.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div className="flex gap-1 text-gray-300 ml-1">
            {(task.referenceLinks && task.referenceLinks.length > 0) && <LinkIcon size={12} className="text-blue-400" />}
            {(task.referenceImages && task.referenceImages.length > 0) && <ImageIcon size={12} className="text-purple-400" />}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold bg-white px-1.5 py-0.5 rounded border border-transparent">
          <Calendar size={12} />
          <span>{new Date(task.dueDate || task.requestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};
