'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gray-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.16),_transparent_32%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <section className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-3 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            Finsight Dash
          </div>

          <div className="mt-8 max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Finance clarity for teams that want more than just totals.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-300 md:text-lg">
              Track records, monitor trends, and keep a clean audit trail in a workspace designed for financial visibility and accountable decisions.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Track</p>
              <p className="mt-3 text-xl font-semibold text-white">Every record</p>
              <p className="mt-2 text-sm text-gray-400">Capture income and expenses with consistent categories and timestamps.</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Analyze</p>
              <p className="mt-3 text-xl font-semibold text-white">Spot trends</p>
              <p className="mt-2 text-sm text-gray-400">Summaries, comparisons, and activity feed give quick operating context.</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Audit</p>
              <p className="mt-3 text-xl font-semibold text-white">Keep history</p>
              <p className="mt-2 text-sm text-gray-400">Know who changed what, and when, across the workflow.</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-indigo-500/15 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950/40 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Live financial pulse</p>
                <p className="mt-1 text-xs text-gray-500">A visual snapshot of how the workspace feels</p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                Stable momentum
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_0.85fr]">
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Operating flow</p>
                    <p className="mt-2 text-3xl font-semibold text-white">+18.4%</p>
                  </div>
                  <p className="text-sm text-indigo-300">month over month</p>
                </div>
                <div className="flex h-28 items-end gap-3">
                  {[38, 54, 47, 70, 62, 86, 74].map((height, index) => (
                    <div key={index} className="flex-1">
                      <div
                        className="rounded-t-xl bg-gradient-to-t from-indigo-700 to-indigo-400"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Recent signal</p>
                  <p className="mt-2 text-sm text-white">Recurring income is outpacing spend, while recent activity stays easy to review.</p>
                </div>
                <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Built for</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-300">
                    <li>Role-based access and review</li>
                    <li>Fast transaction visibility</li>
                    <li>Simple admin and audit workflows</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-gray-800 bg-gray-900/85 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-400">
                Sign in to continue into your financial workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="........"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-800"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="pt-5 text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-400 transition hover:text-indigo-300">
                Create one
              </Link>
            </p>

            <div className="mt-6 flex gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed text-indigo-200/70">
                <strong className="font-semibold text-indigo-300">Note for Recruiters:</strong> The backend is deployed on Render&apos;s free tier, which can spin down after inactivity. The first login may take around a minute while the server wakes up.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
