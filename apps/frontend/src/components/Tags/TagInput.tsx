import { useState, useEffect } from 'react';
import { useCreateTag, useAllTags } from '@/hooks/useTags';
import { getUnusedColor, getAvailableColors, isColorTooClose } from '@/utils/colorHelpers';

export function TagInput() {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isOpen, setIsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const createTag = useCreateTag();
  const { data: allTags = [] } = useAllTags();

  // Get smart color suggestion when opening the form
  useEffect(() => {
    if (isOpen && allTags.length > 0) {
      const suggestedColor = getUnusedColor(allTags.map(t => t.color));
      setColor(suggestedColor);
    }
  }, [isOpen, allTags]);

  // Check if color is too close to existing colors
  useEffect(() => {
    const existingColors = allTags.map(t => t.color);
    setShowWarning(isColorTooClose(color, existingColors));
  }, [color, allTags]);

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
        className="px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/50"
      >
        + New tag
      </button>
    );
  }

  const availableColors = getAvailableColors(allTags.map(t => t.color));

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tag name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            autoFocus
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-700"
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
            setShowWarning(false);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>

      {/* Color warning */}
      {showWarning && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              This color is very similar to an existing tag
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Consider choosing a different color for better visual distinction
            </p>
          </div>
        </div>
      )}

      {/* Suggested colors */}
      {availableColors.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Suggested colors (distinct from existing tags):
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((suggestedColor) => (
              <button
                key={suggestedColor}
                type="button"
                onClick={() => setColor(suggestedColor)}
                className={`w-8 h-8 rounded-md border-2 transition-all ${
                  color === suggestedColor
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
                style={{ backgroundColor: suggestedColor }}
                title={suggestedColor}
              />
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
