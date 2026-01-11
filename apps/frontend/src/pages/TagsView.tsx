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
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center font-body text-sm text-secondary hover:text-accent-primary mb-4 transition-colors"
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

          <h1 className="font-display text-5xl font-bold text-primary mb-3 tracking-tight">Manage Tags</h1>
          <p className="font-body text-secondary">Organize your notes with tags</p>
        </div>

        {/* Create Tag */}
        <div className="bg-secondary rounded-xl shadow-ocean p-8 mb-6 border border-border-subtle">
          <h2 className="font-display text-2xl font-bold text-primary mb-6">Create new tag</h2>
          <TagInput />
        </div>

        {/* Tags List */}
        <div className="bg-secondary rounded-xl shadow-ocean p-8 border border-border-subtle">
          <h2 className="font-display text-2xl font-bold text-primary mb-6">
            Your tags ({tags.length})
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-tertiary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <p className="font-body text-tertiary text-center py-12">
              No tags yet. Create one above!
            </p>
          ) : (
            <div className="space-y-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="relative overflow-hidden flex items-center bg-tertiary rounded-lg p-5 border-2 border-border-default hover:shadow-ocean hover:border-accent-primary transition-all"
                >
                  {/* Color bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg"
                    style={{ backgroundColor: tag.color || 'rgb(100, 116, 139)' }}
                  />
                  <div className="pl-4 flex-1">
                  {editingTag?.id === tag.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-body font-medium text-primary mb-1">
                            Tag name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2.5 bg-bg-secondary text-text-primary border-2 border-accent-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary placeholder-text-secondary font-body transition-all hover:border-accent-primary/50 hover:bg-bg-tertiary"
                            placeholder="Enter tag name"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-body font-medium text-primary mb-1">
                            Color
                          </label>
                          <input
                            type="color"
                            value={editColor || '#E5E7EB'}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="w-full h-10 border-2 border-accent-primary/30 rounded-lg cursor-pointer bg-bg-secondary transition-all hover:border-accent-primary/50"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleEditCancel}
                          className="px-4 py-2 text-sm font-body font-medium text-secondary hover:bg-tertiary rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditSave}
                          disabled={!editName.trim() || updateTag.isPending}
                          className="px-4 py-2 text-sm font-body font-medium text-bg-primary bg-accent-primary hover:bg-accent-primary-hover hover:shadow-glow rounded-md disabled:opacity-50 transition-all"
                        >
                          {updateTag.isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <h3 className="font-body text-base font-semibold uppercase tracking-wide text-primary">{tag.name}</h3>
                        <p className="font-mono text-xs text-tertiary">{tag.color || 'No color'}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(tag)}
                          className="px-4 py-2 font-body text-sm font-medium text-accent-primary hover:bg-accent-primary-subtle rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tag.id, tag.name)}
                          disabled={deleteTag.isPending}
                          className="px-4 py-2 font-body text-sm font-medium text-priority-high hover:bg-priority-high/10 rounded-lg disabled:opacity-50 transition-all"
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
