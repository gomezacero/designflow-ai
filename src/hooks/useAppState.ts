import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task, Status, Priority, TaskType, Designer, Sprint } from '../models';
import {
  INITIAL_TASKS,
  INITIAL_DESIGNERS,
  INITIAL_REQUESTERS,
  INITIAL_SPRINTS,
} from '../utils/constants';
import * as api from '../services/api';

// ... (rest of imports)

// ... (isSupabaseConfigured function remains same)

/**
 * Custom hook for application data state management
 * Uses Supabase for persistence when configured, falls back to local state
 */
export const useAppState = (): UseAppStateReturn => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  // ... (rest of state)
  const [designers, setDesigners] = useState<Designer[]>(INITIAL_DESIGNERS);
  const [requesters, setRequesters] = useState<string[]>(INITIAL_REQUESTERS);
  const [sprints, setSprints] = useState<Sprint[]>(INITIAL_SPRINTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useSupabase = isSupabaseConfigured();

  // ... (activeSprint memo)

  /**
   * Fetches all data from Supabase
   */
  const fetchAllData = useCallback(async () => {
     // ... (fetch logic remains same)
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
   * Initial data fetch on mount AND Realtime Subscription
   */
  useEffect(() => {
    fetchAllData();

    if (!useSupabase) return;

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('app-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'designers' },
        (payload) => {
          const updatedDesigner = payload.new as any; // Cast generic payload
          
          // Map DB columns to App Model (snake_case to camelCase)
          const designerModel: Designer = {
            id: updatedDesigner.id,
            name: updatedDesigner.name,
            avatar: updatedDesigner.avatar || ''
          };

          // 1. Update Designers List
          setDesigners(prev => prev.map(d => d.id === designerModel.id ? designerModel : d));

          // 2. Update Tasks (Live update of avatar in cards)
          setTasks(prev => prev.map(t => {
            if (t.designer?.id === designerModel.id) {
              return { ...t, designer: designerModel };
            }
            return t;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData, useSupabase]);

  // ... (rest of methods: handleCreateTask, handleUpdateTask, return)

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
      // Intelligent updates: Handle completion date automatically
      const smartUpdates = { ...updates };
      
      if (updates.status === Status.DONE) {
        smartUpdates.completionDate = new Date().toISOString().split('T')[0];
      } else if (updates.status && updates.status !== Status.DONE) {
        // If moving out of Done, clear the date
        smartUpdates.completionDate = null as any; // Cast to any to satisfy Partial<Task> if strict null checks complain, but DB handles null
      }

      if (useSupabase) {
        try {
          setError(null);
          const updated = await api.updateTask(taskId, smartUpdates);
          setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to update task';
          setError(message);
          console.error('Error updating task:', err);
        }
      } else {
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...smartUpdates } : t)));
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
