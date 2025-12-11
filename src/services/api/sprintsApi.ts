import { supabase } from '@/lib/supabase';
import type { SprintRow, SprintInsert, SprintUpdate } from '@/lib/database.types';
import type { Sprint } from '@/models';

/**
 * Maps a database sprint row to the app Sprint model
 */
function mapSprintRowToSprint(row: SprintRow): Sprint {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
  };
}

/**
 * Maps app Sprint to database insert payload
 */
function mapSprintToInsert(sprint: Partial<Sprint>): SprintInsert {
  const today = new Date().toISOString().split('T')[0] ?? '';
  return {
    name: sprint.name ?? '',
    start_date: sprint.startDate ?? today,
    end_date: sprint.endDate ?? today,
    is_active: sprint.isActive ?? false,
  };
}

/**
 * Fetches all sprints from the database
 * @returns Array of sprints
 */
export async function getSprints(): Promise<Sprint[]> {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('is_deleted', false)
    .order('start_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch sprints: ${error.message}`);
  }

  const rows = (data ?? []) as SprintRow[];
  return rows.map(mapSprintRowToSprint);
}

/**
 * Fetches the active sprint
 * @returns Active sprint or null
 */
export async function getActiveSprint(): Promise<Sprint | null> {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch active sprint: ${error.message}`);
  }

  return data ? mapSprintRowToSprint(data as SprintRow) : null;
}

/**
 * Fetches a single sprint by ID
 * @param id - Sprint ID
 * @returns Sprint or null if not found
 */
export async function getSprintById(id: string): Promise<Sprint | null> {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch sprint: ${error.message}`);
  }

  return data ? mapSprintRowToSprint(data as SprintRow) : null;
}

/**
 * Creates a new sprint
 * @param sprint - Sprint data
 * @returns Created sprint
 */
export async function createSprint(sprint: Partial<Sprint>): Promise<Sprint> {
  const insertData = mapSprintToInsert(sprint);

  const { data, error } = await supabase
    .from('sprints')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create sprint: ${error.message}`);
  }

  return mapSprintRowToSprint(data as SprintRow);
}

/**
 * Updates an existing sprint
 * @param id - Sprint ID
 * @param updates - Fields to update
 * @returns Updated sprint
 */
export async function updateSprint(id: string, updates: Partial<Sprint>): Promise<Sprint> {
  const updateData: SprintUpdate = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('sprints')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update sprint: ${error.message}`);
  }

  return mapSprintRowToSprint(data as SprintRow);
}

/**
 * Sets a sprint as active (deactivates all others)
 * @param id - Sprint ID to activate
 * @returns Activated sprint
 */
export async function setActiveSprint(id: string): Promise<Sprint> {
  // First deactivate all sprints
  const { error: deactivateError } = await supabase
    .from('sprints')
    .update({ is_active: false } as never)
    .neq('id', id);

  if (deactivateError) {
    throw new Error(`Failed to deactivate sprints: ${deactivateError.message}`);
  }

  // Then activate the target sprint
  return updateSprint(id, { isActive: true });
}

/**
 * Soft deletes a sprint
 * @param id - Sprint ID
 * @param userId - User ID performing the deletion
 */
export async function softDeleteSprint(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('sprints')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: userId
    } as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete sprint: ${error.message}`);
  }
}

/**
 * Restores a soft-deleted sprint
 * @param id - Sprint ID
 */
export async function restoreSprint(id: string): Promise<void> {
  const { error } = await supabase
    .from('sprints')
    .update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null
    } as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to restore sprint: ${error.message}`);
  }
}

/**
 * Permanently deletes a sprint (Admin only)
 * @param id - Sprint ID
 */
export async function deleteSprint(id: string): Promise<void> {
  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete sprint: ${error.message}`);
  }
}
