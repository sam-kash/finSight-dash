import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'
import {
  createRecordSchema,
  updateRecordSchema,
  recordQuerySchema,
} from './records.schema'
import * as recordsService from './records.service'

const router = Router()

router.use(authenticate)

// POST /api/records — admin only
router.post(
  '/',
  authorize('record:write'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createRecordSchema.parse(req.body)
      const record = await recordsService.createRecord(input, req.user!.id)
      res.status(201).json({ success: true, data: record })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/records — viewer, analyst, admin
router.get(
  '/',
  authorize('record:read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = recordQuerySchema.parse(req.query)
      const result = await recordsService.getRecords(query)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/records/:id — viewer, analyst, admin
router.get(
  '/:id',
  authorize('record:read'),
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const record = await recordsService.getRecordById(req.params.id)
      res.json({ success: true, data: record })
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /api/records/:id — admin only
router.patch(
  '/:id',
  authorize('record:write'),
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const input = updateRecordSchema.parse(req.body)
      const record = await recordsService.updateRecord(
        req.params.id,
        input,
        req.user!.id
      )
      res.json({ success: true, data: record })
    } catch (err) {
      next(err)
    }
  }
)

// DELETE /api/records/:id — admin only (soft delete)
router.delete(
  '/:id',
  authorize('record:delete'),
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const result = await recordsService.deleteRecord(req.params.id, req.user!.id)
      res.json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }
)

export default router