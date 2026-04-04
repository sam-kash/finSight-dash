'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import AddRecordModal from '../dashboard/components/AddRecordModal'

interface Record {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  description?: string
  isDeleted: boolean
  createdBy: { fullName: string; email: string }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function RecordsPage() {
  const { user, logout } = useAuth()
  const [records, setRecords] = useState<Record[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    from: '',
    to: '',
    page: 1,
    limit: 10,
  })

  const canWrite = user?.role === 'ADMIN'

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.set('type', filters.type)
      if (filters.category) params.set('category', filters.category)
      if (filters.from) params.set('from', new Date(filters.from).toISOString())
      if (filters.to) params.set('to', new Date(filters.to).toISOString())
      params.set('page', String(filters.page))
      params.set('limit', String(filters.limit))

      const res = await api.get(`/api/records?${params.toString()}`)
      setRecords(res.data.records)
      setPagination(res.data.pagination)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (user) fetchRecords()
  }, [user, fetchRecords])

  async function handleDelete(id: string) {
    if (!confirm('Soft delete this record? It will be hidden but not permanently removed.')) return
    setDeleting(id)
    try {
      await api.delete(`/api/records/${id}`)
      fetchRecords()
    } finally {
      setDeleting(null)
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function resetFilters() {
    setFilters({ type: '', category: '', from: '', to: '', page: 1, limit: 10 })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
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
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/records" className="text-sm text-indigo-400 font-medium">
                Records
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {canWrite && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-1.5"
              >
                <span className="text-lg leading-none">+</span> Add Record
              </button>
            )}
            <div className="text-right">
              <p className="text-sm text-white font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Financial Records</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {pagination ? `${pagination.total} total records` : ''}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filters.type}
              onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value, page: 1 }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            <input
              type="text"
              placeholder="Category"
              value={filters.category}
              onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value, page: 1 }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value, page: 1 }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value, page: 1 }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {(filters.type || filters.category || filters.from || filters.to) && (
            <button
              onClick={resetFilters}
              className="mt-3 text-gray-400 hover:text-white text-xs transition"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading records...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No records found.</p>
              {canWrite && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm transition"
                >
                  Add your first record →
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Type</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Category</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Description</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Date</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Created By</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-3">Amount</th>
                    {canWrite && <th className="px-6 py-3" />}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                          ${record.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'}`}>
                          {record.type === 'INCOME' ? '↑' : '↓'} {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{record.category}</td>
                      <td className="px-6 py-4 text-gray-400">{record.description || '—'}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(record.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{record.createdBy?.fullName}</td>
                      <td className={`px-6 py-4 text-right font-semibold
                        ${record.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                      </td>
                      {canWrite && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(record.id)}
                            disabled={deleting === record.id}
                            className="text-gray-500 hover:text-red-400 transition text-xs disabled:opacity-50"
                          >
                            {deleting === record.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <AddRecordModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchRecords}
        />
      )}
    </div>
  )
}