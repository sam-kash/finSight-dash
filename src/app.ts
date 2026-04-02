import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import authRouter from './modules/auth/auth.router'

const app = express()

app.use(express.json())

// Routes
app.use('/api/auth', authRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Global error handler — must be last
app.use(errorHandler)

export default app