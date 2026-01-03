import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteApi } from '@/services/noteApi';
import type { Note, CreateNoteDto, UpdateNoteDto } from '@klat/types';

// Query keys
export const noteKeys = {
  all: ['notes'] as const,
  byId: (id: string) => [...noteKeys.all, 'id', id] as const,
  byDate: (date: string) => [...noteKeys.all, 'date', date] as const,
  byMonth: (yearMonth: string) => [...noteKeys.all, 'month', yearMonth] as const,
};

// Get note by ID
export const useNoteById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: noteKeys.byId(id),
    queryFn: () => noteApi.getNoteById(id),
    retry: false,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

// Get notes by date (returns array - multiple notes per day allowed)
export const useNotesByDate = (date: string) => {
  return useQuery({
    queryKey: noteKeys.byDate(date),
    queryFn: () => noteApi.getNoteByDate(date),
    retry: false,
    enabled: !!date,
  });
};

// Legacy hook for backward compatibility - returns first note or undefined
export const useNoteByDate = (date: string) => {
  const { data: notes, ...rest } = useNotesByDate(date);
  return {
    ...rest,
    data: notes?.[0],
  };
};

// Get notes by month
export const useNotesByMonth = (yearMonth: string) => {
  return useQuery({
    queryKey: noteKeys.byMonth(yearMonth),
    queryFn: () => noteApi.getNotesByMonth(yearMonth),
    enabled: !!yearMonth,
  });
};

// Get all notes
export const useAllNotes = () => {
  return useQuery({
    queryKey: noteKeys.all,
    queryFn: () => noteApi.getAllNotes(),
  });
};

// Create note mutation
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteDto) => noteApi.createNote(data),
    onSuccess: (newNote) => {
      // Invalidate all note queries
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.invalidateQueries({ queryKey: noteKeys.byDate(newNote.date) });
    },
  });
};

// Update note mutation
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
      noteApi.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      const previousNotes = queryClient.getQueryData<Note[]>(noteKeys.all);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          noteKeys.all,
          previousNotes.map((note) =>
            note.id === id ? { ...note, ...data } : note
          )
        );
      }

      return { previousNotes };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.all, context.previousNotes);
      }
    },
    onSuccess: (updatedNote) => {
      // Invalidate all note queries
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.invalidateQueries({ queryKey: noteKeys.byDate(updatedNote.date) });
    },
  });
};

// Delete note mutation
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.deleteNote(id),
    onSuccess: () => {
      // Invalidate all note queries
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
};
