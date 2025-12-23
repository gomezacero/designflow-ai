import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Task, Status, Priority, TaskType, Designer, Sprint, Requester } from '../models';
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
  deletedTasks: Task[];
  designers: Designer[];
  requesters: Requester[];
  sprints: Sprint[];
  deletedSprints: Sprint[];
  activeSprint: string;

  // Loading & Error states
  isLoading: boolean;
  error: string | null;

  // Setters
  setDesigners: React.Dispatch<React.SetStateAction<Designer[]>>;
  setRequesters: React.Dispatch<React.SetStateAction<Requester[]>>;
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

  handleCreateRequester: (requester: Partial<Requester>) => Promise<void>;
  handleUpdateRequester: (id: string, updates: Partial<Requester>) => Promise<void>;
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
  const useSupabase = isSupabaseConfigured();

  // Initialize with empty arrays when using Supabase (real data will be fetched)
  // Use mock data only when Supabase is not configured (local dev fallback)
  const [tasks, setTasks] = useState<Task[]>(useSupabase ? [] : INITIAL_TASKS);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [designers, setDesigners] = useState<Designer[]>(useSupabase ? [] : INITIAL_DESIGNERS);
  const [requesters, setRequesters] = useState<Requester[]>(useSupabase ? [] : INITIAL_REQUESTERS.map((name, i) => ({ id: `r${i}`, name })));
  const [sprints, setSprints] = useState<Sprint[]>(useSupabase ? [] : INITIAL_SPRINTS);
  const [deletedSprints, setDeletedSprints] = useState<Sprint[]>([]);
  // Start loading if using Supabase (waiting for real data)
  const [isLoading, setIsLoading] = useState(useSupabase);
  const [error, setError] = useState<string | null>(null);

  const activeSprint = useMemo(
    () => sprints.find(s => s.isActive)?.name || 'Backlog',
    [sprints]
  );

  /**
   * Fetches all data from Supabase in a staged approach to avoid rate limits
   * Phase 1: Critical data (tasks, designers, sprints) - needed for dashboard
   * Phase 2: Secondary data (deleted items, requesters) - can load after
   */
  const fetchAllData = useCallback(async () => {
    if (!useSupabase) return;

    setIsLoading(true);
    setError(null);

    let criticalDataLoaded = false;

    try {
      // Phase 1: Fetch critical data first (required for dashboard)
      // Using smaller parallel batches to avoid rate limits
      console.log('[Data] Phase 1: Fetching critical data...');

      const [tasksData, designersData, sprintsData] = await Promise.all([
        api.getTasks(),
        api.getDesigners(),
        api.getSprints(),
      ]);

      // Update UI immediately with critical data
      setTasks(tasksData);
      setDesigners(designersData);
      setSprints(sprintsData);
      criticalDataLoaded = true;

      console.log(`[Data] Phase 1 complete: ${tasksData.length} tasks, ${designersData.length} designers, ${sprintsData.length} sprints`);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch critical data';
      setError(message);
      console.error('[Data] Phase 1 error:', err);
      setIsLoading(false);
      return; // Don't proceed to phase 2 if critical data failed
    }

    // Phase 2: Fetch secondary data (non-blocking for main UI)
    try {
      // Small delay to space out requests
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('[Data] Phase 2: Fetching secondary data...');

      const [deletedTasksData, requestersData, deletedSprintsData] = await Promise.all([
        api.getDeletedTasks(),
        api.getRequesters(),
        api.getDeletedSprints(),
      ]);

      setDeletedTasks(deletedTasksData);
      setRequesters(requestersData);
      setDeletedSprints(deletedSprintsData);

      console.log('[Data] Phase 2 complete');

    } catch (err) {
      // Phase 2 errors are non-critical, just log them
      console.warn('[Data] Phase 2 error (non-critical):', err);
      // Don't set error state since critical data loaded successfully
    } finally {
      setIsLoading(false);
    }
  }, [useSupabase]);

  // Ref to prevent double-fetch in React StrictMode
  const hasFetchedRef = useRef(false);

  /**
   * Initial data fetch on mount AND Realtime Subscription
   * Only runs ONCE on mount (protected by ref)
   */
  useEffect(() => {
    // Prevent double-fetch in StrictMode or re-renders
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchAllData();

    if (!useSupabase) return;

    // REALTIME SUBSCRIPTION (only for designer updates - minimal overhead)
    const channel = supabase
      .channel('app-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'designers' },
        (payload) => {
          const updatedDesigner = payload.new as any;

          const designerModel: Designer = {
            id: updatedDesigner.id,
            name: updatedDesigner.name,
            avatar: updatedDesigner.avatar || ''
          };

          // Update local state (no DB call needed)
          setDesigners(prev => prev.map(d => d.id === designerModel.id ? designerModel : d));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

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
          setSprints(prev => {
            const sprintToDelete = prev.find(s => s.id === id);
            if (sprintToDelete) {
              setDeletedSprints(curr => [sprintToDelete, ...curr]);
            }
            return prev.filter(s => s.id !== id);
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete sprint';
          setError(message);
          console.error('Error deleting sprint:', err);
        }
      } else {
        setSprints(prev => {
          const sprintToDelete = prev.find(s => s.id === id);
          if (sprintToDelete) {
            setDeletedSprints(curr => [{ ...sprintToDelete, isDeleted: true }, ...curr]);
          }
          return prev.filter(s => s.id !== id);
        });
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
          // Optimistic update
          setDeletedSprints(prev => {
            const restored = prev.find(s => s.id === id);
            if (restored) {
              setSprints(curr => [restored, ...curr]);
            }
            return prev.filter(s => s.id !== id);
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to restore sprint';
          setError(message);
        }
      } else {
        setDeletedSprints(prev => {
          const restored = prev.find(s => s.id === id);
          if (restored) {
            setSprints(curr => [{ ...restored, isDeleted: false }, ...curr]);
          }
          return prev.filter(s => s.id !== id);
        });
      }
    },
    [useSupabase]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string, userId: string) => {
      if (useSupabase) {
        try {
          setError(null);
          await api.softDeleteTask(taskId, userId);
          setTasks(prev => {
            const taskToDelete = prev.find(t => t.id === taskId);
            if (taskToDelete) {
              setDeletedTasks(curr => [taskToDelete, ...curr]);
            }
            return prev.filter(t => t.id !== taskId);
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete task';
          setError(message);
        }
      } else {
        setTasks(prev => {
          const taskToDelete = prev.find(t => t.id === taskId);
          if (taskToDelete) {
            setDeletedTasks(curr => [{ ...taskToDelete, isDeleted: true }, ...curr]);
          }
          return prev.filter(t => t.id !== taskId);
        });
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
          setDeletedTasks(prev => {
            const restored = prev.find(t => t.id === taskId);
            if (restored) {
              setTasks(curr => [restored, ...curr]);
            }
            return prev.filter(t => t.id !== taskId);
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to restore task';
          setError(message);
        }
      } else {
        setDeletedTasks(prev => {
          const restored = prev.find(t => t.id === taskId);
          if (restored) {
            setTasks(curr => [{ ...restored, isDeleted: false }, ...curr]);
          }
          return prev.filter(t => t.id !== taskId);
        });
      }
    },
    [useSupabase]
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
    async (requesterData: Partial<Requester>) => {
      if (useSupabase) {
        try {
          setError(null);
          const created = await api.createRequester(requesterData);
          setRequesters(prev => {
            if (prev.some(r => r.name === created.name)) return prev;
            return [...prev, created];
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to create requester');
        }
      } else {
        const newRequester: Requester = {
          id: `r${Date.now()}`,
          name: requesterData.name || '',
          avatar: requesterData.avatar,
          bio: requesterData.bio,
          email: requesterData.email,
        };
        setRequesters(prev => prev.some(r => r.name === newRequester.name) ? prev : [...prev, newRequester]);
      }
    },
    [useSupabase]
  );

  const handleUpdateRequester = useCallback(
    async (id: string, updates: Partial<Requester>) => {
      if (useSupabase) {
        try {
          setError(null);
          const updated = await api.updateRequester(id, updates);
          setRequesters(prev => prev.map(r => r.id === id ? updated : r));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to update requester');
        }
      } else {
        setRequesters(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      }
    },
    [useSupabase]
  );

  const handleDeleteRequester = useCallback(
    async (name: string) => {
      if (useSupabase) {
        try {
          await api.deleteRequester(name);
          setRequesters(prev => prev.filter(r => r.name !== name));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete requester');
        }
      } else {
        setRequesters(prev => prev.filter(r => r.name !== name));
      }
    },
    [useSupabase]
  );

  return {
    tasks,
    deletedTasks,
    designers,
    requesters,
    sprints,
    deletedSprints,
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
    handleUpdateRequester,
    handleDeleteRequester,
  };
};