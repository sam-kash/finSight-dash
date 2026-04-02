import { prisma } from '../../db/prisma'
import { ApiError } from '../../utils/ApiError'
import { logAudit } from '../audit/audit.service'
import {
  CreateRecordInput,
  UpdateRecordInput,
  RecordQueryInput,
} from './records.schema'

export async function createRecord(input: CreateRecordInput, userId: string) {
  const record = await prisma.record.create({
    data: {
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      description: input.description,
      userId,
    },
  })

  await logAudit({
    userId,
    recordId: record.id,
    action: 'CREATE',
    changes: { created: record },
  })

  return record
}

export async function getRecords(query: RecordQueryInput) {
  const { type, category, from, to, page, limit } = query
  const skip = (page - 1) * limit

  const where = {
    isDeleted: false,
    ...(type && { type }),
    ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
    ...(from || to
      ? {
          date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
  }

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    }),
    prisma.record.count({ where }),
  ])

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getRecordById(id: string) {
  const record = await prisma.record.findFirst({
    where: { id, isDeleted: false },
    include: {
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
  })

  if (!record) throw new ApiError(404, 'Record not found')
  return record
}

export async function updateRecord(
  id: string,
  input: UpdateRecordInput,
  userId: string
) {
  const existing = await prisma.record.findFirst({
    where: { id, isDeleted: false },
  })

  if (!existing) throw new ApiError(404, 'Record not found')

  const updated = await prisma.record.update({
    where: { id },
    data: {
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.type && { type: input.type }),
      ...(input.category && { category: input.category }),
      ...(input.date && { date: new Date(input.date) }),
      ...(input.description !== undefined && { description: input.description }),
    },
  })

  await logAudit({
    userId,
    recordId: id,
    action: 'UPDATE',
    changes: {
      before: existing,
      after: updated,
    },
  })

  return updated
}

export async function deleteRecord(id: string, userId: string) {
  const existing = await prisma.record.findFirst({
    where: { id, isDeleted: false },
  })

  if (!existing) throw new ApiError(404, 'Record not found')

  await prisma.record.update({
    where: { id },
    data: { isDeleted: true },
  })

  await logAudit({
    userId,
    recordId: id,
    action: 'DELETE',
    changes: { deletedRecord: existing },
  })

  return { message: 'Record deleted successfully' }
}