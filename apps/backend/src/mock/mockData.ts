// Mock data for development without Supabase connection

export interface MockNote {
  id: string;
  userId: string;
  date: string;
  content: string;
  deadline: string | null;
  completedAt: string | null;
  inProgress: boolean;
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  createdAt: string;
  updatedAt: string;
  tags: MockTag[];
}

export interface MockTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  id: string;
  email: string;
  password: string;
}

// Default mock user
export const mockUsers: MockUser[] = [
  {
    id: 'mock-user-1',
    email: 'demo@example.com',
    password: 'demo123',
  },
];

// Mock tags
export const mockTags: MockTag[] = [
  {
    id: 'tag-1',
    userId: 'mock-user-1',
    name: 'werk',
    color: '#3B82F6',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'tag-2',
    userId: 'mock-user-1',
    name: 'persoonlijk',
    color: '#10B981',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'tag-3',
    userId: 'mock-user-1',
    name: 'urgent',
    color: '#EF4444',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'tag-4',
    userId: 'mock-user-1',
    name: 'idee',
    color: '#F59E0B',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'tag-5',
    userId: 'mock-user-1',
    name: 'project',
    color: '#8B5CF6',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
];

// Helper to get dates relative to today
const today = new Date();
const getDate = (daysOffset: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const getTimestamp = (daysOffset: number, hours: number = 10): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

// Mock notes with various states
export const mockNotes: MockNote[] = [
  // Today - In Progress, High Priority
  {
    id: 'note-1',
    userId: 'mock-user-1',
    date: getDate(0),
    content: `# Project Planning Meeting

## Agenda
- Review Q1 roadmap
- Discuss budget allocation
- Team resource planning

## Action Items
- [ ] Prepare slides
- [ ] Send calendar invite
- [ ] Book meeting room

#werk #project`,
    deadline: getTimestamp(1, 14),
    completedAt: null,
    inProgress: true,
    importance: 'HIGH',
    createdAt: getTimestamp(-2, 9),
    updatedAt: getTimestamp(0, 8),
    tags: [mockTags[0], mockTags[4]],
  },
  // Yesterday - Completed
  {
    id: 'note-2',
    userId: 'mock-user-1',
    date: getDate(-1),
    content: `# Weekly Report

Finished the weekly status report:
- All milestones on track
- Budget within limits
- Team morale is good

Sent to stakeholders at 4pm.

#werk`,
    deadline: null,
    completedAt: getTimestamp(-1, 16),
    inProgress: false,
    importance: 'MEDIUM',
    createdAt: getTimestamp(-3, 10),
    updatedAt: getTimestamp(-1, 16),
    tags: [mockTags[0]],
  },
  // 2 days ago - Normal note
  {
    id: 'note-3',
    userId: 'mock-user-1',
    date: getDate(-2),
    content: `# Nieuwe feature ideeën

1. **Dark mode** - automatisch switchen op basis van systeem
2. **Export functie** - notes exporteren naar PDF
3. **Tags autocomplete** - sneller tags toevoegen
4. **Keyboard shortcuts** - power user features

#idee #project`,
    deadline: null,
    completedAt: null,
    inProgress: false,
    importance: 'LOW',
    createdAt: getTimestamp(-2, 14),
    updatedAt: getTimestamp(-2, 14),
    tags: [mockTags[3], mockTags[4]],
  },
  // Tomorrow - Urgent deadline
  {
    id: 'note-4',
    userId: 'mock-user-1',
    date: getDate(1),
    content: `# Deadline: Client Presentation

**URGENT!** Final review needed before sending.

## Checklist
- [x] Slides completed
- [x] Demo environment ready
- [ ] Practice run-through
- [ ] Send final version

Contact: john@client.com

#werk #urgent`,
    deadline: getTimestamp(1, 9),
    completedAt: null,
    inProgress: true,
    importance: 'HIGH',
    createdAt: getTimestamp(-5, 10),
    updatedAt: getTimestamp(0, 11),
    tags: [mockTags[0], mockTags[2]],
  },
  // 3 days ago - Completed personal note
  {
    id: 'note-5',
    userId: 'mock-user-1',
    date: getDate(-3),
    content: `# Boodschappenlijst

- Melk
- Brood
- Kaas
- Appels
- Koffie

Alles gehaald bij de Albert Heijn.

#persoonlijk`,
    deadline: null,
    completedAt: getTimestamp(-3, 18),
    inProgress: false,
    importance: null,
    createdAt: getTimestamp(-3, 8),
    updatedAt: getTimestamp(-3, 18),
    tags: [mockTags[1]],
  },
  // 5 days ago - Old completed task
  {
    id: 'note-6',
    userId: 'mock-user-1',
    date: getDate(-5),
    content: `# Code Review

Reviewed PR #142 - Authentication refactor
- Clean code structure
- Good test coverage
- Minor suggestions for error handling

Approved and merged.

#werk`,
    deadline: null,
    completedAt: getTimestamp(-5, 15),
    inProgress: false,
    importance: 'MEDIUM',
    createdAt: getTimestamp(-5, 9),
    updatedAt: getTimestamp(-5, 15),
    tags: [mockTags[0]],
  },
  // Next week - Future planning
  {
    id: 'note-7',
    userId: 'mock-user-1',
    date: getDate(7),
    content: `# Sprint Planning

## Goals for next sprint
- Complete user dashboard
- Fix reported bugs
- Performance optimization

## Team capacity
- Alice: 8 days
- Bob: 6 days (holiday)
- Charlie: 8 days

#werk #project`,
    deadline: getTimestamp(7, 10),
    completedAt: null,
    inProgress: false,
    importance: 'MEDIUM',
    createdAt: getTimestamp(0, 15),
    updatedAt: getTimestamp(0, 15),
    tags: [mockTags[0], mockTags[4]],
  },
  // Today - Simple note without tags
  {
    id: 'note-8',
    userId: 'mock-user-1',
    date: getDate(0),
    content: `Quick reminder: call mom at 7pm

#persoonlijk`,
    deadline: getTimestamp(0, 19),
    completedAt: null,
    inProgress: false,
    importance: 'LOW',
    createdAt: getTimestamp(0, 12),
    updatedAt: getTimestamp(0, 12),
    tags: [mockTags[1]],
  },
  // 4 days ago - Completed
  {
    id: 'note-9',
    userId: 'mock-user-1',
    date: getDate(-4),
    content: `# Database Migration

Successfully migrated to new schema:
- Added completedAt field
- Added importance field
- Updated indexes

No data loss, all tests passing.

#werk #project`,
    deadline: null,
    completedAt: getTimestamp(-4, 17),
    inProgress: false,
    importance: 'HIGH',
    createdAt: getTimestamp(-6, 10),
    updatedAt: getTimestamp(-4, 17),
    tags: [mockTags[0], mockTags[4]],
  },
  // 2 days from now - Upcoming
  {
    id: 'note-10',
    userId: 'mock-user-1',
    date: getDate(2),
    content: `# Team Lunch

Restaurant: De Kas
Time: 12:30
Address: Kamerlingh Onneslaan 3

Confirm attendance by tomorrow!

#persoonlijk #werk`,
    deadline: getTimestamp(1, 17),
    completedAt: null,
    inProgress: false,
    importance: null,
    createdAt: getTimestamp(-1, 14),
    updatedAt: getTimestamp(-1, 14),
    tags: [mockTags[1], mockTags[0]],
  },
];

// In-memory storage that can be modified
export const mockDataStore = {
  users: [...mockUsers],
  tags: [...mockTags],
  notes: [...mockNotes],

  // Helper to generate IDs
  generateId: (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Reset to initial state
  reset: () => {
    mockDataStore.users = [...mockUsers];
    mockDataStore.tags = [...mockTags];
    mockDataStore.notes = [...mockNotes];
  },
};
