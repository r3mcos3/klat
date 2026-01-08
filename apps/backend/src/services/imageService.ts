import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import sharp from 'sharp';

const BUCKET_NAME = 'note-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export class ImageService {
  /**
   * Upload and optimize an image
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    noteId: string
  ): Promise<string> {
    // Validate image
    this.validateImage(file);

    // Optimize image (resize + WebP conversion)
    const optimizedBuffer = await this.optimizeImage(file.buffer);

    // Generate file path: {userId}/{noteId}/{timestamp}-{filename}.webp
    const filePath = this.generateFilePath(userId, noteId, file.originalname);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      throw new AppError(`Upload failed: ${uploadError.message}`, 500);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return publicUrl;
  }

  /**
   * Delete a specific image
   */
  async deleteImage(imagePath: string, userId: string): Promise<void> {
    // Verify that the image belongs to the user (path should start with userId)
    if (!imagePath.startsWith(`${userId}/`)) {
      throw new AppError('Unauthorized: Cannot delete images from other users', 403);
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([imagePath]);

    if (error) {
      throw new AppError(`Delete failed: ${error.message}`, 500);
    }
  }

  /**
   * Delete all images for a note
   */
  async deleteNoteImages(noteId: string, userId: string): Promise<void> {
    // List all files in the note's folder
    const folderPath = `${userId}/${noteId}`;
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath);

    if (listError) {
      console.error('Failed to list images for deletion:', listError);
      return; // Don't throw error - note deletion should continue
    }

    if (!files || files.length === 0) {
      return; // No images to delete
    }

    // Delete all files
    const filePaths = files.map((file) => `${folderPath}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (deleteError) {
      console.error('Failed to delete note images:', deleteError);
      // Don't throw error - note deletion should continue
    }
  }

  /**
   * Validate image file
   */
  private validateImage(file: Express.Multer.File): void {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        400
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        400
      );
    }
  }

  /**
   * Optimize image: resize and convert to WebP
   */
  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
          effort: 4,
        })
        .toBuffer();
    } catch (error) {
      throw new AppError('Image processing failed', 500);
    }
  }

  /**
   * Generate file path with sanitized filename
   */
  private generateFilePath(userId: string, noteId: string, originalFilename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = this.sanitizeFilename(originalFilename);
    const filenameWithoutExt = sanitizedFilename.replace(/\.[^/.]+$/, '');
    return `${userId}/${noteId}/${timestamp}-${filenameWithoutExt}.webp`;
  }

  /**
   * Sanitize filename to prevent path traversal
   */
  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
  }
}

export default new ImageService();
