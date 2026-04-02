import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client/index'
import { env } from '../config/env'
import { ApiError } from '../utils/ApiError'

interface JwtPayload {
  id: string
  email: string
  role: Role
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No token provided'))
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    }
    next()
  } catch {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}
