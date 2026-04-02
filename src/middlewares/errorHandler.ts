import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import { ZodError, ZodIssue } from 'zod'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  // Known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    })
    return
  }

  // Unknown errors
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}
