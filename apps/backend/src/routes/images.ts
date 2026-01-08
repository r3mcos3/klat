import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import imageController from '../controllers/imageController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload images for a note (max 10 files)
router.post('/upload/:noteId', upload.array('images', 10), imageController.uploadImages);

// Delete a specific image
router.delete('/:imagePath', imageController.deleteImage);

export default router;
