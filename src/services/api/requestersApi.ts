import { supabase } from '@/lib/supabase';
import type { RequesterRow, RequesterInsert, RequesterUpdate } from '@/lib/database.types';
import type { Requester } from '@/models';

/**
 * Maps a database requester row to the app Requester model
 */
function mapRequesterRowToRequester(row: RequesterRow): Requester {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar ?? undefined,
    bio: row.bio ?? undefined,
    email: row.email ?? undefined,
  };
}

/**
 * Fetches all requesters from the database (names only - legacy)
 * @returns Array of requester names
 */
export async function getRequesterNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from('requesters')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch requesters: ${error.message}`);
  }

  const rows = (data ?? []) as { name: string }[];
  return rows.map((row) => row.name);
}

/**
 * Fetches all requesters with full data
 * @returns Array of requester objects
 */
export async function getRequesters(): Promise<Requester[]> {
  const { data, error } = await supabase
    .from('requesters')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch requesters: ${error.message}`);
  }

  const rows = (data ?? []) as RequesterRow[];
  return rows.map(mapRequesterRowToRequester);
}

/**
 * Creates a new requester
 * @param requesterData - Requester data
 * @returns Created requester
 */
export async function createRequester(requesterData: Partial<Requester>): Promise<Requester> {
  const insertData: RequesterInsert = {
    name: requesterData.name ?? '',
    avatar: requesterData.avatar ?? null,
    bio: requesterData.bio ?? null,
    email: requesterData.email ?? null,
  };

  const { data, error } = await supabase
    .from('requesters')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    // If it's a unique constraint violation, fetch the existing one
    if (error.code === '23505') {
      const existing = await supabase
        .from('requesters')
        .select('*')
        .eq('name', requesterData.name ?? '')
        .single();
      if (existing.data) {
        return mapRequesterRowToRequester(existing.data as RequesterRow);
      }
    }
    throw new Error(`Failed to create requester: ${error.message}`);
  }

  return mapRequesterRowToRequester(data as RequesterRow);
}

/**
 * Updates a requester by ID
 * @param id - Requester ID
 * @param updates - Fields to update
 * @returns Updated requester
 */
export async function updateRequester(id: string, updates: Partial<Requester>): Promise<Requester> {
  const updateData: RequesterUpdate = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.email !== undefined) updateData.email = updates.email;

  const { data, error } = await supabase
    .from('requesters')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update requester: ${error.message}`);
  }

  return mapRequesterRowToRequester(data as RequesterRow);
}

/**
 * Deletes a requester by name
 * @param name - Requester name
 */
export async function deleteRequester(name: string): Promise<void> {
  const { error } = await supabase
    .from('requesters')
    .delete()
    .eq('name', name);

  if (error) {
    throw new Error(`Failed to delete requester: ${error.message}`);
  }
}
