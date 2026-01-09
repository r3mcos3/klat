import api from './api';

export interface ImageUploadResponse {
  urls: string[];
}

export const imageApi = {
  /**
   * Upload multiple images for a note
   */
  uploadImages: async (noteId: string, files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await api.post<{ data: ImageUploadResponse }>(
      `/images/upload/${noteId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data.data.urls;
  },
};
