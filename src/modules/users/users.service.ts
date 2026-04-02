import { prisma } from '../../db/prisma'
import { ApiError } from '../../utils/ApiError'
import { UpdateRoleInput, UpdateStatusInput } from './users.schema'

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function updateRole(userId: string, input: UpdateRoleInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, 'User not found')

  return prisma.user.update({
    where: { id: userId },
    data: { role: input.role },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  })
}

export async function updateStatus(userId: string, input: UpdateStatusInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, 'User not found')

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: input.isActive },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  })
}