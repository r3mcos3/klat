import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { validateImageFile, createImagePreview, formatFileSize } from '@/utils/imageHelpers';

interface ImageUploadProps {
  noteId?: string;
  onImagesUploaded: (urls: string[]) => void;
  disabled?: boolean;
}

interface PreviewImage {
  file: File;
  preview: string;
}

export function ImageUpload({ noteId, onImagesUploaded, disabled }: ImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useImageUpload(noteId || '');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate all files
    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        newErrors.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    }

    setErrors(newErrors);

    // Create previews for valid files
    if (validFiles.length > 0) {
      const newPreviews = await Promise.all(
        validFiles.map(async (file) => ({
          file,
          preview: await createImagePreview(file),
        }))
      );
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!noteId || previews.length === 0) return;

    try {
      const files = previews.map((p) => p.file);
      const urls = await uploadMutation.mutateAsync(files);

      // Clear previews and errors
      setPreviews([]);
      setErrors([]);

      // Call callback with uploaded URLs
      onImagesUploaded(urls);
    } catch (error) {
      setErrors([`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  const isDisabled = disabled || !noteId || uploadMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400 dark:hover:border-primary-500'}
        `}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
          >
            Click to upload
          </button>
          <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          PNG, JPG, GIF, WebP up to 5MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          disabled={isDisabled}
          className="hidden"
        />
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Upload errors
              </h3>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {previews.length} image{previews.length > 1 ? 's' : ''} selected
            </h4>
            <button
              onClick={handleUpload}
              disabled={isDisabled}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => removePreview(index)}
                  disabled={uploadMutation.isPending}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="p-2 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatFileSize(preview.file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
