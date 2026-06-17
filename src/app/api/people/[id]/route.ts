import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const person = await db.person.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true, domain: true, stage: true } },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { notes: true, activities: true } },
    },
  })
  if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(person)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const existing = await db.person.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed: Record<string, unknown> = {}
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'title',
    'linkedinUrl', 'city', 'country', 'companyId', 'avatarColor',
  ]
  for (const f of fields) {
    if (f in body) {
      allowed[f] = body[f] === '' ? null : body[f]
    }
  }

  const updated = await db.person.update({
    where: { id },
    data: allowed,
    include: {
      company: { select: { id: true, name: true, domain: true, stage: true } },
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.person.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
