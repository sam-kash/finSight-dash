'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import StatCard from './components/StatCard'
import TrendsChart from './components/TrendsChart'
import RecentActivity from './components/RecentActivity'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState<any>(null)
  const [comparison, setComparison] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [burnRate, setBurnRate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const canViewDashboard = user?.role === 'ANALYST' || user?.role === 'ADMIN'

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, recentRes] = await Promise.all([
          canViewDashboard ? api.get('/api/dashboard/summary') : Promise.resolve(null),
          api.get('/api/records?limit=10'),
        ])

        if (summaryRes) setSummary(summaryRes.data.data)
        setRecent(recentRes.data.records || [])

        if (canViewDashboard) {
          const [compRes, trendsRes, burnRes] = await Promise.all([
            api.get('/api/dashboard/comparison'),
            api.get('/api/dashboard/trends'),
            api.get('/api/dashboard/burn-rate'),
          ])
          setComparison(compRes.data.data)
          setTrends(trendsRes.data.data)
          setBurnRate(burnRes.data.data)
        }
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [user, canViewDashboard])

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-white">Finsight Dash</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName.split(' ')[0]}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Role notice for viewers */}
        {!canViewDashboard && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-400 text-sm">
            You have Viewer access. Dashboard analytics are available to Analyst and Admin roles.
          </div>
        )}

        {/* Summary Cards */}
        {canViewDashboard && summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Income"
              value={formatCurrency(summary.totalIncome)}
              trend="up"
              trendValue={comparison ? `${comparison.changes.income > 0 ? '+' : ''}${comparison.changes.income}% vs last month` : undefined}
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary.totalExpenses)}
              trend={comparison?.changes.expenses > 0 ? 'down' : 'up'}
              trendValue={comparison ? `${comparison.changes.expenses > 0 ? '+' : ''}${comparison.changes.expenses}% vs last month` : undefined}
            />
            <StatCard
              title="Net Balance"
              value={formatCurrency(summary.netBalance)}
              subtitle={summary.balanceStatus}
              trend={summary.netBalance >= 0 ? 'up' : 'down'}
            />
            <StatCard
              title="Savings Rate"
              value={`${summary.savingsRate}%`}
              subtitle="of total income saved"
              trend={summary.savingsRate >= 20 ? 'up' : 'neutral'}
            />
          </div>
        )}

        {/* Burn Rate */}
        {canViewDashboard && burnRate && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard
              title="Daily Burn Rate"
              value={formatCurrency(burnRate.dailyBurnRate)}
              subtitle="avg daily spend (last 30 days)"
            />
            <StatCard
              title="Projected Monthly Spend"
              value={formatCurrency(burnRate.projectedMonthly)}
              subtitle="based on current burn rate"
            />
            <StatCard
              title="Projected Remaining Spend"
              value={formatCurrency(burnRate.projectedRemainingSpend)}
              subtitle={`${burnRate.daysLeftInMonth} days left this month`}
            />
          </div>
        )}

        {/* Trends Chart */}
        {canViewDashboard && trends.length > 0 && (
          <TrendsChart data={trends} />
        )}

        {/* Recent Activity */}
        {recent.length > 0 ? (
          <RecentActivity records={recent} />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
            No records yet.
          </div>
        )}
      </main>
    </div>
  )
}