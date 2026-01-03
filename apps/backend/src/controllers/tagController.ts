import { Request, Response, NextFunction } from 'express';
import tagService from '../services/tagService';
import { CreateTagDto, UpdateTagDto } from '../types/validation';

export class TagController {
  // GET /api/tags - Get all tags
  async getAllTags(_req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await tagService.getAllTags();
      res.json({
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tags/:id - Get tag by ID
  async getTagById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tag = await tagService.getTagById(id);
      res.json({
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/tags - Create new tag
  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateTagDto = req.body;
      const tag = await tagService.createTag(data);
      res.status(201).json({
        data: tag,
        message: 'Tag aangemaakt',
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/tags/:id - Update tag
  async updateTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateTagDto = req.body;
      const tag = await tagService.updateTag(id, data);
      res.json({
        data: tag,
        message: 'Tag bijgewerkt',
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/tags/:id - Delete tag
  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await tagService.deleteTag(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new TagController();
