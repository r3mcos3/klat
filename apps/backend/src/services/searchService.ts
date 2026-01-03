import { supabase } from '../config/supabase';

export interface SearchOptions {
  query: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export class SearchService {
  async searchNotes(options: SearchOptions, userId: string) {
    const { query, tags, startDate, endDate } = options;

    console.log('[SearchService] Received options:', JSON.stringify(options, null, 2));

    // If there is no query and no tags to filter by, return empty results
    if (!query && (!tags || tags.length === 0)) {
      console.log('[SearchService] No query or tags provided, returning empty array.');
      return [];
    }

    try {
      // Step 1: Get all notes with their tags (filtered by userId)
      let supabaseQuery = supabase
        .from('notes')
        .select(
          `
          *,
          tags:_NoteToTag(tag:tags(*))
        `
        )
        .eq('userId', userId)
        .order('date', { ascending: false });

      // Add date filters if provided
      if (startDate) {
        supabaseQuery = supabaseQuery.gte('date', startDate);
      }
      if (endDate) {
        supabaseQuery = supabaseQuery.lte('date', endDate);
      }

      const { data: notes, error } = await supabaseQuery;

      if (error) {
        console.error('[SearchService] Database error:', error);
        return [];
      }

      console.log(`[SearchService] Found ${notes?.length || 0} notes from database.`);

      // Transform notes to expected format
      let results = (notes || []).map((note: any) => ({
        ...note,
        tags: note.tags?.map((t: any) => t.tag).filter(Boolean) || [],
      }));

      // Step 2: Filter by query (search in content OR tag names)
      if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter((note: any) => {
          // Search in content
          const contentMatch = note.content.toLowerCase().includes(lowerQuery);

          // Search in tag names
          const tagMatch = note.tags.some((tag: any) =>
            tag.name.toLowerCase().includes(lowerQuery)
          );

          return contentMatch || tagMatch;
        });
      }

      // Step 3: Filter by specific tag IDs (if provided)
      if (tags && tags.length > 0) {
        results = results.filter((note: any) =>
          tags.some((tagId) => note.tags.some((tag: any) => tag.id === tagId))
        );
      }

      console.log(`[SearchService] After filtering: ${results.length} results.`);

      // Create search results with snippets
      const searchResults = results.map((note: any) => {
        const snippet = this.createSnippet(note.content, query);
        const highlights = this.findHighlights(note.content, query);

        return {
          note,
          snippet,
          highlights,
        };
      });

      console.log(`[SearchService] Returning ${searchResults.length} formatted results.`);
      return searchResults;
    } catch (error) {
      console.error('[SearchService] Search error:', error);
      return [];
    }
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
