import api from './api';
import type { SearchResult } from '@klat/types';

export interface SearchParams {
  query: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export const searchApi = {
  search: async (params: SearchParams): Promise<SearchResult[]> => {
    const queryParams = new URLSearchParams({
      q: params.query,
      ...(params.tags && params.tags.length > 0 ? { tags: params.tags.join(',') } : {}),
      ...(params.startDate ? { startDate: params.startDate } : {}),
      ...(params.endDate ? { endDate: params.endDate } : {}),
    });

    const response = await api.get(`/search?${queryParams}`);
    return response.data.data;
  },
};
