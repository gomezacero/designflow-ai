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

  // New handlers
  handleCreateSprint: (sprint: Partial<Sprint>) => Promise<void>;

  handleUpdateSprint: (id: string, updates: Partial<Sprint>) => Promise<void>;
  handleDeleteSprint: (id: string, userId: string) => Promise<void>;
  handleRestoreSprint: (id: string) => Promise<void>;


  handleDeleteTask: (taskId: string, userId: string) => Promise<void>;
  handleRestoreTask: (taskId: string) => Promise<void>;

  handleCreateDesigner: (designer: Partial<Designer>) => Promise<void>;
  handleUpdateDesigner: (id: string, updates: Partial<Designer>) => Promise<void>;
  handleDeleteDesigner: (id: string) => Promise<void>;

  handleCreateRequester: (name: string) => Promise<void>;
  handleDeleteRequester: (name: string) => Promise<void>;
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
      } else if (updates.status) {
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

  /**
   * Handlers for Sprints
   */
  const handleCreateSprint = useCallback(
    async (sprintData: Partial<Sprint>) => {
      if (useSupabase) {
        try {
          setError(null);
          const created = await api.createSprint(sprintData);
          setSprints(prev => [created, ...prev]);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to create sprint';
          setError(message);
          console.error('Error creating sprint:', err);
        }
      } else {
        const newSprint: Sprint = {
          id: `s${Date.now()}`,
          name: sprintData.name || 'New Sprint',
          startDate: sprintData.startDate || '',
          endDate: sprintData.endDate || '',
          isActive: sprintData.isActive || false
        };
        setSprints(prev => [...prev, newSprint]);
      }
    },
    [useSupabase]
  );

  const handleUpdateSprint = useCallback(
    async (id: string, updates: Partial<Sprint>) => {
      if (useSupabase) {
        try {
          setError(null);
          if (updates.isActive) {
            // Special handling for setting active sprint
            await api.setActiveSprint(id);
            // We need to refetch or manually update all sprints to ensure only one is active
            setSprints(prev => prev.map(s => ({
              ...s,
              isActive: s.id === id
            })));
          } else {
            const updated = await api.updateSprint(id, updates);
            setSprints(prev => prev.map(s => (s.id === id ? updated : s)));
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to update sprint';
          setError(message);
          console.error('Error updating sprint:', err);
        }
      } else {
        setSprints(prev => {
          if (updates.isActive) {
            return prev.map(s => ({ ...s, isActive: s.id === id }));
          }
          return prev.map(s => (s.id === id ? { ...s, ...updates } : s));
        });
      }
    },
    [useSupabase]
  );

  const handleDeleteSprint = useCallback(
    async (id: string, userId: string) => {
      if (useSupabase) {
        try {
          setError(null);
          await api.softDeleteSprint(id, userId);
          setSprints(prev => prev.filter(s => s.id !== id));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete sprint';
          setError(message);
          console.error('Error deleting sprint:', err);
        }
      } else {
        setSprints(prev => prev.filter(s => s.id !== id));
      }
    },
    [useSupabase]
  );

  const handleRestoreSprint = useCallback(
    async (id: string) => {
      if (useSupabase) {
        try {
          setError(null);
          await api.restoreSprint(id);
          // We need to re-fetch sprints to get the restored one back, or we could optimistically add it back if we had the data.
          // For simplicity, let's just refresh data
          await fetchAllData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to restore sprint';
          setError(message);
        }
      }
    },
    [useSupabase, fetchAllData]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string, userId: string) => {
      if (useSupabase) {
        try {
          setError(null);
          await api.softDeleteTask(taskId, userId);
          setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete task';
          setError(message);
        }
      } else {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    },
    [useSupabase]
  );

  const handleRestoreTask = useCallback(
    async (taskId: string) => {
      if (useSupabase) {
        try {
          setError(null);
          await api.restoreTask(taskId);
          await fetchAllData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to restore task';
          setError(message);
        }
      }
    },
    [useSupabase, fetchAllData]
  );

  /**
   * Handlers for Designers
   */
  const handleCreateDesigner = useCallback(
    async (designerData: Partial<Designer>) => {
      if (useSupabase) {
        try {
          setError(null);
          const created = await api.createDesigner(designerData);
          setDesigners(prev => [...prev, created]);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to create designer');
        }
      } else {
        const newDesigner = {
          id: `d${Date.now()}`,
          name: designerData.name || 'New Designer',
          avatar: designerData.avatar || '',
        } as Designer;
        setDesigners(prev => [...prev, newDesigner]);
      }
    },
    [useSupabase]
  );

  const handleUpdateDesigner = useCallback(
    async (id: string, updates: Partial<Designer>) => {
      if (useSupabase) {
        try {
          const updated = await api.updateDesigner(id, updates);
          setDesigners(prev => prev.map(d => d.id === id ? updated : d));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to update designer');
        }
      } else {
        setDesigners(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      }
    },
    [useSupabase]
  );

  const handleDeleteDesigner = useCallback(
    async (id: string) => {
      if (useSupabase) {
        try {
          await api.deleteDesigner(id);
          setDesigners(prev => prev.filter(d => d.id !== id));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete designer');
        }
      } else {
        setDesigners(prev => prev.filter(d => d.id !== id));
      }
    },
    [useSupabase]
  );

  /**
   * Handlers for Requesters
   */
  const handleCreateRequester = useCallback(
    async (name: string) => {
      if (useSupabase) {
        try {
          setError(null);
          const createdName = await api.createRequester(name);
          setRequesters(prev => {
            if (prev.includes(createdName)) return prev;
            return [...prev, createdName];
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to create requester');
        }
      } else {
        setRequesters(prev => prev.includes(name) ? prev : [...prev, name]);
      }
    },
    [useSupabase]
  );

  const handleDeleteRequester = useCallback(
    async (name: string) => {
      if (useSupabase) {
        try {
          await api.deleteRequester(name);
          setRequesters(prev => prev.filter(r => r !== name));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete requester');
        }
      } else {
        setRequesters(prev => prev.filter(r => r !== name));
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
    handleCreateSprint,
    handleUpdateSprint,
    handleDeleteSprint,
    handleRestoreSprint,
    handleDeleteTask,
    handleRestoreTask,
    handleCreateDesigner,
    handleUpdateDesigner,
    handleDeleteDesigner,
    handleCreateRequester,
    handleDeleteRequester,
  };
};