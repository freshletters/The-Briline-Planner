
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  time?: string;
  date: string; // ISO format
}

export type ViewType = 'monthly' | 'daily';

export interface InkData {
  date: string;
  dataUrl: string; // Base64 representation of the canvas
}

export interface PlannerState {
  currentDate: Date;
  view: ViewType;
  tasks: Task[];
  ink: InkData[];
}
