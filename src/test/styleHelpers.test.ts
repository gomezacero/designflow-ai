import { describe, it, expect } from 'vitest';
import { getStatusColor, getPriorityWeight, getPriorityColor } from '../utils/styleHelpers';
import { Status, Priority } from '../models';

describe('styleHelpers', () => {
  describe('getStatusColor', () => {
    it('returns green classes for DONE status', () => {
      const result = getStatusColor(Status.DONE);
      expect(result).toContain('green');
    });

    it('returns blue classes for IN_PROGRESS status', () => {
      const result = getStatusColor(Status.IN_PROGRESS);
      expect(result).toContain('blue');
    });

    it('returns purple classes for REVIEW status', () => {
      const result = getStatusColor(Status.REVIEW);
      expect(result).toContain('purple');
    });

    it('returns gray classes for TODO status', () => {
      const result = getStatusColor(Status.TODO);
      expect(result).toContain('gray');
    });
  });

  describe('getPriorityWeight', () => {
    it('returns 3 for CRITICAL priority', () => {
      expect(getPriorityWeight(Priority.CRITICAL)).toBe(3);
    });

    it('returns 2 for HIGH priority', () => {
      expect(getPriorityWeight(Priority.HIGH)).toBe(2);
    });

    it('returns 1 for NORMAL priority', () => {
      expect(getPriorityWeight(Priority.NORMAL)).toBe(1);
    });
  });

  describe('getPriorityColor', () => {
    it('returns red classes for CRITICAL priority', () => {
      const result = getPriorityColor(Priority.CRITICAL);
      expect(result).toContain('red');
    });

    it('returns orange classes for HIGH priority', () => {
      const result = getPriorityColor(Priority.HIGH);
      expect(result).toContain('orange');
    });

    it('returns gray classes for NORMAL priority', () => {
      const result = getPriorityColor(Priority.NORMAL);
      expect(result).toContain('gray');
    });
  });
});
