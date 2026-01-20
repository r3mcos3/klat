import { Router } from 'express';
import preferencesController from '../controllers/preferencesController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/preferences - Get user preferences
router.get('/', preferencesController.getPreferences);

// PUT /api/preferences - Update user preferences
router.put('/', preferencesController.updatePreferences);

export default router;
