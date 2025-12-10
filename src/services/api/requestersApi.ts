import { supabase } from '@/lib/supabase';
import type { RequesterRow, RequesterInsert } from '@/lib/database.types';

/**
 * Requester model (simple name-based)
 */
export interface Requester {
  id: string;
  name: string;
}

/**
 * Maps a database requester row to the app Requester model
 */
function mapRequesterRowToRequester(row: RequesterRow): Requester {
  return {
    id: row.id,
    name: row.name,
  };
}

/**
 * Fetches all requesters from the database
 * @returns Array of requester names
 */
export async function getRequesters(): Promise<string[]> {
  const { data, error } = await supabase
    .from('requesters')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch requesters: ${error.message}`);
  }

  const rows = (data ?? []) as RequesterRow[];
  return rows.map((row) => row.name);
}

/**
 * Fetches all requesters with full data
 * @returns Array of requester objects
 */
export async function getRequestersFull(): Promise<Requester[]> {
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
 * @param name - Requester name
 * @returns Created requester name
 */
export async function createRequester(name: string): Promise<string> {
  const insertData: RequesterInsert = { name };

  const { data, error } = await supabase
    .from('requesters')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    // If it's a unique constraint violation, the requester already exists
    if (error.code === '23505') {
      return name;
    }
    throw new Error(`Failed to create requester: ${error.message}`);
  }

  return (data as RequesterRow).name;
}

/**
 * Creates multiple requesters at once
 * @param names - Array of requester names
 * @returns Array of created/existing requester names
 */
export async function createRequesters(names: string[]): Promise<string[]> {
  const uniqueNames = [...new Set(names.filter((n) => n.trim()))];

  if (uniqueNames.length === 0) return [];

  const insertData = uniqueNames.map((name) => ({ name }));

  const { error } = await supabase
    .from('requesters')
    .upsert(insertData as never, { onConflict: 'name', ignoreDuplicates: true });

  if (error) {
    throw new Error(`Failed to create requesters: ${error.message}`);
  }

  return uniqueNames;
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
