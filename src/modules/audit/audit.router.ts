import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import { prisma } from '../../db/prisma'

const router = Router()

router.use(authenticate, authorize('audit:read'))

// GET /api/audit — all audit logs
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
        record: {
          select: { id: true, category: true, type: true },
        },
      },
    })
    res.json({ success: true, data: logs })
  } catch (err) {
    next(err)
  }
})

// GET /api/audit/record/:id — history of a specific record
router.get('/record/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { recordId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
      },
    })
    res.json({ success: true, data: logs })
  } catch (err) {
    next(err)
  }
})

export default router