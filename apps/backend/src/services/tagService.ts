import { supabase } from '../config/supabase';
import { CreateTagDto, UpdateTagDto } from '../types/validation';
import { AppError } from '../middleware/errorHandler';

export class TagService {
  // Get all tags
  async getAllTags(userId: string) {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*, note_count:_NoteToTag(count)')
      .eq('userId', userId)
      .order('name', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    return (tags || []).map((tag: any) => ({
      ...tag,
      _count: {
        notes: tag.note_count?.[0]?.count || 0,
      },
    }));
  }

  // Get tag by ID
  async getTagById(id: string, userId: string) {
    const { data: tag, error } = await supabase
      .from('tags')
      .select('*, note_count:_NoteToTag(count)')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (error || !tag) {
      throw new AppError('Tag niet gevonden', 404);
    }

    return {
      ...tag,
      _count: {
        notes: tag.note_count?.[0]?.count || 0,
      },
    };
  }

  // Create new tag
  async createTag(data: CreateTagDto, userId: string) {
    const { name, color } = data;

    // Check if tag with same name already exists for this user
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .eq('userId', userId)
      .single();

    if (existing) {
      throw new AppError('Tag met deze naam bestaat al', 409);
    }

    // Generate ID
    const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        id,
        userId,
        name,
        color,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    return tag;
  }

  // Update tag
  async updateTag(id: string, data: UpdateTagDto, userId: string) {
    const { name, color } = data;

    // Check if tag exists and belongs to user
    const { data: existing } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (!existing) {
      throw new AppError('Tag niet gevonden', 404);
    }

    // If updating name, check for conflicts
    if (name && name !== existing.name) {
      const { data: nameExists } = await supabase
        .from('tags')
        .select('id')
        .eq('name', name)
        .eq('userId', userId)
        .single();

      if (nameExists) {
        throw new AppError('Tag met deze naam bestaat al', 409);
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    const { data: tag, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    return tag;
  }

  // Delete tag
  async deleteTag(id: string, userId: string) {
    // Check if tag exists and count notes
    const { count: noteCount } = await supabase
      .from('_NoteToTag')
      .select('*', { count: 'exact', head: true })
      .eq('B', id);

    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (!existing) {
      throw new AppError('Tag niet gevonden', 404);
    }

    // Check if tag is used by notes
    if (noteCount && noteCount > 0) {
      throw new AppError(
        `Tag wordt gebruikt door ${noteCount} notitie(s). Verwijder eerst de tag van alle notities.`,
        409
      );
    }

    const { error } = await supabase.from('tags').delete().eq('id', id);

    if (error) throw new AppError(error.message, 500);

    return { message: 'Tag verwijderd' };
  }
}

export default new TagService();
