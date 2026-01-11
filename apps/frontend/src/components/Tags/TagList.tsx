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
      <div className="font-body text-sm text-charcoal-500 italic">No tags available</div>
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
              font-body px-3 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-wider transition-all
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-90'}
              ${
                isSelected
                  ? 'ring-2 ring-offset-1'
                  : readonly
                  ? ''
                  : 'hover:ring-1'
              }
            `}
            style={{
              backgroundColor: tag.color ? `${tag.color}40` : '#f8f4ed',
              border: `1px solid ${tag.color ? `${tag.color}80` : '#757570'}`,
              color: tag.color || '#757570',
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
