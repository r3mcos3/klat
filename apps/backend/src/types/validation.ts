import { z } from 'zod';

// Note validation schemas
export const createNoteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  content: z.string().min(0),
  deadline: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  inProgress: z.boolean().optional(),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const updateNoteSchema = z.object({
  content: z.string().min(0).optional(),
  deadline: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  inProgress: z.boolean().optional(),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

// Tag validation schemas
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').optional(),
});

// Search validation schema
export const searchQuerySchema = z.object({
  q: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tag IDs
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ID param schema
export const idParamSchema = z.object({
  id: z.string().min(1),
});

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
});

export const loginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(1, 'Wachtwoord is verplicht'),
});

// Type exports
export type CreateNoteDto = z.infer<typeof createNoteSchema>;
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;
export type CreateTagDto = z.infer<typeof createTagSchema>;
export type UpdateTagDto = z.infer<typeof updateTagSchema>;
export type SearchQueryDto = z.infer<typeof searchQuerySchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
