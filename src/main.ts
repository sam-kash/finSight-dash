import app from './app'
import { env } from './config/env'
import { prisma } from './db/prisma'

async function bootstrap() {
  try {
    await prisma.$connect()
    console.log('Database connected')

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

bootstrap()