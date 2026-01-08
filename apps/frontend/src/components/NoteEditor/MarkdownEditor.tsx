import { useState, useEffect, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useAutoSave, SaveStatus } from '@/hooks/useAutoSave';
import { ImageUpload } from './ImageUpload';
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
    saving: { text: 'Saving...', color: 'text-blue-600' },
    saved: { text: 'Saved', color: 'text-green-600' },
    error: { text: 'Error saving', color: 'text-red-600' },
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
  const [content, setContent] = useState(note?.content || '');
  const [tagIds, setTagIds] = useState<string[]>(note?.tags?.map((t: any) => t.id) || []);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle image URLs insertion
  const insertImages = useCallback((urls: string[]) => {
    const imageMarkdown = urls.map((url) => `![](${url})`).join('\n');
    setContent((prev) => prev + '\n' + imageMarkdown);
  }, []);

  // Handle clipboard paste for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imageItems = items.filter((item) => item.type.startsWith('image/'));

      if (imageItems.length > 0 && note?.id) {
        e.preventDefault();
        const files = imageItems
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);

        if (files.length > 0) {
          // Images will be handled by ImageUpload component
          // User needs to use the upload component for now
          console.log('Paste detected. Please use the image upload component below.');
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [note?.id]);

  // Update content when note changes
  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTagIds(note.tags?.map((t: any) => t.id) || []);
      setIsCreating(false); // Reset creating flag when note is loaded
    }
  }, [note?.id]);

  // Save function
  const handleManualSave = async () => {
    if (isSaving) return; // Prevent double-save

    setIsSaving(true);
    try {
      let createdNoteId: string | undefined;

      if (note) {
        await onSave({ content, tagIds });
      } else if (content.trim().length > 0 && !isCreating) {
        setIsCreating(true);
        createdNoteId = await onCreate({ date, content, tagIds });
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
    value: { content, tagIds },
    onSave: async (value) => {
      if (note) {
        // Update existing note
        await onSave(value);
      } else if (value.content.trim().length > 0 && !isCreating) {
        // Create new note (only if there's content and not already creating)
        try {
          setIsCreating(true);
          await onCreate({ date, ...value });
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Note</h3>
        <div className="flex items-center gap-3">
          <SaveStatusIndicator status={status} />
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div data-color-mode="auto">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          height={500}
          preview="edit"
          hideToolbar={false}
          enableScroll={true}
          textareaProps={{
            placeholder: 'Start typing... (Markdown supported)',
          }}
        />
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        💡 Tip: Use Markdown for formatting. Auto-saves every 30 seconds, or click 'Save' to save immediately.
      </div>

      {/* Image Upload Section */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Upload Images
        </h4>
        <ImageUpload
          noteId={note?.id}
          onImagesUploaded={insertImages}
          disabled={!note?.id}
        />
        {!note?.id && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            ℹ️ Save the note first before uploading images
          </p>
        )}
      </div>
    </div>
  );
}
