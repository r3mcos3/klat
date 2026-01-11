import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { formatDateNL } from '@/utils/dateHelpers';
import type { Note } from '@klat/types';

interface KanbanCardProps {
  note: Note;
  isDragging?: boolean;
  onDelete?: (note: Note) => void;
}

export function KanbanCard({ note, isDragging = false, onDelete }: KanbanCardProps) {
  const navigate = useNavigate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get accent color based on importance
  const getAccentColor = () => {
    if (note.importance === 'HIGH') return '#ff4757'; // priority-high
    if (note.importance === 'MEDIUM') return '#ffa502'; // priority-medium
    if (note.importance === 'LOW') return '#00d9ff'; // priority-low
    return '#3a4049'; // border-default
  };

  // Get preview text
  const getPreviewText = (content: string, maxLength: number = 120): string => {
    const stripped = content
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^[-*+]\s/gm, '')
      .trim();

    if (stripped.length > maxLength) {
      return stripped.substring(0, maxLength) + '...';
    }
    return stripped;
  };

  // Format date
  const dateObj = (() => {
    try {
      const dateStr = note.date.includes('T') ? note.date.split('T')[0] : note.date;
      return new Date(dateStr + 'T12:00:00Z');
    } catch {
      return new Date();
    }
  })();

  const handleClick = () => {
    navigate(`/note/${note.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(note);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-tertiary rounded-lg border border-default p-4 cursor-grab active:cursor-grabbing
        transition-all duration-200 relative overflow-hidden group
        ${isDragging || isSortableDragging ? 'opacity-50 shadow-dark-lg scale-105' : 'hover:shadow-dark hover:border-accent-primary'}
      `}
      onClick={handleClick}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: getAccentColor() }}
      />

      {/* Card Content */}
      <div className="pl-3">
        {/* Date */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-xs text-secondary">
            {formatDateNL(dateObj, 'd MMM yyyy')}
          </div>
          <button
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-priority-high/20 hover:text-priority-high transition-all"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Content Preview */}
        {note.content.trim() && (
          <p className="text-sm text-primary mb-3 line-clamp-3 leading-relaxed">
            {getPreviewText(note.content)}
          </p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.slice(0, 3).map((tag: any) => (
              <span
                key={tag.id}
                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: tag.color ? `${tag.color}40` : 'rgba(100, 116, 139, 0.1)',
                  border: `1px solid ${tag.color ? `${tag.color}80` : 'rgb(100, 116, 139)'}`,
                  color: tag.color || 'rgb(100, 116, 139)',
                }}
              >
                {tag.name}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-tertiary">+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Priority Badge */}
        {note.importance && (
          <div className="flex items-center gap-1">
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
              style={{
                backgroundColor: getAccentColor() + '20',
                color: getAccentColor(),
              }}
            >
              {note.importance}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
