import { AuditAction, Prisma } from '@prisma/client/index'
import { prisma } from '../../db/prisma'

export async function logAudit({
  userId,
  recordId,
  action,
  changes,
}: {
  userId: string
  recordId: string
  action: AuditAction
  changes: Prisma.InputJsonValue
}) {
  await prisma.auditLog.create({
    data: {
      userId,
      recordId,
      action,
      changes,
    },
  })
}