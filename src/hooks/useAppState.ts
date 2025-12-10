import { useState, useCallback, useMemo, useEffect } from 'react';
import { Task, Status, Priority, TaskType, Designer, Sprint } from '../models';
import {
  INITIAL_TASKS,
  INITIAL_DESIGNERS,
  INITIAL_REQUESTERS,
  INITIAL_SPRINTS,
} from '../utils/constants';
import * as api from '../services/api';

interface UseAppStateReturn {
  // Data
  tasks: Task[];
  designers: Designer[];
  requesters: string[];
  sprints: Sprint[];
  activeSprint: string;

  // Loading & Error states
  isLoading: boolean;
  error: string | null;

  // Setters
  setDesigners: React.Dispatch<React.SetStateAction<Designer[]>>;
  setRequesters: React.Dispatch<React.SetStateAction<string[]>>;
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;

  // Handlers
  handleCreateTask: (taskData: Partial<Task>) => Promise<void>;
  handleUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;

  // Refresh data
  refreshData: () => Promise<void>;
}

/**
 * Checks if Supabase is properly configured
 */
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('your-project'));
}

/**
 * Custom hook for application data state management
 * Uses Supabase for persistence when configured, falls back to local state
 */
export const useAppState = (): UseAppStateReturn => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [designers, setDesigners] = useState<Designer[]>(INITIAL_DESIGNERS);
  const [requesters, setRequesters] = useState<string[]>(INITIAL_REQUESTERS);
  const [sprints, setSprints] = useState<Sprint[]>(INITIAL_SPRINTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useSupabase = isSupabaseConfigured();

  const activeSprint = useMemo(
    () => sprints.find(s => s.isActive)?.name || 'Backlog',
    [sprints]
  );

  /**
   * Fetches all data from Supabase
   */
  const fetchAllData = useCallback(async () => {
    if (!useSupabase) return;

    setIsLoading(true);
    setError(null);

    try {
      const [tasksData, designersData, requestersData, sprintsData] = await Promise.all([
        api.getTasks(),
        api.getDesigners(),
        api.getRequesters(),
        api.getSprints(),
      ]);

      setTasks(tasksData);
      setDesigners(designersData);
      setRequesters(requestersData);
      setSprints(sprintsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [useSupabase]);

  /**
   * Initial data fetch on mount
   */
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /**
   * Creates a new task
   */
  const handleCreateTask = useCallback(
    async (taskData: Partial<Task>) => {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);

      const newTaskData: Partial<Task> = {
        title: taskData.title || 'Untitled',
        type: taskData.type || TaskType.OTHER,
        priority: taskData.priority || Priority.NORMAL,
        status: Status.TODO,
        points: taskData.points || 1,
        dueDate: taskData.dueDate || defaultDueDate.toISOString().split('T')[0] || '',
        requestDate: taskData.requestDate || new Date().toISOString().split('T')[0] || '',
        sprint: taskData.sprint || activeSprint,
        description: taskData.description || '',
        requester: taskData.requester || 'Unknown',
        manager: taskData.manager || 'Unassigned',
        referenceImages: taskData.referenceImages || [],
        referenceLinks: taskData.referenceLinks || [],
        designer: taskData.designer,
      };

      if (useSupabase) {
        try {
          setError(null);
          const created = await api.createTask(newTaskData);
          setTasks(prev => [created, ...prev]);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to create task';
          setError(message);
          console.error('Error creating task:', err);
        }
      } else {
        const newTask: Task = {
          id: `t${Date.now()}`,
          ...newTaskData,
          deliveryLink: '',
          completionDate: '',
        } as Task;
        setTasks(prev => [newTask, ...prev]);
      }
    },
    [activeSprint, useSupabase]
  );

  /**
   * Updates an existing task
   */
  const handleUpdateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (useSupabase) {
        try {
          setError(null);
          const updated = await api.updateTask(taskId, updates);
          setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to update task';
          setError(message);
          console.error('Error updating task:', err);
        }
      } else {
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
      }
    },
    [useSupabase]
  );

  return {
    tasks,
    designers,
    requesters,
    sprints,
    activeSprint,
    isLoading,
    error,
    setDesigners,
    setRequesters,
    setSprints,
    handleCreateTask,
    handleUpdateTask,
    refreshData: fetchAllData,
  };
};
