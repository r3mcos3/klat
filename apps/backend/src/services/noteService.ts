import { supabase } from '../config/supabase';
import { CreateNoteDto, UpdateNoteDto } from '../types/validation';
import { AppError } from '../middleware/errorHandler';

export class NoteService {
  // Create a new note (multiple notes per day allowed)
  async createNote(data: CreateNoteDto) {
    const { date, content, deadline, completedAt, importance, tagIds } = data;

    // Generate a unique ID
    const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get current timestamp
    const now = new Date().toISOString();

    // Start a transaction
    const { error } = await supabase
      .from('notes')
      .insert({
        id,
        date,
        content,
        deadline: deadline || null,
        completedAt: completedAt || null,
        importance: importance || null,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId) => ({
        A: id,
        B: tagId,
      }));

      await supabase.from('_NoteToTag').insert(tagRelations);
    }

    // Fetch note with tags
    return this.getNoteById(id);
  }

  // Get note by ID (single note)
  async getNoteById(id: string) {
    const { data: note, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(*))
      `
      )
      .eq('id', id)
      .single();

    if (error || !note) {
      throw new AppError('Notitie niet gevonden', 404);
    }

    // Transform the data to match our expected format
    return {
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    };
  }

  // Get all notes for a specific date
  async getNotesByDate(date: string) {
    const { data: notes, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(*))
      `
      )
      .eq('date', date)
      .order('createdAt', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    return (notes || []).map((note: any) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));
  }

  // Get notes for a specific month
  async getNotesByMonth(yearMonth: string) {
    const [year, month] = yearMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: notes, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(*))
      `
      )
      .gte('date', startDate)
      .lte('date', endDate)
      .order('createdAt', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    return (notes || []).map((note: any) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));
  }

  // Update note
  async updateNote(id: string, data: UpdateNoteDto) {
    const { content, deadline, completedAt, importance, tagIds } = data;

    // Check if note exists
    const { data: existing } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('Notitie niet gevonden', 404);
    }

    // Update note content/deadline/completedAt/importance if provided
    if (content !== undefined || deadline !== undefined || completedAt !== undefined || importance !== undefined) {
      const now = new Date().toISOString();
      const updateData: any = {
        updatedAt: now,
      };

      if (content !== undefined) {
        updateData.content = content;
      }

      if (deadline !== undefined) {
        updateData.deadline = deadline || null;
      }

      if (completedAt !== undefined) {
        updateData.completedAt = completedAt || null;
      }

      if (importance !== undefined) {
        updateData.importance = importance || null;
      }

      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id);

      if (error) throw new AppError(error.message, 500);
    }

    // Update tags if provided
    if (tagIds) {
      // Remove existing tags
      await supabase.from('_NoteToTag').delete().eq('A', id);

      // Add new tags
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId) => ({
          A: id,
          B: tagId,
        }));
        await supabase.from('_NoteToTag').insert(tagRelations);
      }
    }

    // Return updated note
    return this.getNoteById(id);
  }

  // Delete note
  async deleteNote(id: string) {
    const { data: existing } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('Notitie niet gevonden', 404);
    }

    // Delete tag relations first
    await supabase.from('_NoteToTag').delete().eq('A', id);

    // Delete note
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) throw new AppError(error.message, 500);

    return { message: 'Notitie verwijderd' };
  }

  // Get all notes
  async getAllNotes() {
    const { data: notes, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(*))
      `
      )
      .order('createdAt', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    return (notes || []).map((note: any) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));
  }
}

export default new NoteService();
