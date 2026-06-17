import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Lightweight endpoint for populating people dropdowns/selects
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '200', 10)))

  const where = search.trim()
    ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {}

  const people = await db.person.findMany({
    where,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      title: true,
      avatarColor: true,
      company: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ items: people })
}
