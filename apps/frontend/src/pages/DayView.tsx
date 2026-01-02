import { useParams, Link, useNavigate } from 'react-router-dom';
import { MarkdownEditor } from '@/components/NoteEditor/MarkdownEditor';
import { TagList } from '@/components/Tags/TagList';
import { useNoteByDate, useCreateNote, useUpdateNote } from '@/hooks/useNotes';
import { useAllTags } from '@/hooks/useTags';
import { formatDateNL, stringToDate } from '@/utils/dateHelpers';
import { useState } from 'react';

export function DayView() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  if (!date) {
    return <div>Ongeldige datum</div>;
  }

  const { data: note, isLoading: noteLoading } = useNoteByDate(date);
  const { data: allTags = [], isLoading: tagsLoading } = useAllTags();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const dateObj = stringToDate(date);

  const handleSaveComplete = () => {
    navigate('/calendar');
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async (data: { content: string; tagIds: string[] }) => {
    if (note) {
      await updateNote.mutateAsync({
        id: note.id,
        data: {
          content: data.content,
          tagIds: selectedTagIds,
        },
      });
    }
  };

  const handleCreate = async (data: { date: string; content: string; tagIds: string[] }) => {
    await createNote.mutateAsync({
      date: data.date,
      content: data.content,
      tagIds: selectedTagIds,
    });
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
          <Link
            to="/calendar"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
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
              selectedTags={selectedTagIds.length > 0 ? selectedTagIds : note?.tags?.map((t) => t.id) || []}
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
        <div className="mt-4 text-sm text-gray-500 text-center">
          💡 Je notitie wordt elke 30 seconden automatisch opgeslagen, of gebruik de "Opslaan" knop
        </div>
      </div>
    </div>
  );
}
