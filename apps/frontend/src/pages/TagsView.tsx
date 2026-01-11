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
      // 409 = tag is still in use
      if (error.response?.status === 409) {
        setDeleteError('This tag is still in use. Remove it from all notes before deleting.');
      } else {
        // Try to get error message from response
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error deleting tag';
        setDeleteError(errorMessage);
      }
      // Don't close the dialog so user can see the error
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 dark:from-cream-50 dark:to-cream-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center font-body text-sm text-charcoal-700 dark:text-charcoal-700 hover:text-terracotta-600 mb-4 transition-colors"
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

          <h1 className="font-display text-5xl font-bold text-charcoal-900 dark:text-charcoal-900 mb-3 tracking-tight">Manage Tags</h1>
          <p className="font-body text-charcoal-700 dark:text-charcoal-700">Organize your notes with tags</p>
        </div>

        {/* Create Tag */}
        <div className="bg-white dark:bg-cream-100 rounded-xl shadow-soft p-8 mb-6">
          <h2 className="font-display text-2xl font-bold text-charcoal-900 dark:text-charcoal-900 mb-6">Create new tag</h2>
          <TagInput />
        </div>

        {/* Tags List */}
        <div className="bg-white dark:bg-cream-100 rounded-xl shadow-soft p-8">
          <h2 className="font-display text-2xl font-bold text-charcoal-900 dark:text-charcoal-900 mb-6">
            Your tags ({tags.length})
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-cream-100 dark:bg-charcoal-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <p className="font-body text-charcoal-500 text-center py-12">
              No tags yet. Create one above!
            </p>
          ) : (
            <div className="space-y-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="relative overflow-hidden flex items-center bg-cream-100 dark:bg-charcoal-900/20 rounded-lg p-5 hover:shadow-soft transition-all"
                >
                  {/* Color bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg"
                    style={{ backgroundColor: tag.color || '#757570' }}
                  />
                  <div className="pl-4 flex-1">
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
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <h3 className="font-body text-base font-semibold uppercase tracking-wide text-charcoal-900 dark:text-charcoal-900">{tag.name}</h3>
                        <p className="font-mono text-xs text-charcoal-500">{tag.color || 'No color'}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(tag)}
                          className="px-4 py-2 font-body text-sm font-medium text-terracotta-600 hover:bg-terracotta-100 dark:hover:bg-terracotta-100/10 rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tag.id, tag.name)}
                          disabled={deleteTag.isPending}
                          className="px-4 py-2 font-body text-sm font-medium text-priority-high hover:bg-priority-high-bg dark:hover:bg-priority-high/10 rounded-lg disabled:opacity-50 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
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
