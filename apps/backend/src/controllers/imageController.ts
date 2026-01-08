import { Request, Response, NextFunction } from 'express';
import imageService from '../services/imageService';
import noteService from '../services/noteService';
import { AppError } from '../middleware/errorHandler';

export class ImageController {
  /**
   * Upload multiple images for a note
   */
  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { noteId } = req.params;
      const userId = req.userId!;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      // Verify note exists and belongs to user
      try {
        await noteService.getNoteById(noteId, userId);
      } catch {
        throw new AppError('Note not found or unauthorized', 404);
      }

      // Upload all images
      const uploadPromises = files.map((file) =>
        imageService.uploadImage(file, userId, noteId)
      );

      const urls = await Promise.all(uploadPromises);

      res.status(200).json({
        data: { urls },
        message: `Successfully uploaded ${urls.length} image(s)`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a specific image
   */
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imagePath } = req.params;
      const userId = req.userId!;

      // Decode the image path
      const decodedPath = decodeURIComponent(imagePath);

      await imageService.deleteImage(decodedPath, userId);

      res.status(200).json({
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
