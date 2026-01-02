import { useParams, Link, useNavigate } from 'react-router-dom';
import { MarkdownEditor } from '@/components/NoteEditor/MarkdownEditor';
import { TagList } from '@/components/Tags/TagList';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { useNoteByDate, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useAllTags, tagKeys } from '@/hooks/useTags';
import { formatDateNL, stringToDate } from '@/utils/dateHelpers';
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

export function DayView() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!date) {
    return <div>Ongeldige datum</div>;
  }

  const { data: note, isLoading: noteLoading } = useNoteByDate(date);
  const { data: allTags = [], isLoading: tagsLoading } = useAllTags();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const dateObj = stringToDate(date);

  // Initialize selectedTagIds with note's tags when note loads
  useEffect(() => {
    if (note?.tags) {
      setSelectedTagIds(note.tags.map((t) => t.id));
    }
  }, [note?.id]);

  const handleSaveComplete = () => {
    navigate('/calendar');
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Extract hashtags from content
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];

    // Remove # and get unique hashtags
    return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
  };

  // Get an unused color from the palette
  const getUnusedColor = (existingTags: Tag[], usedInCurrentOperation: Set<string>): string => {
    const allUsedColors = new Set([
      ...existingTags.map(tag => tag.color).filter(Boolean),
      ...Array.from(usedInCurrentOperation)
    ]);
    const unusedColor = TAG_COLORS.find(color => !allUsedColors.has(color));
    return unusedColor || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  };

  // Process hashtags: create tags that don't exist and return all tag IDs
  const processHashtags = async (content: string): Promise<string[]> => {
    const hashtags = extractHashtags(content);
    if (hashtags.length === 0) return [];

    const tagIds: string[] = [];
    const usedColorsInOperation = new Set<string>();
    let tagsCreated = false;

    for (const hashtag of hashtags) {
      // Check if tag already exists
      const existingTag = allTags.find(
        tag => tag.name.toLowerCase() === hashtag.toLowerCase()
      );

      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        // Create new tag with unused color
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

    // Invalidate tags query to refresh the list
    if (tagsCreated) {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    }

    return tagIds;
  };

  const handleSave = async (data: { content: string; tagIds: string[] }) => {
    if (note) {
      // Process hashtags from content
      const hashtagIds = await processHashtags(data.content);

      // Combine manually selected tags with hashtag tags (unique)
      const allTagIds = [...new Set([...selectedTagIds, ...hashtagIds])];

      await updateNote.mutateAsync({
        id: note.id,
        data: {
          content: data.content,
          tagIds: allTagIds,
        },
      });
    }
  };

  const handleCreate = async (data: { date: string; content: string; tagIds: string[] }) => {
    // Process hashtags from content
    const hashtagIds = await processHashtags(data.content);

    // Combine manually selected tags with hashtag tags (unique)
    const allTagIds = [...new Set([...selectedTagIds, ...hashtagIds])];

    await createNote.mutateAsync({
      date: data.date,
      content: data.content,
      tagIds: allTagIds,
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!note) return;

    setShowDeleteDialog(false);
    await deleteNote.mutateAsync(note.id);
    navigate('/calendar');
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  if (noteLoading || tagsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/calendar"
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
              Terug naar kalender
            </Link>

            {note && (
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
                Verwijderen
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            {formatDateNL(dateObj, 'EEEE d MMMM yyyy')}
          </h1>
        </div>

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
              Nog geen tags. <Link to="/tags" className="text-primary-600 hover:underline">Maak er één aan</Link>
            </div>
          )}
        </div>

        {/* Editor Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <MarkdownEditor
            note={note}
            date={date}
            onSave={handleSave}
            onCreate={handleCreate}
            onSaveComplete={handleSaveComplete}
          />
        </div>

        {/* Helper text */}
        <div className="mt-4 text-sm text-gray-500 text-center space-y-1">
          <p>💡 Je notitie wordt elke 30 seconden automatisch opgeslagen, of gebruik de "Opslaan" knop</p>
          <p>🏷️ Gebruik #hashtags in je notitie om automatisch tags aan te maken met unieke kleuren</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Notitie verwijderen?"
        message="Weet je zeker dat je deze notitie wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        confirmText="Verwijderen"
        cancelText="Annuleren"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger={true}
      />
    </div>
  );
}
