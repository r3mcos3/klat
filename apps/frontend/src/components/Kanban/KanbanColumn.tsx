import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Note } from '@klat/types';

interface Column {
  id: string;
  title: string;
  notes: Note[];
}

interface KanbanColumnProps {
  column: Column;
  onDelete: (note: Note) => void;
}

export function KanbanColumn({ column, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnColors = {
    todo: {
      border: 'border-accent-primary',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      header: 'bg-accent-primary/10',
      icon: 'text-accent-primary',
    },
    inProgress: {
      border: 'border-priority-medium',
      glow: 'shadow-[0_0_20px_rgba(255,167,38,0.3)]',
      header: 'bg-priority-medium/10',
      icon: 'text-priority-medium',
    },
    done: {
      border: 'border-success',
      glow: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]',
      header: 'bg-success/10',
      icon: 'text-success',
    },
  };

  const colors = columnColors[column.id as keyof typeof columnColors] || columnColors.todo;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-secondary rounded-xl border-2 ${colors.border} ${isOver ? colors.glow : 'shadow-ocean'} transition-all duration-300 min-h-[600px] backdrop-blur-sm`}
    >
      {/* Column Header */}
      <div className={`p-4 ${colors.header} border-b-2 ${colors.border} rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-primary uppercase tracking-wide">
            {column.title}
          </h3>
          <span className="bg-tertiary text-secondary px-3 py-1 rounded-full text-sm font-mono font-semibold">
            {column.notes.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <SortableContext items={column.notes.map(n => n.id)} strategy={verticalListSortingStrategy}>
          {column.notes.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-tertiary text-sm italic">
              Drop cards here
            </div>
          ) : (
            column.notes.map((note) => (
              <KanbanCard key={note.id} note={note} onDelete={onDelete} />
            ))
          )}
        </SortableContext>
        {/* Extra space to ensure droppable area even when full */}
        {column.notes.length > 0 && <div className="h-20" />}
      </div>
    </div>
  );
}
