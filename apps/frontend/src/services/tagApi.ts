import api from './api';
import type { Tag, CreateTagDto, UpdateTagDto } from '@klat/types';

export const tagApi = {
  // Get all tags
  getAllTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data.data;
  },

  // Get tag by ID
  getTagById: async (id: string): Promise<Tag> => {
    const response = await api.get(`/tags/${id}`);
    return response.data.data;
  },

  // Create tag
  createTag: async (data: CreateTagDto): Promise<Tag> => {
    const response = await api.post('/tags', data);
    return response.data.data;
  },

  // Update tag
  updateTag: async (id: string, data: UpdateTagDto): Promise<Tag> => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data.data;
  },

  // Delete tag
  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};
