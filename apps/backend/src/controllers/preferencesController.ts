import { Request, Response, NextFunction } from 'express';
import preferencesService, { UpdatePreferencesDto } from '../services/preferencesService';

export class PreferencesController {
  // GET /api/preferences - Get user preferences
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const preferences = await preferencesService.getPreferences(userId);
      res.json({
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/preferences - Update user preferences
  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const data: UpdatePreferencesDto = req.body;
      const preferences = await preferencesService.updatePreferences(userId, data);
      res.json({
        data: preferences,
        message: 'Voorkeuren bijgewerkt',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PreferencesController();
