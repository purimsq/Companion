export interface User {
  id: number;
  username: string;
  name: string;
  pace: number;
  createdAt: string;
}

export interface Unit {
  id: number;
  name: string;
  description?: string;
  color: string;
  userId: number;
  createdAt: string;
  documentsCount?: number;
  notesCount?: number;
  completedTopics?: number;
  totalTopics?: number;
  progressPercentage?: number;
  lastStudied?: string;
}

export interface Document {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText?: string;
  unitId: number;
  userId: number;
  createdAt: string;
}

export interface Note {
  id: number;
  content: string;
  documentId?: number;
  unitId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  id: number;
  content: string;
  approved: boolean;
  documentId?: number;
  unitId?: number;
  userId: number;
  createdAt: string;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  type: "assignment" | "cat";
  questions?: string;
  deadline: string;
  unitId?: number;
  userId: number;
  completed: boolean;
  createdAt: string;
  daysUntilDue?: number;
  urgency?: "high" | "medium" | "low";
}

export interface StudyPlanEntry {
  id: number;
  title: string;
  description?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  unitId?: number;
  documentId?: number;
  userId: number;
  completed: boolean;
  createdAt: string;
}

export interface StudySession {
  id: number;
  date: string;
  minutesStudied: number;
  topicsCompleted: number;
  userId: number;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  role: "user" | "assistant";
  userId: number;
  createdAt: string;
}

export interface DashboardData {
  user: User;
  todaysProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  studyStreak: number;
  nextSession?: StudyPlanEntry;
  upcomingAssignments: Assignment[];
}
