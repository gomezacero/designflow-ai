import { supabase } from '@/lib/supabase';
import type { TaskRow, TaskInsert, TaskUpdate, DesignerRow } from '@/lib/database.types';
import type { Task, Designer, TaskType, Priority, Status } from '@/models';
import { withRetry } from '@/utils/retryHelper';

/** Task with joined designer */
type TaskWithDesignerJoin = TaskRow & { designer: DesignerRow | null };

/**
 * Maps a database task row to the app Task model
 */
function mapTaskRowToTask(row: TaskWithDesignerJoin): Task {
  return {
    id: row.id,
    title: row.title,
    type: row.type as TaskType,
    priority: row.priority as Priority,
    status: row.status as Status,
    points: row.points,
    description: row.description ?? undefined,
    requester: row.requester,
    manager: row.manager ?? '',
    designer: row.designer ? mapDesignerRowToDesigner(row.designer) : undefined,
    requestDate: row.request_date,
    dueDate: row.due_date ?? '',
    sprint: row.sprint ?? '',
    referenceImages: row.reference_images,
    referenceLinks: row.reference_links,
    deliveryLink: row.delivery_link ?? undefined,
    completionDate: row.completion_date ?? undefined,
  };
}

/**
 * Maps a designer row to Designer model
 */
function mapDesignerRowToDesigner(row: DesignerRow): Designer {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar ?? '',
  };
}

/**
 * Maps app Task to database insert payload
 */
function mapTaskToInsert(task: Partial<Task>): TaskInsert {
  return {
    title: task.title ?? '',
    type: task.type ?? 'Other',
    priority: task.priority ?? 'Normal',
    status: task.status ?? 'To Do',
    points: task.points ?? 1,
    description: task.description ?? null,
    requester: task.requester ?? '',
    manager: task.manager ?? null,
    designer_id: task.designer?.id ?? null,
    request_date: task.requestDate ?? new Date().toISOString().split('T')[0],
    due_date: task.dueDate ?? null,
    sprint: task.sprint ?? null,
    reference_images: task.referenceImages ?? [],
    reference_links: task.referenceLinks ?? [],
    delivery_link: task.deliveryLink ?? null,
    completion_date: task.completionDate ?? null,
  };
}

/**
 * Fetches all active tasks from the database
 * @returns Array of tasks with designer data
 */
export async function getTasks(): Promise<Task[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, designer:designers(id, name, avatar)') // Only essential fields
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(200); // Reduced limit to prevent timeout

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    const rows = (data ?? []) as TaskWithDesignerJoin[];
    return rows.map(mapTaskRowToTask);
  });
}

/**
 * Fetches deleted tasks from the database (last 90 days only for performance)
 */
export async function getDeletedTasks(): Promise<Task[]> {
  return withRetry(async () => {
    // Only fetch deleted tasks from the last 90 days to prevent timeout
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data, error } = await supabase
      .from('tasks')
      .select('*, designer:designers(id, name, avatar)')
      .eq('is_deleted', true)
      .gte('deleted_at', ninetyDaysAgo.toISOString())
      .order('deleted_at', { ascending: false })
      .limit(50); // Reduced limit for deleted tasks

    if (error) {
      throw new Error(`Failed to fetch deleted tasks: ${error.message}`);
    }

    const rows = (data ?? []) as TaskWithDesignerJoin[];
    return rows.map(mapTaskRowToTask);
  });
}

/**
 * Fetches a single task by ID
 * @param id - Task ID
 * @returns Task or null if not found
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, designer:designers(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch task: ${error.message}`);
  }

  return data ? mapTaskRowToTask(data as TaskWithDesignerJoin) : null;
}

/**
 * Creates a new task
 * @param task - Partial task data
 * @returns Created task
 */
export async function createTask(task: Partial<Task>): Promise<Task> {
  const insertData = mapTaskToInsert(task);

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertData as never)
    .select('*, designer:designers(*)')
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return mapTaskRowToTask(data as TaskWithDesignerJoin);
}

/**
 * Updates an existing task
 * @param id - Task ID
 * @param updates - Fields to update
 * @returns Updated task
 */
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const updateData: TaskUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.points !== undefined) updateData.points = updates.points;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.requester !== undefined) updateData.requester = updates.requester;
  if (updates.manager !== undefined) updateData.manager = updates.manager;
  if (updates.designer !== undefined) updateData.designer_id = updates.designer?.id ?? null;
  if (updates.requestDate !== undefined) updateData.request_date = updates.requestDate;
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
  if (updates.sprint !== undefined) updateData.sprint = updates.sprint;
  if (updates.referenceImages !== undefined) updateData.reference_images = updates.referenceImages;
  if (updates.referenceLinks !== undefined) updateData.reference_links = updates.referenceLinks;
  if (updates.deliveryLink !== undefined) updateData.delivery_link = updates.deliveryLink;
  if (updates.completionDate !== undefined) updateData.completion_date = updates.completionDate;

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData as never)
    .eq('id', id)
    .select('*, designer:designers(*)')
    .single();

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return mapTaskRowToTask(data as TaskWithDesignerJoin);
}

/**
 * Soft deletes a task
 * @param id - Task ID
 * @param userId - User ID performing the deletion
 */
export async function softDeleteTask(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: userId
    } as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}

/**
 * Restores a soft-deleted task
 * @param id - Task ID
 */
export async function restoreTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null
    } as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to restore task: ${error.message}`);
  }
}

/**
 * Permanently deletes a task (Admin only)
 * @param id - Task ID
 */
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}
