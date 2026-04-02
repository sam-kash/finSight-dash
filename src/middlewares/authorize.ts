import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client/index'
import { ApiError } from '../utils/ApiError'

type Permission =
  | 'record:read'
  | 'record:write'
  | 'record:delete'
  | 'dashboard:read'
  | 'user:manage'
  | 'audit:read'

const permissionMatrix: Record<Role, Permission[]> = {
  VIEWER:  ['record:read'],
  ANALYST: ['record:read', 'dashboard:read'],
  ADMIN:   [
    'record:read', 'record:write', 'record:delete',
    'dashboard:read', 'user:manage', 'audit:read',
  ],
}

export function authorize(...required: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role

    if (!role) {
      return next(new ApiError(401, 'Unauthenticated'))
    }

    const userPermissions = permissionMatrix[role]
    const hasAll = required.every(p => userPermissions.includes(p))

    if (!hasAll) {
      return next(new ApiError(403, 'You do not have permission to perform this action'))
    }

    next()
  }
}
