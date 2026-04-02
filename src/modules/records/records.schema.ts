import { z } from 'zod'

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  date: z.string().datetime({ message: 'Invalid date format, use ISO 8601' }),
  description: z.string().optional(),
})

export const updateRecordSchema = createRecordSchema.partial()

export const recordQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
})

export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
export type RecordQueryInput = z.infer<typeof recordQuerySchema>
