import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const companyId = searchParams.get('companyId') ?? ''
  const sort = searchParams.get('sort') ?? 'updatedAt:desc'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)))

  const [sortField, sortDir] = sort.split(':') as [string, 'asc' | 'desc']

  const where: Record<string, unknown> = { AND: [] }
  if (search.trim()) {
    ;(where.AND as unknown[]).push({
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { title: { contains: search } },
        { city: { contains: search } },
      ],
    })
  }
  if (companyId) {
    ;(where.AND as unknown[]).push({ companyId })
  }
  if ((where.AND as unknown[]).length === 0) delete where.AND

  const orderBy: Record<string, 'asc' | 'desc'> = {
    [sortField || 'updatedAt']: sortDir === 'asc' ? 'asc' : 'desc',
  }

  const [total, people] = await Promise.all([
    db.person.count({ where }),
    db.person.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        company: { select: { id: true, name: true, domain: true } },
        _count: { select: { notes: true } },
      },
    }),
  ])

  return NextResponse.json({
    items: people,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    firstName, lastName, email, phone, title,
    linkedinUrl, city, country, companyId, avatarColor,
  } = body

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
  }

  const person = await db.person.create({
    data: {
      firstName,
      lastName,
      email: email ?? null,
      phone: phone ?? null,
      title: title ?? null,
      linkedinUrl: linkedinUrl ?? null,
      city: city ?? null,
      country: country ?? null,
      companyId: companyId || null,
      avatarColor: avatarColor ?? '#94a3b8',
    },
    include: {
      company: { select: { id: true, name: true, domain: true } },
    },
  })

  await db.activity.create({
    data: {
      type: 'person_created',
      summary: `Added contact ${firstName} ${lastName}${person.company ? ` at ${person.company.name}` : ''}`,
      companyId: companyId || null,
      personId: person.id,
    },
  })

  return NextResponse.json(person, { status: 201 })
}
