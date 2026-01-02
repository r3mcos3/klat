import api from './api';
import type { Note, CreateNoteDto, UpdateNoteDto } from '@klat/types';

export const noteApi = {
  // Get note by date
  getNoteByDate: async (date: string): Promise<Note> => {
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
};
