// Shared types voor klat frontend en backend

// Database models
export interface Note {
  id: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  content: string; // Markdown content
  deadline?: string; // Optional deadline ISO 8601 datetime string
  completedAt?: string; // Optional completion timestamp ISO 8601 datetime string
  importance?: 'LOW' | 'MEDIUM' | 'HIGH'; // Optional importance level
  tags: Tag[];
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

export interface Tag {
  id: string;
  name: string;
  color?: string; // Hex color code (e.g., #FF5733)
  createdAt: string; // ISO 8601 datetime string
}

// DTOs (Data Transfer Objects)
export interface CreateNoteDto {
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  content: string; // Markdown content
  deadline?: string; // Optional deadline ISO 8601 datetime string
  completedAt?: string; // Optional completion timestamp ISO 8601 datetime string
  importance?: 'LOW' | 'MEDIUM' | 'HIGH';
  tagIds?: string[]; // Array of tag IDs to associate with the note
}

export interface UpdateNoteDto {
  content?: string; // Markdown content
  deadline?: string; // Optional deadline ISO 8601 datetime string
  completedAt?: string; // Optional completion timestamp ISO 8601 datetime string
  importance?: 'LOW' | 'MEDIUM' | 'HIGH';
  tagIds?: string[]; // Array of tag IDs to associate with the note
}

export interface CreateTagDto {
  name: string;
  color?: string; // Hex color code
}

export interface UpdateTagDto {
  name?: string;
  color?: string; // Hex color code
}

// Search
export interface SearchQuery {
  query: string; // Search text
  tags?: string[]; // Filter by tag IDs
  startDate?: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
}

export interface SearchResult {
  note: Note;
  snippet: string; // Text snippet showing search match context
  highlights: string[]; // Matched search terms
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

// Calendar types
export interface CalendarDay {
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  hasNote: boolean;
  tags: Tag[];
}

export interface MonthData {
  year: number;
  month: number; // 1-12
  days: CalendarDay[];
}
