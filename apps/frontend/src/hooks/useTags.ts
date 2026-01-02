import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '@/services/tagApi';
import type { Tag, CreateTagDto, UpdateTagDto } from '@klat/types';

// Query keys
export const tagKeys = {
  all: ['tags'] as const,
  byId: (id: string) => [...tagKeys.all, id] as const,
};

// Get all tags
export const useAllTags = () => {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: () => tagApi.getAllTags(),
  });
};

// Get tag by ID
export const useTagById = (id: string) => {
  return useQuery({
    queryKey: tagKeys.byId(id),
    queryFn: () => tagApi.getTagById(id),
    enabled: !!id,
  });
};

// Create tag mutation
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => tagApi.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
};

// Update tag mutation
export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) =>
      tagApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
};

// Delete tag mutation
export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
};
