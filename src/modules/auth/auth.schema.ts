import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>