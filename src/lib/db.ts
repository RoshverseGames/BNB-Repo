import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveDatabaseUrl(): string {
  // 1. If DATABASE_URL is set in the environment (packaged Electron app sets this),
  //    use it directly.
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  // 2. Dev mode fallback — use the local db/custom.db relative to project root.
  const devDbPath = path.join(process.cwd(), 'db', 'custom.db')
  const devDbDir = path.dirname(devDbPath)
  if (!fs.existsSync(devDbDir)) fs.mkdirSync(devDbDir, { recursive: true })
  return `file:${devDbPath}`
}

export const databaseUrl = resolveDatabaseUrl()

// Ensure the SQLite DB directory exists (the parent of the .db file).
try {
  const dbPath = databaseUrl.replace(/^file:/, '')
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
} catch {
  // Best-effort; ignore errors (e.g. in serverless contexts)
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: { url: databaseUrl },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db