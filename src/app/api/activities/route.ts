import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  const activities = await db.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      company: { select: { id: true, name: true } },
      person: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
    },
  })

  return NextResponse.json({ items: activities })
}
