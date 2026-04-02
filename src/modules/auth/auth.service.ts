import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { prisma } from '../../db/prisma'
import { env } from '../../config/env'
import { ApiError } from '../../utils/ApiError'
import { RegisterInput, LoginInput } from './auth.schema'

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existing) {
    throw new ApiError(409, 'Email already in use')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: input.role ?? 'VIEWER',
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  })

  return user
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash)

  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] }
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  }
}
