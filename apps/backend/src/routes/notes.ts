import { Router } from 'express';
import noteController from '../controllers/noteController';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  createNoteSchema,
  updateNoteSchema,
  dateParamSchema,
  monthQuerySchema,
  idParamSchema,
} from '../types/validation';

const router = Router();

// POST /api/notes - Create new note
router.post('/', validateBody(createNoteSchema), noteController.createNote);

// GET /api/notes?month=YYYY-MM - Get notes for month (or all notes)
router.get('/', noteController.getNotes);

// GET /api/notes/id/:id - Get note by ID (must be before /:date to avoid conflicts)
router.get('/id/:id', validateParams(idParamSchema), noteController.getNoteById);

// GET /api/notes/:date - Get note by date
router.get('/:date', validateParams(dateParamSchema), noteController.getNoteByDate);

// PUT /api/notes/:id - Update note
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateNoteSchema),
  noteController.updateNote
);

// DELETE /api/notes/:id - Delete note
router.delete('/:id', validateParams(idParamSchema), noteController.deleteNote);

export default router;
