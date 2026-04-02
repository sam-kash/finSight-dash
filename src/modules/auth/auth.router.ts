import { Router, Request, Response, NextFunction } from 'express'
import { registerSchema, loginSchema } from './auth.schema'
import * as authService from './auth.service'

const router = Router()

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = registerSchema.parse(req.body)
    const user = await authService.register(input)
    res.status(201).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body)
    const result = await authService.login(input)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

export default router