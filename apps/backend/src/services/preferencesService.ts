import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export interface UserPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesDto {
  emailNotifications?: boolean;
}

export class PreferencesService {
  // Get user preferences (returns defaults if not found)
  async getPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('userId', userId)
      .single();

    // PGRST116 = not found, which is OK
    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, 500);
    }

    // Return defaults if no preferences exist
    if (!data) {
      return {
        id: '',
        userId,
        emailNotifications: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return data;
  }

  // Update user preferences (upsert)
  async updatePreferences(
    userId: string,
    updates: UpdatePreferencesDto
  ): Promise<UserPreferences> {
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('userId', userId)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updatedAt: now,
        })
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw new AppError(error.message, 500);
      return data;
    } else {
      // Create new preferences
      const id = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          id,
          userId,
          emailNotifications: updates.emailNotifications ?? true,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) throw new AppError(error.message, 500);
      return data;
    }
  }
}

export default new PreferencesService();
