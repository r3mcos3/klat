import { supabase } from '../config/supabase';

export interface SearchOptions {
  query: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export class SearchService {
  async searchNotes(options: SearchOptions) {
    const { query, tags, startDate, endDate } = options;

    // Build query
    let supabaseQuery = supabase
      .from('notes')
      .select(
        `
        *,
        tags:_NoteToTag(tag:tags(*))
      `
      )
      .ilike('content', `%${query}%`); // Case-insensitive search

    // Add date filters if provided
    if (startDate) {
      supabaseQuery = supabaseQuery.gte('date', startDate);
    }
    if (endDate) {
      supabaseQuery = supabaseQuery.lte('date', endDate);
    }

    supabaseQuery = supabaseQuery.order('date', { ascending: false });

    const { data: notes, error } = await supabaseQuery;

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    // Transform notes and filter by tags if needed
    let results = (notes || []).map((note: any) => ({
      ...note,
      tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }));

    // Filter by tags if provided (client-side for now)
    if (tags && tags.length > 0) {
      results = results.filter((note: any) =>
        tags.some((tagId) => note.tags.some((tag: any) => tag.id === tagId))
      );
    }

    // Create search results with snippets
    const searchResults = results.map((note) => {
      const snippet = this.createSnippet(note.content, query);
      const highlights = this.findHighlights(note.content, query);

      return {
        note,
        snippet,
        highlights,
      };
    });

    return searchResults;
  }

  // Create a snippet showing context around the search term
  private createSnippet(content: string, query: string, contextLength = 100): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) {
      // If exact match not found, return beginning
      return content.substring(0, contextLength) + (content.length > contextLength ? '...' : '');
    }

    // Calculate snippet boundaries
    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(content.length, index + query.length + contextLength / 2);

    let snippet = content.substring(start, end);

    // Add ellipsis if needed
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  // Find all occurrences of search terms for highlighting
  private findHighlights(content: string, query: string): string[] {
    const terms = query.split(/\s+/).filter((term) => term.length > 0);
    const highlights: Set<string> = new Set();

    terms.forEach((term) => {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\w*`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        matches.forEach((match) => highlights.add(match));
      }
    });

    return Array.from(highlights);
  }

  // Escape special regex characters
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default new SearchService();
