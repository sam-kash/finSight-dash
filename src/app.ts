import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { errorHandler } from './middlewares/errorHandler'
import authRouter from './modules/auth/auth.router'
import usersRouter from './modules/users/users.router'
import recordsRouter from './modules/records/records.router'
import auditRouter from './modules/audit/audit.router'
import dashboardRouter from './modules/dashboard/dashboard.router'
import cors from 'cors'

const app = express()

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users' , usersRouter)
app.use('/api/records', recordsRouter)
app.use('/api/audit', auditRouter)
app.use('/api/dashboard', dashboardRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Global error handler — must be last
app.use(errorHandler)

export default app
