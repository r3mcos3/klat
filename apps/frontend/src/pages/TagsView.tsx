import { Link } from 'react-router-dom';
import { TagInput } from '@/components/Tags/TagInput';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { useAllTags, useDeleteTag } from '@/hooks/useTags';
import { useState } from 'react';

export function TagsView() {
  const { data: tags = [], isLoading } = useAllTags();
  const deleteTag = useDeleteTag();
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteError('');
    setTagToDelete({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag.mutateAsync(tagToDelete.id);
      setTagToDelete(null);
      setDeleteError('');
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || 'Error deleting tag');
    }
  };

  const handleDeleteCancel = () => {
    setTagToDelete(null);
    setDeleteError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
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
            Back to overview
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Tags</h1>
          <p className="text-gray-600">Organize your notes with tags</p>
        </div>

        {/* Create Tag */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create new tag</h2>
          <TagInput />
        </div>

        {/* Tags List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your tags ({tags.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No tags yet. Create one above!
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
                      <p className="text-sm text-gray-500">{tag.color || 'No color'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteClick(tag.id, tag.name)}
                    disabled={deleteTag.isPending}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!tagToDelete}
        title="Delete tag?"
        message={
          deleteError
            ? deleteError
            : `Are you sure you want to delete the tag "${tagToDelete?.name}"?${
                tags.find((t) => t.id === tagToDelete?.id)?._count?.notes
                  ? ' This tag is still in use in notes.'
                  : ''
              }`
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger={true}
      />
    </div>
  );
}
