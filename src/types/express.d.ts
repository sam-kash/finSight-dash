import { Role } from '@prisma/client/index'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: Role
      }
    }
  }
}
