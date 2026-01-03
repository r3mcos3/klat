import { useParams, Link, useNavigate } from 'react-router-dom';
import { MarkdownEditor } from '@/components/NoteEditor/MarkdownEditor';
import { TagList } from '@/components/Tags/TagList';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { DateTimePicker } from '@/components/Common/DateTimePicker';
import { useNoteById, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useAllTags, tagKeys } from '@/hooks/useTags';
import { formatDateNL, stringToDate, formatCompletedAt } from '@/utils/dateHelpers';
import { useState, useEffect } from 'react';
import { tagApi } from '@/services/tagApi';
import type { Tag } from '@klat/types';
import { useQueryClient } from '@tanstack/react-query';

// Predefined color palette for tags
const TAG_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
];

// Convert hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Calculate color distance using Euclidean distance in RGB space
const colorDistance = (hex1: string, hex2: string): number => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
};

// Minimum color distance threshold (0-441, higher = more different)
const MIN_COLOR_DISTANCE = 50;

export function NoteEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [completedAt, setCompletedAt] = useState<string>('');
  const [importance, setImportance] = useState<'LOW' | 'MEDIUM' | 'HIGH' | undefined>(undefined);
  const [noteDate, setNoteDate] = useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isNewNote = !id;

  const { data: note, isLoading: noteLoading } = useNoteById(id || '', { enabled: !isNewNote });
  const { data: allTags = [], isLoading: tagsLoading } = useAllTags();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  // Initialize form state when note loads or for new note
  useEffect(() => {
    if (isNewNote) {
      // For new notes, default to today
      setNoteDate(new Date());
      setSelectedTagIds([]);
      setDeadline(null);
      setCompletedAt('');
      setImportance(undefined);
    } else if (note) {
      // For existing notes, load from note data
      setNoteDate(new Date(note.date));
      if (note.tags) {
        setSelectedTagIds(note.tags.map((t) => t.id));
      }
      if (note.deadline) {
        setDeadline(new Date(note.deadline));
      } else {
        setDeadline(null);
      }
      if (note.completedAt) {
        setCompletedAt(note.completedAt);
      } else {
        setCompletedAt('');
      }
      setImportance(note.importance);
    }
  }, [note?.id, isNewNote]);

  const handleSaveComplete = (noteId?: string) => {
    if (noteId) {
      // If a note ID is provided (new note created), navigate to that note's edit page
      navigate(`/note/${noteId}`);
    } else {
      // Otherwise, go back to calendar
      navigate('/');
    }
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleToggleDone = async () => {
    if (!note) return;

    const newCompletedAt = completedAt ? '' : new Date().toISOString();
    setCompletedAt(newCompletedAt);

    await updateNote.mutateAsync({
      id: note.id,
      data: {
        completedAt: newCompletedAt || undefined,
      },
    });
  };

  // Extract hashtags from content
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];
    return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
  };

  // Remove hashtags from content after processing
  const removeHashtags = (content: string): string => {
    const hashtagRegex = /#(\w+)/g;
    return content.replace(hashtagRegex, '').trim();
  };

  // Get an unused color from the palette
  const getUnusedColor = (existingTags: Tag[], usedInCurrentOperation: Set<string>): string => {
    const allUsedColors = [
      ...existingTags.map(tag => tag.color).filter(Boolean),
      ...Array.from(usedInCurrentOperation)
    ];

    const availableColors = TAG_COLORS.filter(candidateColor => {
      return !allUsedColors.some(usedColor => {
        const distance = colorDistance(candidateColor, usedColor as string);
        return distance < MIN_COLOR_DISTANCE;
      });
    });

    return availableColors[0] || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  };

  // Process hashtags: create tags that don't exist and return all tag IDs
  const processHashtags = async (content: string): Promise<string[]> => {
    const hashtags = extractHashtags(content);
    if (hashtags.length === 0) return [];

    const tagIds: string[] = [];
    const usedColorsInOperation = new Set<string>();
    let tagsCreated = false;

    for (const hashtag of hashtags) {
      const existingTag = allTags.find(
        tag => tag.name.toLowerCase() === hashtag.toLowerCase()
      );

      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        try {
          const color = getUnusedColor(allTags, usedColorsInOperation);
          const newTag = await tagApi.createTag({
            name: hashtag,
            color: color,
          });
          tagIds.push(newTag.id);
          usedColorsInOperation.add(color);
          tagsCreated = true;
        } catch (error) {
          console.error('Error creating tag from hashtag:', error);
        }
      }
    }

    if (tagsCreated) {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    }

    return tagIds;
  };

  const handleSave = async (data: { content: string; tagIds: string[] }) => {
    if (note && !isNewNote) {
      const hashtagIds = await processHashtags(data.content);
      const cleanedContent = removeHashtags(data.content);
      const allTagIds = [...new Set([...selectedTagIds, ...hashtagIds])];
      const deadlineISO = deadline ? deadline.toISOString() : undefined;

      await updateNote.mutateAsync({
        id: note.id,
        data: {
          content: cleanedContent,
          deadline: deadlineISO,
          completedAt: completedAt || undefined,
          importance: importance,
          tagIds: allTagIds,
        },
      });
    }
  };

  const handleCreate = async (data: { date: string; content: string; tagIds: string[] }) => {
    if (!noteDate) return; // Guard against null date

    const hashtagIds = await processHashtags(data.content);
    const cleanedContent = removeHashtags(data.content);
    const allTagIds = [...new Set([...selectedTagIds, ...hashtagIds])];
    const deadlineISO = deadline ? deadline.toISOString() : undefined;

    const newNote = await createNote.mutateAsync({
      date: noteDate.toISOString(),
      content: cleanedContent,
      deadline: deadlineISO,
      completedAt: completedAt || undefined,
      importance: importance,
      tagIds: allTagIds,
    });

    return newNote.id;
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!note) return;

    setShowDeleteDialog(false);
    await deleteNote.mutateAsync(note.id);
    navigate('/');
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  if (noteLoading || tagsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const dateObj = noteDate || new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to overview
            </Link>

            {!isNewNote && note && (
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {isNewNote ? 'New note' : formatDateNL(dateObj, 'EEEE d MMMM yyyy')}
          </h1>
        </div>

        {/* Date info (for new notes) - automatically set to current time */}
        {isNewNote && noteDate && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Creation date: {formatDateNL(noteDate, 'EEEE d MMMM yyyy, HH:mm')}</span>
            </div>
          </div>
        )}

        {/* Tags Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          {allTags.length > 0 ? (
            <TagList
              tags={allTags}
              selectedTags={selectedTagIds}
              onToggle={handleToggleTag}
            />
          ) : (
            <div className="text-sm text-gray-500">
              No tags yet. <Link to="/tags" className="text-primary-600 hover:underline">Create one</Link>
            </div>
          )}
        </div>

        {/* Deadline Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Deadline (optional)</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <DateTimePicker
                selected={deadline}
                onChange={setDeadline}
                placeholderText="Select deadline"
              />
            </div>
            {deadline && (
              <button
                onClick={() => setDeadline(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Importance Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Importance (optional)</h3>
          </div>
          <div className="flex gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setImportance(importance === level ? undefined : level)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex-1
                  ${importance === level
                    ? level === 'HIGH'
                      ? 'bg-red-50 text-red-700 border-red-200 ring-2 ring-red-500'
                      : level === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-500'
                        : 'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                {level === 'LOW' && '🔵 Low'}
                {level === 'MEDIUM' && '🟡 Medium'}
                {level === 'HIGH' && '🔴 High'}
              </button>
            ))}
          </div>
        </div>

        {/* Done Button Section */}
        {!isNewNote && note && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              </div>
              <button
                onClick={handleToggleDone}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${completedAt
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {completedAt ? '✓ Completed' : 'Mark as completed'}
              </button>
            </div>
            {completedAt && (
              <p className="mt-3 text-sm text-gray-600">
                Completed on: {formatCompletedAt(completedAt)}
              </p>
            )}
          </div>
        )}

        {/* Editor Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <MarkdownEditor
            note={note}
            date={noteDate ? noteDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            onSave={handleSave}
            onCreate={handleCreate}
            onSaveComplete={handleSaveComplete}
          />
        </div>

        {/* Helper text */}
        <div className="mt-4 text-sm text-gray-500 text-center space-y-1">
          <p>💡 Your note auto-saves every 30 seconds, or use the 'Save' button</p>
          <p>🏷️ Use #hashtags in your note to automatically create tags (the # will be removed)</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete note?"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger={true}
      />
    </div>
  );
}
