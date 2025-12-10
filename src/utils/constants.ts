
import { Task, Status, Priority, TaskType, Designer, Sprint } from '../models';

export const INITIAL_DESIGNERS: Designer[] = [
  { id: '1', name: 'Mila', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mila' },
  { id: '2', name: 'Kathe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kathe' },
];

export const INITIAL_REQUESTERS = [
  'Milher',
  'Harry',
  'Jesus'
];

export const INITIAL_SPRINTS: Sprint[] = [
    { id: 's23', name: 'Sprint 23', startDate: '2023-10-13', endDate: '2023-10-19', isActive: false },
    { id: 's24', name: 'Sprint 24', startDate: '2023-10-20', endDate: '2023-10-26', isActive: true },
    { id: 's25', name: 'Sprint 25', startDate: '2023-10-27', endDate: '2023-11-02', isActive: false },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Seguro Auto Texas',
    type: TaskType.SEARCH_ARB,
    priority: Priority.HIGH,
    status: Status.IN_PROGRESS,
    points: 5,
    designer: INITIAL_DESIGNERS[0], // Mila
    requester: 'Milher',
    manager: 'Carlos M.',
    requestDate: '2023-10-20',
    dueDate: '2023-10-28',
    sprint: 'Sprint 24',
    description: 'High CTR focus for Texas demographic. Needs to emphasize "Low Rates" and include a call to action button that contrasts with the background.',
    referenceImages: [],
    referenceLinks: ['https://example.com/competitor1']
  },
  {
    id: 't2',
    title: 'Logotipo Agencia',
    type: TaskType.BRANDING,
    priority: Priority.NORMAL,
    status: Status.REVIEW,
    points: 3,
    designer: INITIAL_DESIGNERS[1], // Kathe
    requester: 'Harry',
    manager: 'Sarah Jenkins',
    requestDate: '2023-10-22',
    dueDate: '2023-11-01',
    sprint: 'Sprint 24',
    description: 'Minimalist rebrand exploration. Avoid gradients, stick to flat colors. Needs to look good in monochrome.',
    referenceImages: ['https://picsum.photos/200/300'],
    referenceLinks: []
  },
  {
    id: 't3',
    title: 'Skin Care Q4',
    type: TaskType.SOCIAL,
    priority: Priority.NORMAL,
    status: Status.DONE,
    points: 1,
    designer: INITIAL_DESIGNERS[0], // Mila
    requester: 'Jesus',
    manager: 'David Lee',
    requestDate: '2023-10-18',
    dueDate: '2023-10-25',
    sprint: 'Sprint 23',
    description: 'Holiday season promo assets. Warm tones, festive but not cheesy.',
    referenceImages: [],
    referenceLinks: []
  },
  {
    id: 't4',
    title: 'Landing Page Hero',
    type: TaskType.SEARCH_ARB,
    priority: Priority.NORMAL,
    status: Status.TODO,
    points: 2,
    requester: 'Milher',
    manager: 'Carlos M.',
    requestDate: '2023-10-27',
    dueDate: '2023-10-30',
    sprint: 'Sprint 25',
    description: 'Unassigned task waiting for pickup. Focus on conversion above the fold.',
    referenceImages: [],
    referenceLinks: []
  }
];

export const MOCK_GENERATED_BRIEF = {
  title: "Crypto Wallet Q4 Push",
  requester: "Harry",
  description: "Create a high-converting landing page header for the new crypto wallet feature. Needs to feel secure but modern.",
  sprintPoints: 3,
  sprint: "Sprint 25",
  referenceLinks: ["https://competitor.com", "https://design-trend.com"],
  type: TaskType.SEARCH_ARB,
  priority: Priority.HIGH
};
