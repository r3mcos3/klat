import type { Tag } from '@klat/types';

interface TagListProps {
  tags: Tag[];
  selectedTags?: string[];
  onToggle?: (tagId: string) => void;
  readonly?: boolean;
}

export function TagList({ tags, selectedTags = [], onToggle, readonly = false }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">Geen tags beschikbaar</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);

        return (
          <button
            key={tag.id}
            onClick={() => onToggle && onToggle(tag.id)}
            disabled={readonly}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}
              ${
                isSelected
                  ? 'ring-2 ring-offset-1'
                  : readonly
                  ? ''
                  : 'hover:ring-1 hover:ring-gray-300'
              }
            `}
            style={{
              backgroundColor: tag.color ? `${tag.color}30` : '#E5E7EB',
              color: tag.color || '#374151',
              ringColor: tag.color,
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
