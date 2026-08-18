import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed: " + errors.join(', '),
      errors: err.errors
    });
  }
  
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use a different value.`,
      field
    });
  }
  
  // Handle permission errors
  if (err.message && (err.message.includes('permission') || err.message.includes('not authorized'))) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to perform this action. Please contact Admin.",
      error: "PERMISSION_DENIED"
    });
  }
  
  // Handle not found errors
  if (err.statusCode === 404 || err.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      message: err.message || "Resource not found"
    });
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
