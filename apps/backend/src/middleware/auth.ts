import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { AppError } from './errorHandler';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches userId to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Geen authenticatie token gevonden', 401);
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError('Ongeldige authenticatie token', 401);
    }

    // Verify token and get userId
    const userId = await authService.verifyToken(token);

    // Attach userId to request object
    req.userId = userId;

    next();
  } catch (error) {
    next(error);
  }
};
