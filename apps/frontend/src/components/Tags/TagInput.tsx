import { useState } from 'react';
import { useCreateTag } from '@/hooks/useTags';

export function TagInput() {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isOpen, setIsOpen] = useState(false);

  const createTag = useCreateTag();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      await createTag.mutateAsync({ name: name.trim(), color });
      setName('');
      setColor('#3B82F6');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100"
      >
        + New tag
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tag name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Work"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          autoFocus
          maxLength={50}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim() || createTag.isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createTag.isPending ? 'Saving...' : 'Save'}
      </button>

      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          setName('');
          setColor('#3B82F6');
        }}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
    </form>
  );
}
