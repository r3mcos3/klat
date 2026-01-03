import { Link } from 'react-router-dom';
import { TagInput } from '@/components/Tags/TagInput';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { useAllTags, useDeleteTag, useUpdateTag } from '@/hooks/useTags';
import { useState } from 'react';
import type { Tag } from '@klat/types';

export function TagsView() {
  const { data: tags = [], isLoading } = useAllTags();
  const deleteTag = useDeleteTag();
  const updateTag = useUpdateTag();
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

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

  const handleEditClick = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color || '');
  };

  const handleEditCancel = () => {
    setEditingTag(null);
    setEditName('');
    setEditColor('');
  };

  const handleEditSave = async () => {
    if (!editingTag || !editName.trim()) return;

    try {
      await updateTag.mutateAsync({
        id: editingTag.id,
        data: {
          name: editName.trim(),
          color: editColor || undefined,
        },
      });
      setEditingTag(null);
      setEditName('');
      setEditColor('');
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Tags</h1>
          <p className="text-gray-600 dark:text-gray-400">Organize your notes with tags</p>
        </div>

        {/* Create Tag */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create new tag</h2>
          <TagInput />
        </div>

        {/* Tags List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your tags ({tags.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No tags yet. Create one above!
            </p>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500"
                >
                  {editingTag?.id === tag.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tag name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Enter tag name"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Color
                          </label>
                          <input
                            type="color"
                            value={editColor || '#E5E7EB'}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-700"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleEditCancel}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditSave}
                          disabled={!editName.trim() || updateTag.isPending}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50"
                        >
                          {updateTag.isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: tag.color || '#E5E7EB' }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{tag.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{tag.color || 'No color'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(tag)}
                          className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tag.id, tag.name)}
                          disabled={deleteTag.isPending}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
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
            : `Are you sure you want to delete the tag "${tagToDelete?.name}"?`
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
