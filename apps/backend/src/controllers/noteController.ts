import { Request, Response, NextFunction } from 'express';
import noteService from '../services/noteService';
import { CreateNoteDto, UpdateNoteDto } from '../types/validation';

export class NoteController {
  // POST /api/notes - Create new note
  async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateNoteDto = req.body;
      const userId = req.userId!; // Set by auth middleware
      const note = await noteService.createNote(data, userId);
      res.status(201).json({
        data: note,
        message: 'Notitie aangemaakt',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes/id/:id - Get note by ID
  async getNoteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!; // Set by auth middleware
      const note = await noteService.getNoteById(id, userId);
      res.json({
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes/:date - Get all notes by date (returns array)
  async getNoteByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      const userId = req.userId!; // Set by auth middleware
      const notes = await noteService.getNotesByDate(date, userId);
      res.json({
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes?month=YYYY-MM - Get notes for month
  async getNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { month } = req.query as { month?: string };
      const userId = req.userId!; // Set by auth middleware

      if (month) {
        const notes = await noteService.getNotesByMonth(month, userId);
        res.json({
          data: notes,
        });
      } else {
        const notes = await noteService.getAllNotes(userId);
        res.json({
          data: notes,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notes/:id - Update note
  async updateNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateNoteDto = req.body;
      const userId = req.userId!; // Set by auth middleware
      const note = await noteService.updateNote(id, data, userId);
      res.json({
        data: note,
        message: 'Notitie bijgewerkt',
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/notes/:id - Delete note
  async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId!; // Set by auth middleware
      const result = await noteService.deleteNote(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new NoteController();
