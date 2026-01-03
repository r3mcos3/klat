import { Router } from 'express';
import searchController from '../controllers/searchController';
import { validateQuery } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { searchQuerySchema } from '../types/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/search?q=query&tags=tag1,tag2&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', validateQuery(searchQuerySchema), searchController.search);

export default router;
