const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file (client-side validation)
 */
export const validateImageFile = (file: File): ValidationResult => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: JPEG, PNG, GIF, WebP`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum: ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  return { valid: true };
};

/**
 * Create image preview URL from File
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Extract image URLs from markdown content
 */
export const extractImageUrlsFromMarkdown = (content: string): string[] => {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return matches;
};

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
