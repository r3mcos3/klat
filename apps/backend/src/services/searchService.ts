import prisma from '../config/database';

export interface SearchOptions {
  query: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export class SearchService {
  async searchNotes(options: SearchOptions) {
    const { query, tags, startDate, endDate } = options;

    console.log('[SearchService] Received options:', JSON.stringify(options, null, 2));

    // If there is no query and no tags to filter by, return empty results
    if (!query && (!tags || tags.length === 0)) {
      console.log('[SearchService] No query or tags provided, returning empty array.');
      return [];
    }

    // Build Prisma where clause
    const where: any = {
      AND: [],
    };

    // Search query: content OR tags
    if (query) {
      where.AND.push({
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
        ],
      });
    }

    // Filter by specific tag IDs (if provided via checkboxes)
    if (tags && tags.length > 0) {
      where.AND.push({
        tags: {
          some: {
            id: { in: tags },
          },
        },
      });
    }

    // Date filters
    if (startDate) {
      where.AND.push({ date: { gte: new Date(startDate) } });
    }
    if (endDate) {
      where.AND.push({ date: { lte: new Date(endDate) } });
    }

    try {
      console.log('[SearchService] Executing Prisma query with where clause:', JSON.stringify(where, null, 2));

      const notes = await prisma.note.findMany({
        where,
        include: {
          tags: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      console.log(`[SearchService] Found ${notes.length} notes from database.`);

      // Create search results with snippets
      const searchResults = notes.map((note) => {
        // Since we include tags in the search, sometimes the content might not match
        // (if we matched on tag name). We still want to show a snippet.
        // If content doesn't match, we show the beginning of content.
        const snippet = this.createSnippet(note.content, query);
        const highlights = this.findHighlights(note.content, query);

        // Convert dates to strings to match expected interface if needed
        // Prisma returns Date objects, frontend might expect strings
        return {
          note: {
            ...note,
            date: note.date.toISOString(),
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
            deadline: note.deadline?.toISOString() || undefined,
            completedAt: note.completedAt?.toISOString() || undefined,
          },
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
