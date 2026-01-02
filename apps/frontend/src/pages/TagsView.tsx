import { Link } from 'react-router-dom';
import { TagInput } from '@/components/Tags/TagInput';
import { useAllTags, useDeleteTag } from '@/hooks/useTags';

export function TagsView() {
  const { data: tags = [], isLoading } = useAllTags();
  const deleteTag = useDeleteTag();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Weet je zeker dat je de tag "${name}" wilt verwijderen?`)) {
      try {
        await deleteTag.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Fout bij verwijderen van tag');
      }
    }
  };

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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags beheren</h1>
          <p className="text-gray-600">Organiseer je notities met tags</p>
        </div>

        {/* Create Tag */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nieuwe tag aanmaken</h2>
          <TagInput />
        </div>

        {/* Tags List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Je tags ({tags.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nog geen tags. Maak er hierboven één aan!
            </p>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: tag.color || '#E5E7EB' }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{tag.name}</h3>
                      <p className="text-sm text-gray-500">{tag.color || 'Geen kleur'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(tag.id, tag.name)}
                    disabled={deleteTag.isPending}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                  >
                    Verwijderen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
