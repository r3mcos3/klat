import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from './src/app';

// Export Express app as serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
