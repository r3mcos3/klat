import { Request, Response, NextFunction } from 'express';
import searchService from '../services/searchService';
import { SearchQueryDto } from '../types/validation';

export class SearchController {
  // GET /api/search?q=query&tags=tag1,tag2&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, tags, startDate, endDate } = req.query as SearchQueryDto & { tags?: string };

      const results = await searchService.searchNotes({
        query: q || '',
        tags: tags ? tags.split(',') : undefined,
        startDate,
        endDate,
      });

      res.json({
        data: results,
        count: results.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
