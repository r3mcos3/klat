import { Router } from 'express';
import tagController from '../controllers/tagController';
import { validateBody, validateParams } from '../middleware/validation';
import { createTagSchema, updateTagSchema, idParamSchema } from '../types/validation';

const router = Router();

// GET /api/tags - Get all tags
router.get('/', tagController.getAllTags);

// GET /api/tags/:id - Get tag by ID
router.get('/:id', validateParams(idParamSchema), tagController.getTagById);

// POST /api/tags - Create new tag
router.post('/', validateBody(createTagSchema), tagController.createTag);

// PUT /api/tags/:id - Update tag
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateTagSchema),
  tagController.updateTag
);

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', validateParams(idParamSchema), tagController.deleteTag);

export default router;
