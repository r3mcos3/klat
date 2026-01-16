import { Link, useNavigate } from 'react-router-dom';
import { useAllNotes, useUpdateNote, useDeleteNote } from '@/hooks/useNotes';
import { useAllTags } from '@/hooks/useTags';
import { formatDateNL } from '@/utils/dateHelpers';
import { extractImageUrlsFromMarkdown } from '@/utils/imageHelpers';
import { handleImageDragStart } from '@/utils/dragHelpers';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { LiveDateTime } from '@/components/Common/LiveDateTime';
import { ThemeToggle } from '@/components/Common/ThemeToggle';
import { MultiSelect } from '@/components/Common/MultiSelect';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import type { Note } from '@klat/types';

export function CardStackView() {
  const { data: notes = [], isLoading, error } = useAllNotes();
  const { data: allTags = [] } = useAllTags();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'>('ALL');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper function to safely parse dates (handles both YYYY-MM-DD and full ISO timestamps)
  const parseNoteDate = (dateStr: string): number => {
    try {
      // If it's just YYYY-MM-DD format, append midnight time
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dateStr + 'T00:00:00Z').getTime();
      }
      // Otherwise parse as-is (full ISO timestamp)
      return new Date(dateStr).getTime();
    } catch {
      return 0; // Fallback for invalid dates
    }
  };

  // First apply search/priority/tag filters to all notes
  const baseFilteredNotes = [...notes].filter((note) => {
    // Filter by search query (search in content AND tag names)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const contentMatch = note.content.toLowerCase().includes(query);
      const tagMatch = note.tags?.some((tag: any) =>
        tag.name.toLowerCase().includes(query)
      ) || false;
      if (!contentMatch && !tagMatch) return false;
    }

    // Filter by priority
    if (priorityFilter !== 'ALL') {
      if (priorityFilter === 'NONE') {
        if (note.importance) return false;
      } else {
        if (note.importance !== priorityFilter) return false;
      }
    }

    // Filter by tags
    if (selectedTagIds.length > 0) {
      const noteTagIds = note.tags?.map((t: any) => t.id) || [];
      const hasSelectedTag = selectedTagIds.some(tagId => noteTagIds.includes(tagId));
      if (!hasSelectedTag) return false;
    }

    return true;
  });

  // Then filter by active tab and sort
  const filteredAndSortedNotes = baseFilteredNotes
    .filter((note) => {
      // Filter by active tab
      if (activeTab === 'active') {
        return !note.completedAt;
      } else {
        return !!note.completedAt;
      }
    })
    // Sort notes: by completion, in progress status, importance, then date
    .sort((a, b) => {
      // First, sort by completion status (uncompleted first)
      const aCompleted = !!a.completedAt;
      const bCompleted = !!b.completedAt;

      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1; // Uncompleted comes before completed
      }

      // For uncompleted notes, sort by in progress status first
      if (!aCompleted && !bCompleted) {
        const aInProgress = !!a.inProgress;
        const bInProgress = !!b.inProgress;

        if (aInProgress !== bInProgress) {
          return aInProgress ? -1 : 1; // In progress comes before not in progress
        }

        // Then sort by importance level
        const importanceOrder: { [key: string]: number } = {
          'HIGH': 1,
          'MEDIUM': 2,
          'LOW': 3,
          '': 4, // No importance
        };

        const aImportance = importanceOrder[a.importance || ''];
        const bImportance = importanceOrder[b.importance || ''];

        if (aImportance !== bImportance) {
          return aImportance - bImportance; // Lower number (higher priority) comes first
        }
      }

      // Then sort by date (newest first) within each group
      return parseNoteDate(b.date) - parseNoteDate(a.date);
    });

  // Auto-switch to tab with results when filtering
  useEffect(() => {
    // Only auto-switch if filters are active
    if (searchQuery || priorityFilter !== 'ALL' || selectedTagIds.length > 0) {
      const activeCount = baseFilteredNotes.filter(n => !n.completedAt).length;
      const completedCount = baseFilteredNotes.filter(n => n.completedAt).length;

      // Switch to tab with results if current tab is empty
      if (activeTab === 'active' && activeCount === 0 && completedCount > 0) {
        setActiveTab('completed');
      } else if (activeTab === 'completed' && completedCount === 0 && activeCount > 0) {
        setActiveTab('active');
      }
    }
  }, [searchQuery, priorityFilter, selectedTagIds, baseFilteredNotes, activeTab]);

  const handleToggleDone = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const newCompletedAt = note.completedAt ? null : new Date().toISOString();

    await updateNote.mutateAsync({
      id: note.id,
      data: {
        completedAt: newCompletedAt,
      },
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setNoteToDelete(note);
  };

  const handleDeleteConfirm = async () => {
    if (noteToDelete) {
      await deleteNote.mutateAsync(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const handleImportanceChange = async (e: React.MouseEvent, note: Note, level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    e.stopPropagation();
    // Toggle: if clicking the same level, clear it (set to null)
    const newImportance = note.importance === level ? null : level;
    await updateNote.mutateAsync({
      id: note.id,
      data: {
        importance: newImportance,
      },
    });
  };

  // Get preview text (strip markdown and truncate)
  const getPreviewText = (content: string, maxLength: number = 150): string => {
    // Remove markdown formatting
    const stripped = content
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/^[-*+]\s/gm, '') // Remove list markers
      .trim();

    // Truncate
    if (stripped.length > maxLength) {
      return stripped.substring(0, maxLength) + '...';
    }
    return stripped;
  };

  const handleCardClick = (note: Note) => {
    navigate(`/note/${note.id}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error loading notes</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold text-primary tracking-tight">klat</h1>
            <p className="font-body text-secondary mt-2">Your Personal Notes</p>
          </div>

          {/* Live Clock & Date - Hidden on mobile */}
          <div className="hidden md:block">
            <LiveDateTime />
          </div>

          <div className="flex gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 font-body text-sm font-medium text-primary bg-secondary border border-default rounded-lg hover:bg-accent-primary-subtle hover:text-accent-primary hover:border-accent-primary flex items-center gap-2 shadow-dark transition-all"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden md:inline">Logout</span>
            </button>
            <Link
              to="/note/new"
              className="px-4 py-2 font-body text-sm font-medium text-white bg-accent-primary rounded-lg hover:bg-accent-primary-hover flex items-center gap-2 shadow-dark transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New note
            </Link>
            <Link
              to="/tags"
              className="px-4 py-2 font-body text-sm font-medium text-primary bg-secondary border border-default rounded-lg hover:bg-accent-primary-subtle hover:text-accent-primary hover:border-accent-primary flex items-center gap-2 shadow-dark transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Tags
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`
              flex-1 px-6 py-4 rounded-xl font-body font-semibold transition-all
              ${activeTab === 'active'
                ? 'bg-accent-primary text-white shadow-dark-lg'
                : 'bg-secondary text-primary hover:bg-accent-primary-subtle border border-default shadow-dark'}
            `}
          >
            Active Notes
            {baseFilteredNotes.filter(n => !n.completedAt).length > 0 && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'active' ? 'bg-accent-primary-hover' : 'bg-tertiary'}`}>
                {baseFilteredNotes.filter(n => !n.completedAt).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`
              flex-1 px-6 py-4 rounded-xl font-body font-semibold transition-all
              ${activeTab === 'completed'
                ? 'bg-accent-primary text-white shadow-dark-lg'
                : 'bg-secondary text-primary hover:bg-accent-primary-subtle border border-default shadow-dark'}
            `}
          >
            Completed
            {baseFilteredNotes.filter(n => n.completedAt).length > 0 && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'completed' ? 'bg-accent-primary-hover' : 'bg-tertiary'}`}>
                {baseFilteredNotes.filter(n => n.completedAt).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-secondary rounded-xl shadow-dark p-6 mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
            {/* Search Input */}
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
                  className="w-full pl-10 pr-4 py-2 border border-default rounded-md bg-secondary text-primary placeholder-tertiary focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
              className="px-3 py-2 border border-default rounded-md bg-secondary text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent [&>option]:bg-secondary [&>option]:text-primary"
            >
              <option value="ALL" style={{ backgroundColor: '#132f4c', color: '#e3f2fd' }}>All Priorities</option>
              <option value="HIGH" style={{ backgroundColor: '#132f4c', color: '#e3f2fd' }}>🔴 High</option>
              <option value="MEDIUM" style={{ backgroundColor: '#132f4c', color: '#e3f2fd' }}>🟡 Medium</option>
              <option value="LOW" style={{ backgroundColor: '#132f4c', color: '#e3f2fd' }}>🔵 Low</option>
              <option value="NONE" style={{ backgroundColor: '#132f4c', color: '#e3f2fd' }}>No Priority</option>
            </select>

            {/* Tag Filter */}
            <MultiSelect
              options={allTags.map((tag: any) => ({
                value: tag.id,
                label: tag.name,
              }))}
              selectedValues={selectedTagIds}
              onChange={setSelectedTagIds}
              placeholder="Tags..."
            />

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('ALL');
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedNotes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You don't have any notes yet</p>
            <Link
              to="/note/new"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Write your first note
            </Link>
          </div>
        )}

        {/* Card Stack */}
        {!isLoading && filteredAndSortedNotes.length > 0 && (
          <div className="relative">
            <div className="flex flex-col space-y-6">
              {filteredAndSortedNotes.map((note, _index) => {
                // Safely parse date (handles both YYYY-MM-DD and full ISO timestamps)
                const dateObj = (() => {
                  try {
                    const dateStr = note.date.includes('T') ? note.date.split('T')[0] : note.date;
                    return new Date(dateStr + 'T12:00:00Z');
                  } catch {
                    return new Date(); // Fallback to today
                  }
                })();
                const hasContent = note.content.trim().length > 0;

                // Get accent bar color based on importance/completion
                const getAccentColor = () => {
                  if (note.completedAt) return '#10b981'; // success
                  if (note.importance === 'HIGH') return '#ff4757'; // priority-high (bright red)
                  if (note.importance === 'MEDIUM') return '#ffa502'; // priority-medium (bright orange)
                  if (note.importance === 'LOW') return '#00d9ff'; // priority-low (cyan)
                  return 'rgb(71, 85, 105)'; // neutral slate
                };

                return (
                  <div
                    key={note.id}
                    className="relative"
                  >
                    <div
                      onClick={() => handleCardClick(note)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCardClick(note);
                        }
                      }}
                      className={`
                        w-full rounded-xl shadow-dark hover:shadow-dark-lg transition-all duration-300 p-8 hover:-translate-y-1 text-left
                        relative overflow-hidden
                        ${note.completedAt ? 'bg-success-bg' : 'bg-secondary'}
                      `}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ backgroundColor: getAccentColor() }}
                      />
                      {/* Date & Done Toggle */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-display text-[32px] font-bold text-primary leading-none">
                              {formatDateNL(dateObj, 'EEEE d MMMM yyyy')}
                            </h3>
                            {note.completedAt && (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs font-bold">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                DONE
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {note.createdAt && (() => {
                              try {
                                // Parse ISO timestamp
                                const date = new Date(note.createdAt);
                                if (isNaN(date.getTime())) {
                                  console.warn('Invalid createdAt date:', note.createdAt);
                                  return null;
                                }
                                return (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Created: {formatDateNL(date, 'd MMM yyyy HH:mm')}
                                  </span>
                                );
                              } catch (error) {
                                console.error('Error parsing createdAt:', error, note.createdAt);
                                return null;
                              }
                            })()}
                            {note.updatedAt && (() => {
                              try {
                                // Parse ISO timestamp
                                const date = new Date(note.updatedAt);
                                if (isNaN(date.getTime())) {
                                  console.warn('Invalid updatedAt date:', note.updatedAt);
                                  return null;
                                }
                                return (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Updated: {formatDateNL(date, 'd MMM yyyy HH:mm')}
                                  </span>
                                );
                              } catch (error) {
                                console.error('Error parsing updatedAt:', error, note.updatedAt);
                                return null;
                              }
                            })()}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                              onClick={(e) => handleToggleDone(e, note)}
                              className={`
                                p-2 rounded-full transition-all border
                                ${note.completedAt
                                  ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700'
                                  : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-700'}
                              `}
                              title={note.completedAt ? "Mark as incomplete" : "Mark as completed"}
                            >
                              {note.completedAt ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>

                            <button
                              onClick={(e) => handleDeleteClick(e, note)}
                              className="p-2 rounded-full text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-all"
                              title="Delete note"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateNote.mutateAsync({
                                  id: note.id,
                                  data: { inProgress: !note.inProgress }
                                });
                              }}
                              className={`
                                p-2 rounded-full transition-all border
                                ${note.inProgress
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                  : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700'}
                              `}
                              title={note.inProgress ? "Mark as not in progress" : "Mark as in progress"}
                            >
                              {note.inProgress ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                          </div>
                      </div>

                      {/* Content Preview */}
                      {hasContent && (
                        <p className="font-body text-[15px] leading-[1.7] text-secondary mb-6 whitespace-pre-line overflow-hidden" style={{ maxHeight: '9rem' }}>
                          {getPreviewText(note.content)}
                        </p>
                      )}

                      {/* Image Preview */}
                      {(() => {
                        const imageUrls = extractImageUrlsFromMarkdown(note.content);
                        if (imageUrls.length > 0) {
                          const displayImages = imageUrls.slice(0, 3);
                          const remainingCount = imageUrls.length - 3;

                          return (
                            <div className="mb-4">
                              <div className="grid grid-cols-3 gap-2">
                                {displayImages.map((url, index) => (
                                  <div
                                    key={index}
                                    className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                  >
                                    <img
                                      src={url}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-24 object-cover cursor-grab active:cursor-grabbing"
                                      loading="lazy"
                                      draggable="true"
                                      onDragStart={(e) => handleImageDragStart(e, url)}
                                    />
                                    {index === 2 && remainingCount > 0 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center pointer-events-none">
                                        <span className="text-white font-semibold text-sm">
                                          +{remainingCount}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Info Bar (Deadline & Importance) */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {/* Importance Selector */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleImportanceChange(e, note, 'LOW')}
                            className={`p-1.5 rounded transition-all ${note.importance === 'LOW' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'}`}
                            title="Low Importance"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                          </button>
                          <button
                            onClick={(e) => handleImportanceChange(e, note, 'MEDIUM')}
                            className={`p-1.5 rounded transition-all ${note.importance === 'MEDIUM' ? 'bg-white dark:bg-gray-600 shadow text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400'}`}
                            title="Medium Importance"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                          </button>
                          <button
                            onClick={(e) => handleImportanceChange(e, note, 'HIGH')}
                            className={`p-1.5 rounded transition-all ${note.importance === 'HIGH' ? 'bg-white dark:bg-gray-600 shadow text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'}`}
                            title="High Importance"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                          </button>
                        </div>

                        {/* In Progress Banner */}
                        {note.inProgress && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            In Progress
                          </div>
                        )}

                        {/* Deadline */}
                        {note.deadline && (() => {
                          try {
                            const deadlineDate = new Date(note.deadline);
                            if (isNaN(deadlineDate.getTime())) return null;
                            const now = new Date();
                            const isExpired = deadlineDate < now;
                            const deadlineStr = formatDateNL(deadlineDate, 'd MMM yyyy HH:mm');

                            return (
                              <div>
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                    isExpired
                                      ? 'bg-red-100 text-red-700 border border-red-300'
                                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {isExpired ? 'Expired: ' : 'Deadline: '}
                                  {deadlineStr}
                                </div>
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}

                        {/* Completed Date */}
                        {note.completedAt && (() => {
                          try {
                            const completedDate = new Date(note.completedAt);
                            if (isNaN(completedDate.getTime())) return null;
                            return (
                              <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-300"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Done: {formatDateNL(completedDate, 'd MMM yyyy HH:mm')}
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {note.tags.map((tag: any) => (
                            <span
                              key={tag.id}
                              className="font-body text-[12px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full"
                              style={{
                                backgroundColor: tag.color ? `${tag.color}40` : 'rgba(100, 116, 139, 0.1)',
                                border: `1px solid ${tag.color ? `${tag.color}80` : 'rgb(100, 116, 139)'}`,
                                color: tag.color || 'rgb(100, 116, 139)',
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Empty note indicator */}
                      {!hasContent && (
                        <p className="text-gray-400 dark:text-gray-500 italic">No content</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Click a card to edit the note</p>
        </div>
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
    </div>
  );
}
