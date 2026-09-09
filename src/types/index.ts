/** P0 = most urgent, P2 = least urgent. */
export type Priority = 'P0' | 'P1' | 'P2';
export type Category = 'work' | 'learning' | 'personal' | 'other';
export type Theme = 'dark' | 'light' | 'auto';
export type TaskView = 'list' | 'grid';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  /** Tailwind color name, e.g. "blue", "violet". */
  color: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: string;
  /** Rich text HTML produced by the Tiptap editor. */
  description: string;
  subtasks: Subtask[];
  /** "YYYY-MM-DD", optional. */
  deadline?: string;
  projectId?: string;
}

export interface DailyData {
  date: string;
  focus: string;
  tasks: Task[];
}

/** All daily data keyed by "YYYY-MM-DD". */
export type AllDailyData = Record<string, DailyData>;

export interface Settings {
  name: string;
  theme: Theme;
  backgroundImage?: string;
  backgroundOverlay: number; // 0-80 (%)
  glassBlur: number; // px
  glassOpacity: number; // 4-40 (%)
  carryOverTasks: boolean;
  showGreeting: boolean;
  showProgress: boolean;
  taskView: TaskView;
}

/** Bookkeeping that isn't part of the user-facing data model. */
export interface Meta {
  carryOverHandledDate?: string;
}

export interface BackupData {
  app: 'daily-command';
  version: 1;
  exportedAt: string;
  settings: Settings;
  dailyData: AllDailyData;
  projects?: Project[];
  notes?: Note[];
}
