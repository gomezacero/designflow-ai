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
 * Formats a date string to M/D format for chart labels
 */
export const formatDateKey = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export const formatToISODate = (date: Date): string => {
  return date.toISOString().split('T')[0] ?? '';
};
