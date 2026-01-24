import { supabase } from '../config/supabase';
import { CreateNoteDto, UpdateNoteDto } from '../types/validation';
import { AppError } from '../middleware/errorHandler';
import imageService from './imageService';

export class NoteService {
  // Helper function to sort notes by priority (deadline urgency + importance + age)
  private sortNotesByPriority(notes: any[]): any[] {
    return notes.sort((a, b) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Helper function to get deadline urgency score
      const getDeadlineUrgency = (deadline: string | null): number => {
        if (!deadline) return 5; // No deadline = medium priority

        const deadlineDate = new Date(deadline);
        const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());

        // Calculate days difference
        const daysUntilDeadline = Math.ceil((deadlineDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDeadline < 0) return 1; // Overdue = highest priority
        if (daysUntilDeadline === 0) return 2; // Due today = very high
        if (daysUntilDeadline === 1) return 3; // Due tomorrow = high
        if (daysUntilDeadline <= 7) return 4; // Due within week = medium-high
        return 6; // Due > 7 days = lowest (far future)
      };

      // Helper function to get importance score
      const getImportanceScore = (importance: string | null): number => {
        if (importance === 'HIGH') return 3;
        if (importance === 'MEDIUM') return 2;
        if (importance === 'LOW') return 1;
        return 0; // No importance = lowest
      };

      // 1. Sort by deadline urgency
      const urgencyA = getDeadlineUrgency(a.deadline);
      const urgencyB = getDeadlineUrgency(b.deadline);
      if (urgencyA !== urgencyB) {
        return urgencyA - urgencyB;
      }

      // 2. Sort by importance (higher first)
      const importanceA = getImportanceScore(a.importance);
      const importanceB = getImportanceScore(b.importance);
      if (importanceA !== importanceB) {
        return importanceB - importanceA;
      }

      // 3. Sort by creation date (oldest first - FIFO)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }

  // Create a new note (multiple notes per day allowed)
  async createNote(data: CreateNoteDto, userId: string) {
    const { date, content, deadline, completedAt, inProgress, importance, tagIds } = data;

    // Generate a unique ID
    const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get current timestamp
    const now = new Date().toISOString();

    // Start a transaction
    const { error } = await supabase
      .from('notes')
      .insert({
        id,
        userId,
        date,
        content,
        deadline: deadline || null,
        completedAt: completedAt || null,
        inProgress: inProgress || false,
        importance: importance || null,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId: string) => ({
        A: id,
        B: tagId,
      }));

      await supabase.from('_NoteToTag').insert(tagRelations);
    }

    // Fetch note with tags
    return this.getNoteById(id, userId);
  }

  // Get note by ID (single note)
  async getNoteById(id: string, userId: string) {
    const { data: note, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(id, name, color))
      `
      )
      .eq('id', id)
      .eq('userId', userId)
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
  async getNotesByDate(date: string, userId: string) {
    const { data: notes, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(id, name, color))
      `
      )
      .eq('date', date)
      .eq('userId', userId);

    if (error) throw new AppError(error.message, 500);

    const transformedNotes = (notes || []).map((note: any) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));

    // Apply smart sorting
    return this.sortNotesByPriority(transformedNotes);
  }

  // Get notes for a specific month
  async getNotesByMonth(yearMonth: string, userId: string) {
    const [year, month] = yearMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: notes, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(id, name, color))
      `
      )
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('userId', userId);

    if (error) throw new AppError(error.message, 500);

    const transformedNotes = (notes || []).map((note: any) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));

    // Apply smart sorting
    return this.sortNotesByPriority(transformedNotes);
  }

  // Update note
  async updateNote(id: string, data: UpdateNoteDto, userId: string) {
    const { content, deadline, completedAt, inProgress, importance, tagIds } = data;

    // Check if note exists and belongs to user
    const { data: existing } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (!existing) {
      throw new AppError('Notitie niet gevonden', 404);
    }

    // Update note content/deadline/completedAt/importance/inProgress if provided
    if (content !== undefined || deadline !== undefined || completedAt !== undefined || inProgress !== undefined || importance !== undefined) {
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
        // When marking note as completed, automatically disable "In Progress" status
        if (completedAt) {
          updateData.inProgress = false;
        }
      }

      if (inProgress !== undefined) {
        updateData.inProgress = inProgress;
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
        const tagRelations = tagIds.map((tagId: string) => ({
          A: id,
          B: tagId,
        }));
        await supabase.from('_NoteToTag').insert(tagRelations);
      }
    }

    // Return updated note
    return this.getNoteById(id, userId);
  }

  // Delete note
  async deleteNote(id: string, userId: string) {
    const { data: existing } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (!existing) {
      throw new AppError('Notitie niet gevonden', 404);
    }

    // Delete associated images
    await imageService.deleteNoteImages(id, userId);

    // Delete tag relations
    await supabase.from('_NoteToTag').delete().eq('A', id);

    // Delete note
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) throw new AppError(error.message, 500);

    return { message: 'Notitie verwijderd' };
  }

  // Get all notes
  async getAllNotes(userId: string) {
    const { data: notes, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(id, name, color))
      `
      )
      .eq('userId', userId);

    if (error) throw new AppError(error.message, 500);

    const transformedNotes = (notes || []).map((note: any) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));

    // Apply smart sorting
    return this.sortNotesByPriority(transformedNotes);
  }

  // Delete all completed notes
  async deleteCompletedNotes(userId: string) {
    // Get all completed notes for this user
    const { data: completedNotes, error: fetchError } = await supabase
      .from('notes')
      .select('id')
      .eq('userId', userId)
      .not('completedAt', 'is', null);

    if (fetchError) throw new AppError(fetchError.message, 500);

    if (!completedNotes || completedNotes.length === 0) {
      return { message: 'Geen voltooide notities gevonden', deletedCount: 0 };
    }

    const noteIds = completedNotes.map((note) => note.id);

    // Delete associated images for each note
    for (const noteId of noteIds) {
      await imageService.deleteNoteImages(noteId, userId);
    }

    // Delete tag relations for all completed notes
    const { error: tagRelationError } = await supabase
      .from('_NoteToTag')
      .delete()
      .in('A', noteIds);

    if (tagRelationError) throw new AppError(tagRelationError.message, 500);

    // Delete all completed notes
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .in('id', noteIds);

    if (deleteError) throw new AppError(deleteError.message, 500);

    return { message: 'Voltooide notities verwijderd', deletedCount: noteIds.length };
  }
}

export default new NoteService();
