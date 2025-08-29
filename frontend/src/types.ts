export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD";
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: string;
  createdAt: string;
  taskCount: number;
  completedTasks: number;
  completionRate: number;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
  createdAt: string;
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: string;
}

// Form interfaces for validation
export interface OrganizationFormData {
  name: string;
  slug: string;
  contactEmail: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface CommentFormData {
  content: string;
  authorEmail: string;
}

// API Response interfaces
export interface ApiError {
  message: string;
  extensions?: {
    code: string;
    [key: string]: any;
  };
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: ApiError[];
}
