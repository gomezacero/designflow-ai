import React from 'react';

/**
 * Opens the native date picker on supported browsers
 * Falls back silently on unsupported browsers
 */
export const openDatePicker = (e: React.MouseEvent<HTMLInputElement>): void => {
  try {
    e.currentTarget.showPicker();
  } catch {
    // Fallback for browsers that don't support showPicker
  }
};

/**
 * Returns a Date object set to N days in the past at midnight
 */
export const getDaysInPast = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Formats an ISO date string (YYYY-MM-DD) to display format (M/D)
 * Uses string parsing to avoid timezone conversion issues
 * @param isoDate - Date in YYYY-MM-DD format or full ISO timestamp
 * @returns Formatted date as M/D (e.g., "12/15")
 */
export const formatDateKey = (isoDate: string): string => {
  // Extract date portion only (handles both YYYY-MM-DD and full ISO timestamps)
  const dateOnly = isoDate.split('T')[0] ?? isoDate; // "2025-12-15"
  const parts = dateOnly.split('-');
  const month = parts[1] ?? '1';
  const day = parts[2] ?? '1';

  // Parse as integers to remove leading zeros
  const monthNum = parseInt(month, 10); // 12
  const dayNum = parseInt(day, 10); // 15

  return `${monthNum}/${dayNum}`; // "12/15"
};

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export const formatToISODate = (date: Date): string => {
  return date.toISOString().split('T')[0] ?? '';
};
