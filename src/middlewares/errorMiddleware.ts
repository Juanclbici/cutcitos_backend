import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/HttpException';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Extract the status and message. If none are provided (a generic error), the default is 500 (Server Error).
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';

  // Save details error in Logger (method, path, error)
  logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
  
  if (error.stack && env.NODE_ENV !== 'production') {
    // Only development
    console.error(error.stack);
  }

  // Send a JSON to Frontend
  res.status(status).json({
    success: false,
    status,
    message
  });
};
  