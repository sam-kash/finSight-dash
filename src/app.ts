import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import authRouter from './modules/auth/auth.router'
import usersRouter from './modules/users/users.router'
import recordsRouter from './modules/records/records.router'
import auditRouter from './modules/audit/audit.router'

const app = express()

app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('api/users' , usersRouter)
app.use('api/records', recordsRouter)
app.use('api/audit', auditRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Global error handler — must be last
app.use(errorHandler)

export default app