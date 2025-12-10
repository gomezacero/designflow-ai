import { supabase } from '@/lib/supabase';
import type { DesignerRow, DesignerInsert, DesignerUpdate } from '@/lib/database.types';
import type { Designer } from '@/models';

/**
 * Maps a database designer row to the app Designer model
 */
function mapDesignerRowToDesigner(row: DesignerRow): Designer {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar ?? '',
  };
}

/**
 * Maps app Designer to database insert payload
 */
function mapDesignerToInsert(designer: Partial<Designer>): DesignerInsert {
  return {
    name: designer.name ?? '',
    avatar: designer.avatar ?? null,
  };
}

/**
 * Fetches all designers from the database
 * @returns Array of designers
 */
export async function getDesigners(): Promise<Designer[]> {
  const { data, error } = await supabase
    .from('designers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch designers: ${error.message}`);
  }

  const rows = (data ?? []) as DesignerRow[];
  return rows.map(mapDesignerRowToDesigner);
}

/**
 * Fetches a single designer by ID
 * @param id - Designer ID
 * @returns Designer or null if not found
 */
export async function getDesignerById(id: string): Promise<Designer | null> {
  const { data, error } = await supabase
    .from('designers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch designer: ${error.message}`);
  }

  return data ? mapDesignerRowToDesigner(data as DesignerRow) : null;
}

/**
 * Creates a new designer
 * @param designer - Designer data
 * @returns Created designer
 */
export async function createDesigner(designer: Partial<Designer>): Promise<Designer> {
  const insertData = mapDesignerToInsert(designer);

  const { data, error } = await supabase
    .from('designers')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create designer: ${error.message}`);
  }

  return mapDesignerRowToDesigner(data as DesignerRow);
}

/**
 * Updates an existing designer
 * @param id - Designer ID
 * @param updates - Fields to update
 * @returns Updated designer
 */
export async function updateDesigner(id: string, updates: Partial<Designer>): Promise<Designer> {
  const updateData: DesignerUpdate = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;

  const { data, error } = await supabase
    .from('designers')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update designer: ${error.message}`);
  }

  return mapDesignerRowToDesigner(data as DesignerRow);
}

/**
 * Deletes a designer
 * @param id - Designer ID
 */
export async function deleteDesigner(id: string): Promise<void> {
  const { error } = await supabase
    .from('designers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete designer: ${error.message}`);
  }
}
