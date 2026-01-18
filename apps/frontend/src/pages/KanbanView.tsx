import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAllNotes, useUpdateNote, useDeleteNote, useDeleteCompletedNotes } from '@/hooks/useNotes';
import { useAllTags } from '@/hooks/useTags';
import { ThemeToggle } from '@/components/Common/ThemeToggle';
import { LiveDateTime } from '@/components/Common/LiveDateTime';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';
import { KanbanCard } from '@/components/Kanban/KanbanCard';
import { KanbanColumn } from '@/components/Kanban/KanbanColumn';
import type { Note } from '@klat/types';

type ColumnId = 'todo' | 'inProgress' | 'done';

interface Column {
  id: ColumnId;
  title: string;
  notes: Note[];
}

export function KanbanView() {
  const { data: allNotes = [], isLoading } = useAllNotes();
  const { data: allTags = [] } = useAllTags();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const deleteCompletedNotes = useDeleteCompletedNotes();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTagSelection = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter notes
  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!note.content.toLowerCase().includes(query)) return false;
      }

      // Tag filter
      if (selectedTagIds.length > 0) {
        const noteTagIds = note.tags?.map((t: any) => t.id) || [];
        const hasSelectedTag = selectedTagIds.some(tagId => noteTagIds.includes(tagId));
        if (!hasSelectedTag) return false;
      }

      return true;
    });
  }, [allNotes, searchQuery, selectedTagIds]);

  // Organize notes into columns
  const columns: Column[] = useMemo(() => {
    const todo = filteredNotes.filter(note => !note.inProgress && !note.completedAt);
    const inProgress = filteredNotes.filter(note => note.inProgress && !note.completedAt);
    const done = filteredNotes.filter(note => note.completedAt);

    return [
      { id: 'todo', title: 'To Do', notes: todo },
      { id: 'inProgress', title: 'In Progress', notes: inProgress },
      { id: 'done', title: 'Done', notes: done },
    ];
  }, [filteredNotes]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const noteId = active.id as string;
    let targetColumnId = over.id as string;

    // If dropped on a note instead of column, find which column that note is in
    const validColumnIds = ['todo', 'inProgress', 'done'];
    if (!validColumnIds.includes(targetColumnId)) {
      // over.id is a note ID, find which column it belongs to
      const targetNote = allNotes.find(n => n.id === targetColumnId);
      if (targetNote) {
        // Determine column based on note status
        if (targetNote.completedAt) {
          targetColumnId = 'done';
        } else if (targetNote.inProgress) {
          targetColumnId = 'inProgress';
        } else {
          targetColumnId = 'todo';
        }
      } else {
        return; // Invalid drop target
      }
    }

    // Find the note being dragged
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return;

    // Determine new status based on target column
    let updates: Partial<Note> = {};

    if (targetColumnId === 'todo') {
      updates = { inProgress: false, completedAt: null };
    } else if (targetColumnId === 'inProgress') {
      updates = { inProgress: true, completedAt: null };
    } else if (targetColumnId === 'done') {
      updates = { inProgress: false, completedAt: new Date().toISOString() };
    }

    // Update note
    await updateNote.mutateAsync({
      id: noteId,
      data: updates,
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteClick = (note: Note) => {
    setNoteToDelete(note);
  };

  const handleDeleteConfirm = async () => {
    if (noteToDelete) {
      await deleteNote.mutateAsync(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const handleDeleteAllCompleted = async () => {
    await deleteCompletedNotes.mutateAsync();
    setShowDeleteAllConfirm(false);
  };

  const doneCount = useMemo(() => {
    return allNotes.filter(note => note.completedAt).length;
  }, [allNotes]);

  const activeNote = activeId ? allNotes.find(n => n.id === activeId) : null;

  return (
    <div className="min-h-screen bg-primary relative z-10">
      <div className="container mx-auto px-4 py-6 max-w-[1800px]">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold text-primary tracking-tight">klat</h1>
            <p className="font-body text-secondary mt-2">Kanban Board</p>
          </div>

          <div className="hidden md:block">
            <LiveDateTime />
          </div>

          <div className="flex gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 font-body text-sm font-medium text-primary bg-secondary border border-default rounded-lg hover:bg-accent-primary-subtle hover:text-accent-primary hover:border-accent-primary flex items-center gap-2 shadow-ocean transition-all"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">Logout</span>
            </button>
            <Link
              to="/note/new"
              className="px-4 py-2 font-body text-sm font-medium text-bg-primary bg-accent-primary rounded-lg hover:bg-accent-primary-hover hover:shadow-glow flex items-center gap-2 shadow-ocean transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New note
            </Link>
            <Link
              to="/tags"
              className="px-4 py-2 font-body text-sm font-medium text-primary bg-secondary border border-default rounded-lg hover:bg-accent-primary-subtle hover:text-accent-primary hover:border-accent-primary flex items-center gap-2 shadow-ocean transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tags
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-secondary rounded-xl shadow-ocean p-6 mb-8 border border-border-subtle">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-accent-primary/30 rounded-lg bg-bg-tertiary text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary font-body transition-all hover:border-accent-primary/50 hover:bg-bg-elevated"
                />
              </div>
            </div>

            <div className="relative" ref={tagDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="px-3 py-2.5 border-2 border-accent-primary/30 rounded-lg bg-bg-tertiary text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary min-w-[150px] font-body transition-all hover:border-accent-primary/50 hover:bg-bg-elevated flex items-center justify-between gap-2"
              >
                <span>{selectedTagIds.length > 0 ? `${selectedTagIds.length} selected` : 'Tags...'}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {selectedTagIds.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedTagIds.length}
                </span>
              )}
              {isTagDropdownOpen && (
                <div
                  className="absolute z-50 mt-1 w-full rounded-lg max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: '#1e3a5f',
                    border: '1px solid #163454',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {allTags.length === 0 ? (
                    <div className="p-3 text-sm text-text-secondary">No tags available</div>
                  ) : (
                    <ul style={{ margin: 0, padding: '0.25rem 0', listStyle: 'none' }}>
                      {allTags.map((tag: any) => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                          <li key={tag.id}>
                            <button
                              type="button"
                              onClick={() => toggleTagSelection(tag.id)}
                              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 border-none cursor-pointer transition-colors"
                              style={{
                                backgroundColor: isSelected ? '#06b6d4' : '#1e3a5f',
                                color: isSelected ? '#ffffff' : '#e3f2fd',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = '#2c5282';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.backgroundColor = '#1e3a5f';
                              }}
                            >
                              <div
                                className="w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0"
                                style={{
                                  borderColor: isSelected ? '#ffffff' : '#e3f2fd',
                                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                                }}
                              >
                                {isSelected && (
                                  <svg width="12" height="12" fill="none" stroke="#06b6d4" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span>{tag.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTagIds([]);
              }}
              className="px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary rounded-md transition-colors flex items-center gap-1"
              title="Clear all filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden md:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto" />
              <p className="mt-4 text-secondary">Loading...</p>
            </div>
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onDelete={handleDeleteClick}
                  onDeleteAll={column.id === 'done' ? () => setShowDeleteAllConfirm(true) : undefined}
                  onAddNote={column.id === 'todo' ? () => navigate('/note/new') : undefined}
                />
              ))}
            </div>

            <DragOverlay>
              {activeNote ? (
                <div className="rotate-3 opacity-80">
                  <KanbanCard note={activeNote} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="Delete note?"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNoteToDelete(null)}
        danger={true}
      />

      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        title="Delete all completed notes?"
        message={`Are you sure you want to delete all ${doneCount} completed notes? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={handleDeleteAllCompleted}
        onCancel={() => setShowDeleteAllConfirm(false)}
        danger={true}
      />
    </div>
  );
}
