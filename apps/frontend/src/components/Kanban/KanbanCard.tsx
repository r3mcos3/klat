import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { formatDateNL } from '@/utils/dateHelpers';
import { ImageLightbox } from '@/components/Common/ImageLightbox';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import type { Note } from '@klat/types';

interface KanbanCardProps {
  note: Note;
  isDragging?: boolean;
  onDelete?: (note: Note) => void;
}

export function KanbanCard({ note, isDragging = false, onDelete }: KanbanCardProps) {
  const navigate = useNavigate();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

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
    if (note.importance === 'HIGH') return '#ff6b6b'; // priority-high
    if (note.importance === 'MEDIUM') return '#ffa726'; // priority-medium
    if (note.importance === 'LOW') return '#4fc3f7'; // priority-low
    return '#1e4976'; // border-default
  };

  // Get deadline info for banner
  const getDeadlineInfo = () => {
    if (!note.deadline) return null;

    try {
      const deadlineDate = new Date(note.deadline);
      if (isNaN(deadlineDate.getTime())) return null;

      const now = new Date();
      const isOverdue = isPast(deadlineDate) && !isToday(deadlineDate);
      const isDueToday = isToday(deadlineDate);
      const isDueTomorrow = isTomorrow(deadlineDate);
      const daysUntil = differenceInDays(deadlineDate, now);

      let status: 'overdue' | 'today' | 'tomorrow' | 'soon' | 'normal';
      let label: string;
      let bgColor: string;
      let textColor: string;
      let icon: string;

      if (isOverdue) {
        status = 'overdue';
        label = 'Overdue';
        bgColor = 'bg-priority-high/20';
        textColor = 'text-priority-high';
        icon = '⚠️';
      } else if (isDueToday) {
        status = 'today';
        label = 'Due today';
        bgColor = 'bg-priority-high/20';
        textColor = 'text-priority-high';
        icon = '🔥';
      } else if (isDueTomorrow) {
        status = 'tomorrow';
        label = 'Due tomorrow';
        bgColor = 'bg-priority-medium/20';
        textColor = 'text-priority-medium';
        icon = '⏰';
      } else if (daysUntil <= 7) {
        status = 'soon';
        label = `${daysUntil} days left`;
        bgColor = 'bg-priority-medium/20';
        textColor = 'text-priority-medium';
        icon = '📅';
      } else {
        status = 'normal';
        label = formatDateNL(deadlineDate, 'd MMM');
        bgColor = 'bg-accent-primary/10';
        textColor = 'text-accent-primary';
        icon = '📅';
      }

      return {
        date: deadlineDate,
        status,
        label,
        bgColor,
        textColor,
        icon,
        formattedDateTime: formatDateNL(deadlineDate, 'd MMM HH:mm'),
      };
    } catch {
      return null;
    }
  };

  const deadlineInfo = getDeadlineInfo();

  // Extract image URLs from markdown
  const getImageUrls = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = [...content.matchAll(imageRegex)];
    return matches.map(match => match[1]).filter(url => url);
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

  const imageUrls = getImageUrls(note.content);

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

  const handleImageClick = (e: React.MouseEvent, url: string, index: number) => {
    e.stopPropagation();
    setLightboxImage(url);
    setLightboxIndex(index);
  };

  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? lightboxIndex - 1 : lightboxIndex + 1;
    if (newIndex >= 0 && newIndex < imageUrls.length) {
      setLightboxIndex(newIndex);
      setLightboxImage(imageUrls[newIndex]);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          bg-tertiary rounded-lg border border-default p-4 cursor-grab active:cursor-grabbing
          transition-all duration-200 relative overflow-hidden group backdrop-blur-sm
          ${isDragging || isSortableDragging ? 'opacity-50 shadow-ocean-lg scale-105' : 'hover:shadow-ocean hover:border-accent-primary hover:glow-cyan'}
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

        {/* Deadline Banner */}
        {deadlineInfo && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md mb-2 ${deadlineInfo.bgColor}`}>
            <span className="text-xs">{deadlineInfo.icon}</span>
            <span className={`text-xs font-medium ${deadlineInfo.textColor}`}>
              {deadlineInfo.label}
            </span>
            <span className={`text-[10px] ${deadlineInfo.textColor} opacity-75 ml-auto`}>
              {deadlineInfo.formattedDateTime}
            </span>
          </div>
        )}

        {/* Content Preview */}
        {note.content.trim() && (
          <p className="text-sm text-primary mb-3 line-clamp-3 leading-relaxed">
            {getPreviewText(note.content)}
          </p>
        )}

        {/* Image Previews */}
        {imageUrls.length > 0 && (
          <div className="mb-3 flex gap-1 overflow-hidden">
            {imageUrls.slice(0, 3).map((url, index) => (
              <button
                key={index}
                onClick={(e) => handleImageClick(e, url, index)}
                className="relative w-16 h-16 rounded border border-border-default overflow-hidden flex-shrink-0 hover:border-accent-primary hover:shadow-glow transition-all cursor-pointer group"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </button>
            ))}
            {imageUrls.length > 3 && (
              <button
                onClick={(e) => handleImageClick(e, imageUrls[3], 3)}
                className="w-16 h-16 rounded border border-border-default bg-elevated flex items-center justify-center text-xs text-secondary font-mono hover:border-accent-primary hover:text-accent-primary transition-all cursor-pointer"
              >
                +{imageUrls.length - 3}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.slice(0, 3).map((tag) => (
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

    {/* Image Lightbox - Rendered at document body level */}
    {lightboxImage && createPortal(
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
        allImages={imageUrls}
        currentIndex={lightboxIndex}
        onNavigate={handleLightboxNavigate}
      />,
      document.body
    )}
    </>
  );
}
