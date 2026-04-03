import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import * as dashboardService from './dashboard.service'

const router = Router()

router.use(authenticate, authorize('dashboard:read'))

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getSummary()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

router.get('/comparison', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getPeriodComparison()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

router.get('/by-category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getCategoryBreakdown()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

router.get('/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getMonthlyTrends()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

router.get('/burn-rate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getBurnRate()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

router.get('/recent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getRecentActivity()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

export default router