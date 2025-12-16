
export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export enum Priority {
  NORMAL = 'Normal',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum TaskType {
  SEARCH_ARB = 'Search Arbitrage',
  BRANDING = 'Branding',
  SOCIAL = 'Social Media',
  OTHER = 'Other'
}

export interface Designer {
  id: string;
  name: string;
  avatar: string;
}

export interface Requester {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  priority: Priority;
  status: Status;
  points: number;

  // New/Updated Fields
  requester: string;          // Quien requiere
  manager: string;            // Manager responsable
  designer?: Designer;        // Quien elabora
  description?: string;
  requestDate: string;        // Fecha Solicitud
  dueDate: string;            // Fecha entrega estimada
  sprint: string;             // Sprint identifier
  referenceImages: string[];  // Base64 or URLs for images
  referenceLinks: string[];   // URLs for links

  // Delivery Fields
  deliveryLink?: string;      // Link de entrega final
  completionDate?: string;    // Fecha real de entrega

  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

// Result structure from Gemini
export interface MagicBriefResult {
  title: string;
  requester: string;
  description: string;
  sprintPoints: number;
  sprint: string;
  type: TaskType;
  priority: Priority;
  referenceLinks?: string[];
}
