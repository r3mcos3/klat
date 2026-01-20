import { create } from 'zustand';
import api from '@/services/api';

interface PreferencesState {
  emailNotifications: boolean;
  isLoading: boolean;
  isSaving: boolean;
  hasFetched: boolean;
  fetchPreferences: () => Promise<void>;
  updateEmailNotifications: (enabled: boolean) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  emailNotifications: true,
  isLoading: false,
  isSaving: false,
  hasFetched: false,

  fetchPreferences: async () => {
    if (get().hasFetched) return;

    set({ isLoading: true });
    try {
      const response = await api.get('/preferences');
      set({
        emailNotifications: response.data.data.emailNotifications ?? true,
        isLoading: false,
        hasFetched: true,
      });
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      set({ isLoading: false, hasFetched: true });
    }
  },

  updateEmailNotifications: async (enabled: boolean) => {
    set({ isSaving: true });
    try {
      await api.put('/preferences', { emailNotifications: enabled });
      set({ emailNotifications: enabled, isSaving: false });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      set({ isSaving: false });
      throw error;
    }
  },
}));
