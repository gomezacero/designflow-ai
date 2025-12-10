import { describe, it, expect } from 'vitest';
import { getDaysInPast, formatDateKey, formatToISODate } from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('getDaysInPast', () => {
    it('returns a date N days ago', () => {
      const result = getDaysInPast(7);
      const expected = new Date();
      expected.setDate(expected.getDate() - 7);
      expected.setHours(0, 0, 0, 0);

      expect(result.getTime()).toBe(expected.getTime());
    });

    it('returns today at midnight for 0 days', () => {
      const result = getDaysInPast(0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      expect(result.getTime()).toBe(today.getTime());
    });
  });

  describe('formatDateKey', () => {
    it('formats ISO date string to M/D format', () => {
      // Use ISO format with explicit local time to avoid timezone issues
      const date = new Date(2023, 11, 25); // December 25, 2023 (months are 0-indexed)
      const result = formatDateKey(date.toISOString());
      const expected = `${date.getMonth() + 1}/${date.getDate()}`;
      expect(result).toBe(expected);
    });

    it('returns consistent M/D format', () => {
      const today = new Date();
      const result = formatDateKey(today.toISOString());
      // Should return format like "M/D" (e.g., "12/25" or "1/5")
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}$/);
    });
  });

  describe('formatToISODate', () => {
    it('formats Date to YYYY-MM-DD string', () => {
      const date = new Date('2023-12-25T10:30:00');
      const result = formatToISODate(date);
      expect(result).toBe('2023-12-25');
    });
  });
});
