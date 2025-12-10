import { Status, Priority } from '../models';

/**
 * Returns Tailwind classes for status badge colors
 */
export const getStatusColor = (status: Status): string => {
  switch (status) {
    case Status.DONE:
      return 'bg-green-100 text-green-800';
    case Status.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case Status.REVIEW:
      return 'bg-purple-100 text-purple-800';
    case Status.TODO:
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Returns numeric weight for priority sorting (higher = more important)
 */
export const getPriorityWeight = (priority: Priority): number => {
  switch (priority) {
    case Priority.CRITICAL:
      return 3;
    case Priority.HIGH:
      return 2;
    case Priority.NORMAL:
      return 1;
    default:
      return 0;
  }
};

/**
 * Returns Tailwind classes for priority badge colors
 */
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.CRITICAL:
      return 'bg-red-100 text-red-700';
    case Priority.HIGH:
      return 'bg-orange-100 text-orange-700';
    case Priority.NORMAL:
    default:
      return 'bg-gray-100 text-gray-600';
  }
};
