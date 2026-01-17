import api from './api';
import type { Note, CreateNoteDto, UpdateNoteDto } from '@klat/types';

export const noteApi = {
  // Get note by ID
  getNoteById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/id/${id}`);
    return response.data.data;
  },

  // Get notes by date (returns array - multiple notes per day allowed)
  getNoteByDate: async (date: string): Promise<Note[]> => {
    const response = await api.get(`/notes/${date}`);
    return response.data.data;
  },

  // Get notes for a month
  getNotesByMonth: async (yearMonth: string): Promise<Note[]> => {
    const response = await api.get(`/notes?month=${yearMonth}`);
    return response.data.data;
  },

  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data.data;
  },

  // Create note
  createNote: async (data: CreateNoteDto): Promise<Note> => {
    const response = await api.post('/notes', data);
    return response.data.data;
  },

  // Update note
  updateNote: async (id: string, data: UpdateNoteDto): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data.data;
  },

  // Delete note
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  // Delete all completed notes
  deleteCompletedNotes: async (): Promise<{ message: string; deletedCount: number }> => {
    const response = await api.delete('/notes/completed/all');
    return response.data;
  },
};
