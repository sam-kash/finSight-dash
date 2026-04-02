import {Router, Request, Response, NextFunction} from "express"
import { authenticate} from '../../middlewares/authenticate'
import { authorize } from "../../middlewares/authorize"
import { updateRoleSchema, updateStatusSchema } from "./users.schema"
import * as usersService from './users.service'

const router = Router()

router.use(authenticate)

// GET /api/users/me — any authenticated user
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getMe(req.user!.id)
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

// GET /api/users — admin only
router.get(
  '/',
  authorize('user:manage'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await usersService.getAllUsers()
      res.json({ success: true, data: users })
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /api/users/:id/role — admin only
router.patch(
  '/:id/role',
  authorize('user:manage'),
  async (req: Request<{id:string}>, res: Response, next: NextFunction) => {
    try {
      const input = updateRoleSchema.parse(req.body)
      const user = await usersService.updateRole(req.params.id, input)
      res.json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  }
)

export default router