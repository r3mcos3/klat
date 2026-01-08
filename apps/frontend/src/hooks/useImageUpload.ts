import { useMutation, useQueryClient } from '@tanstack/react-query';
import { imageApi } from '@/services/imageApi';
import { noteKeys } from './useNotes';

export const useImageUpload = (noteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => imageApi.uploadImages(noteId, files),
    onSuccess: () => {
      // Invalidate note queries to refresh the note with new images
      queryClient.invalidateQueries({ queryKey: noteKeys.byId(noteId) });
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
};

export const useImageDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imagePath: string) => imageApi.deleteImage(imagePath),
    onSuccess: () => {
      // Invalidate all note queries
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
};
