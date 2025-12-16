/**
 * Database types for Supabase tables
 * These types match the SQL schema defined for the project
 */

/** Task type enum values */
export type TaskTypeDB = 'Search Arbitrage' | 'Branding' | 'Social Media' | 'Other';

/** Task priority enum values */
export type TaskPriorityDB = 'Normal' | 'High' | 'Critical';

/** Task status enum values */
export type TaskStatusDB = 'To Do' | 'In Progress' | 'Review' | 'Done';

export interface Database {
  public: {
    Tables: {
      designers: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          email: string | null;
          user_id: string | null;
          theme: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar?: string | null;
          email?: string | null;
          user_id?: string | null;
          theme?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string | null;
          email?: string | null;
          user_id?: string | null;
          theme?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sprints: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;

          is_deleted: boolean;
          deleted_at: string | null;
          deleted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Relationships: [];
      };
      requesters: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          bio: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar?: string | null;
          bio?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string | null;
          bio?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          type: TaskTypeDB;
          priority: TaskPriorityDB;
          status: TaskStatusDB;
          points: number;
          description: string | null;
          requester: string;
          manager: string | null;
          designer_id: string | null;
          request_date: string;
          due_date: string | null;
          sprint: string | null;
          reference_images: string[];
          reference_links: string[];
          delivery_link: string | null;
          completion_date: string | null;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          type: TaskTypeDB;
          priority: TaskPriorityDB;
          status: TaskStatusDB;
          points?: number;
          description?: string | null;
          requester: string;
          manager?: string | null;
          designer_id?: string | null;
          request_date?: string;
          due_date?: string | null;
          sprint?: string | null;
          reference_images?: string[];
          reference_links?: string[];
          delivery_link?: string | null;
          completion_date?: string | null;
          created_at?: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: TaskTypeDB;
          priority?: TaskPriorityDB;
          status?: TaskStatusDB;
          points?: number;
          description?: string | null;
          requester?: string;
          manager?: string | null;
          designer_id?: string | null;
          request_date?: string;
          due_date?: string | null;
          sprint?: string | null;
          reference_images?: string[];
          reference_links?: string[];
          delivery_link?: string | null;
          completion_date?: string | null;
          created_at?: string;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_designer_id_fkey';
            columns: ['designer_id'];
            isOneToOne: false;
            referencedRelation: 'designers';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Helper types for API usage */
export type DesignerRow = Database['public']['Tables']['designers']['Row'];
export type DesignerInsert = Database['public']['Tables']['designers']['Insert'];
export type DesignerUpdate = Database['public']['Tables']['designers']['Update'];

export type SprintRow = Database['public']['Tables']['sprints']['Row'];
export type SprintInsert = Database['public']['Tables']['sprints']['Insert'];
export type SprintUpdate = Database['public']['Tables']['sprints']['Update'];

export type RequesterRow = Database['public']['Tables']['requesters']['Row'];
export type RequesterInsert = Database['public']['Tables']['requesters']['Insert'];
export type RequesterUpdate = Database['public']['Tables']['requesters']['Update'];

export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

/** Task row with joined designer data */
export interface TaskWithDesigner extends TaskRow {
  designer: DesignerRow | null;
}
