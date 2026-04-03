import { prisma } from '../../db/prisma'

// ─── Helper ───────────────────────────────────────────────
function toNumber(val: unknown): number {
  return parseFloat(String(val))
}

// ─── 1. Summary ───────────────────────────────────────────
export async function getSummary() {
  const [incomeAgg, expenseAgg, recordCount] = await Promise.all([
    prisma.record.aggregate({
      where: { type: 'INCOME', isDeleted: false },
      _sum: { amount: true },
    }),
    prisma.record.aggregate({
      where: { type: 'EXPENSE', isDeleted: false },
      _sum: { amount: true },
    }),
    prisma.record.count({ where: { isDeleted: false } }),
  ])

  const totalIncome = toNumber(incomeAgg._sum.amount ?? 0)
  const totalExpenses = toNumber(expenseAgg._sum.amount ?? 0)
  const netBalance = totalIncome - totalExpenses
  const savingsRate =
    totalIncome > 0
      ? parseFloat(((netBalance / totalIncome) * 100).toFixed(2))
      : 0

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    savingsRate,        // what % of income is being saved
    totalRecords: recordCount,
    balanceStatus: netBalance >= 0 ? 'SURPLUS' : 'DEFICIT',
  }
}

// ─── 2. Period Comparison (this month vs last month) ──────
export async function getPeriodComparison() {
  const now = new Date()

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  async function getPeriodTotals(from: Date, to: Date) {
    const [income, expense] = await Promise.all([
      prisma.record.aggregate({
        where: { type: 'INCOME', isDeleted: false, date: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
      prisma.record.aggregate({
        where: { type: 'EXPENSE', isDeleted: false, date: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
    ])
    const inc = toNumber(income._sum.amount ?? 0)
    const exp = toNumber(expense._sum.amount ?? 0)
    return { income: inc, expenses: exp, net: inc - exp }
  }

  const [thisPeriod, lastPeriod] = await Promise.all([
    getPeriodTotals(thisMonthStart, now),
    getPeriodTotals(lastMonthStart, lastMonthEnd),
  ])

  function percentChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat((((current - previous) / previous) * 100).toFixed(2))
  }

  return {
    thisMonth: thisPeriod,
    lastMonth: lastPeriod,
    changes: {
      income: percentChange(thisPeriod.income, lastPeriod.income),
      expenses: percentChange(thisPeriod.expenses, lastPeriod.expenses),
      net: percentChange(thisPeriod.net, lastPeriod.net),
    },
  }
}

// ─── 3. Category Breakdown ────────────────────────────────
export async function getCategoryBreakdown() {
  const records = await prisma.record.groupBy({
    by: ['category', 'type'],
    where: { isDeleted: false },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  })

  const income: Record<string, { total: number; count: number }> = {}
  const expense: Record<string, { total: number; count: number }> = {}

  for (const row of records) {
    const bucket = row.type === 'INCOME' ? income : expense
    bucket[row.category] = {
      total: toNumber(row._sum.amount ?? 0),
      count: row._count.id,
    }
  }

  // Top spending category
  const topExpenseCategory = Object.entries(expense).sort(
    (a, b) => b[1].total - a[1].total
  )[0]

  return {
    income,
    expense,
    insight: {
      topExpenseCategory: topExpenseCategory
        ? { category: topExpenseCategory[0], total: topExpenseCategory[1].total }
        : null,
    },
  }
}

// ─── 4. Monthly Trends (last 6 months) ───────────────────
export async function getMonthlyTrends() {
  const months: {
    label: string
    income: number
    expenses: number
    net: number
    from: Date
    to: Date
  }[] = []

  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const label = from.toLocaleString('default', { month: 'short', year: 'numeric' })
    months.push({ label, from, to, income: 0, expenses: 0, net: 0 })
  }

  const records = await prisma.record.findMany({
    where: {
      isDeleted: false,
      date: { gte: months[0].from, lte: months[months.length - 1].to },
    },
    select: { amount: true, type: true, date: true },
  })

  for (const record of records) {
    const month = months.find(
      (m) => record.date >= m.from && record.date <= m.to
    )
    if (!month) continue
    const amount = toNumber(record.amount)
    if (record.type === 'INCOME') {
      month.income += amount
    } else {
      month.expenses += amount
    }
  }

  return months.map(({ label, income, expenses }) => ({
    label,
    income: parseFloat(income.toFixed(2)),
    expenses: parseFloat(expenses.toFixed(2)),
    net: parseFloat((income - expenses).toFixed(2)),
  }))
}

// ─── 5. Burn Rate ─────────────────────────────────────────
export async function getBurnRate() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const expenseAgg = await prisma.record.aggregate({
    where: {
      type: 'EXPENSE',
      isDeleted: false,
      date: { gte: thirtyDaysAgo, lte: now },
    },
    _sum: { amount: true },
  })

  const totalExpenses = toNumber(expenseAgg._sum.amount ?? 0)
  const dailyBurnRate = parseFloat((totalExpenses / 30).toFixed(2))
  const projectedMonthly = parseFloat((dailyBurnRate * 30).toFixed(2))

  const daysLeftInMonth =
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

  return {
    last30DaysExpenses: totalExpenses,
    dailyBurnRate,
    projectedMonthly,
    daysLeftInMonth,
    projectedRemainingSpend: parseFloat(
      (dailyBurnRate * daysLeftInMonth).toFixed(2)
    ),
  }
}

// ─── 6. Recent Activity with Running Balance ──────────────
export async function getRecentActivity() {
  const records = await prisma.record.findMany({
    where: { isDeleted: false },
    orderBy: { date: 'desc' },
    take: 10,
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      date: true,
      description: true,
      createdBy: {
        select: { fullName: true },
      },
    },
  })

  // Compute running balance newest → oldest
  let runningBalance = 0
  const activity = records.map((r) => {
    const amount = toNumber(r.amount)
    runningBalance += r.type === 'INCOME' ? amount : -amount
    return {
      ...r,
      amount,
      runningBalance: parseFloat(runningBalance.toFixed(2)),
    }
  })

  return activity
}