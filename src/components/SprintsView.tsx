import React, { useState, useMemo } from 'react';
import { Sprint, Task, Status } from '../models';
import { TaskCard } from './TaskCard';
import { Calendar, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { getPriorityWeight } from '../utils';

interface SprintsViewProps {
  sprints: Sprint[];
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const SprintsView: React.FC<SprintsViewProps> = ({ sprints, tasks, onTaskClick }) => {
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);

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
        <h1 className="text-3xl font-bold text-ios-text tracking-tight mb-2">Sprints Overview</h1>
        <p className="text-gray-500">Manage and track progress across all development cycles.</p>
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
                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                : new Date(sprint.endDate) < new Date() 
                    ? 'bg-gray-100 text-gray-600 border-gray-200' // Past
                    : 'bg-purple-100 text-purple-700 border-purple-200'; // Future

            const statusLabel = sprint.isActive ? 'Active' : new Date(sprint.endDate) < new Date() ? 'Completed' : 'Planned';

            return (
                <div key={sprint.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                    
                    {/* Sprint Header (Clickable) */}
                    <div 
                        onClick={() => toggleSprint(sprint.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${isExpanded ? 'bg-gray-200' : 'bg-gray-100'} transition-colors`}>
                                {isExpanded ? <ChevronDown size={20} className="text-gray-600"/> : <ChevronRight size={20} className="text-gray-400"/>}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{sprint.name}</h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {sprint.startDate} - {sprint.endDate}
                                    </span>
                                    <span>•</span>
                                    <span>{totalTasks} tasks</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar (Mini) */}
                        <div className="hidden md:flex flex-col items-end gap-1 w-48">
                            <div className="flex justify-between w-full text-xs font-semibold text-gray-500">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${sprint.isActive ? 'bg-blue-500' : 'bg-gray-400'}`} 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sprint Content (Accordion) */}
                    {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-5 animate-slideDown">
                            {sprintTasks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {sprintTasks.map(task => (
                                        <div key={task.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => onTaskClick?.(task)}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                    task.status === Status.DONE ? 'bg-green-100 text-green-700' :
                                                    task.status === Status.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {task.status}
                                                </span>
                                                {task.priority === 'Critical' && <div className="w-2 h-2 rounded-full bg-red-500" title="Critical" />}
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{task.title}</h4>
                                            <div className="flex items-center gap-2 mt-3">
                                                {task.designer ? (
                                                     <img src={task.designer.avatar} className="w-5 h-5 rounded-full" alt="avatar" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                                                )}
                                                <span className="text-xs text-gray-500 truncate">{task.designer?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-sm italic">
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
