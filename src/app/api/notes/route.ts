import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId') ?? ''
  const personId = searchParams.get('personId') ?? ''
  const sort = searchParams.get('sort') ?? 'updatedAt:desc'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)))

  const [sortField, sortDir] = sort.split(':') as [string, 'asc' | 'desc']

  const where: Record<string, unknown> = { AND: [] }
  if (companyId) (where.AND as unknown[]).push({ companyId })
  if (personId) (where.AND as unknown[]).push({ personId })
  if ((where.AND as unknown[]).length === 0) delete where.AND

  const orderBy: Record<string, 'asc' | 'desc'> = {
    [sortField || 'updatedAt']: sortDir === 'asc' ? 'asc' : 'desc',
  }

  const [total, notes] = await Promise.all([
    db.note.count({ where }),
    db.note.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        person: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
        company: { select: { id: true, name: true } },
      },
    }),
  ])

  return NextResponse.json({
    items: notes,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, body: noteBody, companyId, personId } = body

  if (!noteBody || typeof noteBody !== 'string') {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }
  if (!companyId && !personId) {
    return NextResponse.json({ error: 'companyId or personId is required' }, { status: 400 })
  }

  const note = await db.note.create({
    data: {
      title: title?.trim() || 'Untitled note',
      body: noteBody,
      companyId: companyId || null,
      personId: personId || null,
    },
    include: {
      person: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      company: { select: { id: true, name: true } },
    },
  })

  let summary = 'Note added'
  if (note.company) summary += ` on ${note.company.name}`
  if (note.person) summary += ` · ${note.person.firstName} ${note.person.lastName}`

  await db.activity.create({
    data: {
      type: 'note_added',
      summary,
      companyId: companyId || null,
      personId: personId || null,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
