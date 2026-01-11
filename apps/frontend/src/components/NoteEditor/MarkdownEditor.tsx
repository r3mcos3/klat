import { useState, useEffect, useCallback, useRef } from 'react';
import { useAutoSave, SaveStatus } from '@/hooks/useAutoSave';
import { useUpdateNote } from '@/hooks/useNotes';
import { extractImageUrlsFromMarkdown } from '@/utils/imageHelpers';
import { handleImageDragStart } from '@/utils/dragHelpers';
import { ImageUpload, ImageUploadRef } from './ImageUpload';
import type { Note } from '@klat/types';

interface MarkdownEditorProps {
  note?: Note;
  date: string;
  onSave: (data: { content: string; tagIds: string[] }) => Promise<void>;
  onCreate: (data: { date: string; content: string; tagIds: string[] }) => Promise<string | undefined>;
  onSaveComplete?: (noteId?: string) => void;
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  const statusConfig = {
    saving: { text: 'Saving...', color: 'text-accent-primary' },
    saved: { text: 'Saved', color: 'text-success' },
    error: { text: 'Error saving', color: 'text-priority-high' },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 text-sm ${config.color}`}>
      {status === 'saving' && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {status === 'saved' && (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {status === 'error' && (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span>{config.text}</span>
    </div>
  );
}

export function MarkdownEditor({ note, date, onSave, onCreate, onSaveComplete }: MarkdownEditorProps) {
  const [textContent, setTextContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>(note?.tags?.map((t: any) => t.id) || []);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imageUploadRef = useRef<ImageUploadRef>(null);
  const updateNote = useUpdateNote();

  // Extract text and images from note content
  useEffect(() => {
    if (note?.content) {
      const images = extractImageUrlsFromMarkdown(note.content);
      const textOnly = note.content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
      setTextContent(textOnly);
      setImageUrls(images);
    }
  }, [note?.content]);

  // Handle image URLs insertion
  const insertImages = useCallback((urls: string[]) => {
    setImageUrls((prev) => [...prev, ...urls]);
  }, []);

  // Update state when note changes
  useEffect(() => {
    if (note) {
      const images = extractImageUrlsFromMarkdown(note.content);
      const textOnly = note.content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
      setTextContent(textOnly);
      setImageUrls(images);
      setTagIds(note.tags?.map((t: any) => t.id) || []);
      setIsCreating(false); // Reset creating flag when note is loaded
    }
  }, [note?.id]);

  // Helper to combine text and images into markdown
  const combineContent = useCallback(() => {
    const imageMarkdown = imageUrls.map((url) => `![](${url})`).join('\n');
    if (imageMarkdown) {
      return textContent + '\n' + imageMarkdown;
    }
    return textContent;
  }, [textContent, imageUrls]);

  // Save function
  const handleManualSave = async () => {
    if (isSaving) return; // Prevent double-save

    setIsSaving(true);
    try {
      let createdNoteId: string | undefined;
      let currentNoteId = note?.id;
      let cleanedText = textContent;

      // If it's a new note, create it first (without images)
      if (!note && textContent.trim().length > 0 && !isCreating) {
        setIsCreating(true);
        const content = textContent; // Just text for now
        createdNoteId = await onCreate({ date, content, tagIds });
        currentNoteId = createdNoteId;

        // After onCreate, hashtags are processed and removed
        // Update textContent to reflect this
        cleanedText = content.replace(/#(\w+)/g, '').trim();
        setTextContent(cleanedText);
      }

      // Now upload any pending images (for both new and existing notes)
      let allImageUrls = [...imageUrls];
      if (imageUploadRef.current?.hasPendingImages() && currentNoteId) {
        // Temporarily set the noteId for upload
        const newUrls = await imageUploadRef.current.uploadPendingImages(currentNoteId);
        allImageUrls = [...imageUrls, ...newUrls];
        // Update state for UI
        setImageUrls(allImageUrls);
      }

      // Use the cleaned textContent (hashtags already removed for new notes)
      const currentText = createdNoteId ? cleanedText : textContent;

      // If we have images, update the note with the complete content (text + images)
      if (allImageUrls.length > 0 && currentNoteId) {
        const imageMarkdown = allImageUrls.map((url) => `![](${url})`).join('\n');
        const content = imageMarkdown ? currentText + '\n' + imageMarkdown : currentText;

        if (note) {
          // Update existing note
          await onSave({ content, tagIds });
        } else {
          // Update the newly created note with images
          // Hashtags already processed during onCreate, just add images
          await updateNote.mutateAsync({
            id: currentNoteId,
            data: { content, tagIds }
          });
        }
      } else if (note && !imageUploadRef.current?.hasPendingImages()) {
        // Just update existing note without new images
        const imageMarkdown = allImageUrls.map((url) => `![](${url})`).join('\n');
        const content = imageMarkdown ? textContent + '\n' + imageMarkdown : textContent;
        await onSave({ content, tagIds });
      }

      // Call completion callback after successful save
      if (onSaveComplete) {
        onSaveComplete(createdNoteId);
      }
    } catch (error) {
      console.error('Manual save error:', error);
      setIsCreating(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save logic
  const { status } = useAutoSave({
    value: { textContent, imageUrls, tagIds },
    onSave: async () => {
      const content = combineContent();
      if (note) {
        // Update existing note
        await onSave({ content, tagIds });
      } else if (textContent.trim().length > 0 && !isCreating) {
        // Create new note (only if there's content and not already creating)
        try {
          setIsCreating(true);
          await onCreate({ date, content, tagIds });
          // Don't call onSaveComplete here - we don't want to navigate away during auto-save
        } catch (error) {
          setIsCreating(false);
          throw error;
        }
      }
    },
    delay: 30000, // 30 seconds delay for auto-save
    enabled: true,
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-primary">Note</h3>
        <div className="flex items-center gap-3">
          <SaveStatusIndicator status={status} />
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="px-4 py-2 bg-accent-primary text-bg-primary rounded-md hover:bg-accent-primary-hover hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-body font-medium"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Start typing your note..."
        className="w-full h-96 p-4 border-2 border-accent-primary/30 rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary resize-y font-body transition-all hover:border-accent-primary/50 hover:bg-bg-tertiary"
      />

      {/* Display existing images */}
      {imageUrls.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-body font-semibold text-primary">
              Attached Images ({imageUrls.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative group border border-border-default rounded-lg overflow-hidden hover:border-accent-primary transition-colors"
              >
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-32 object-cover cursor-grab active:cursor-grabbing"
                  draggable="true"
                  onDragStart={(e) => handleImageDragStart(e, url)}
                />
                <button
                  onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-1.5 bg-priority-high text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-priority-high hover:glow-coral"
                  title="Remove image"
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
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs font-body text-tertiary">
        💡 Tip: Auto-saves every 30 seconds, or click 'Save' to save immediately.
      </div>

      {/* Image Upload Section */}
      <div className="mt-8">
        <h4 className="text-sm font-body font-semibold text-primary mb-3">
          Upload Images
        </h4>
        <ImageUpload
          ref={imageUploadRef}
          noteId={note?.id}
          onImagesUploaded={insertImages}
        />
      </div>
    </div>
  );
}
