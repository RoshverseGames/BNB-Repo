import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const existing = await db.note.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed: Record<string, unknown> = {}
  if ('title' in body) allowed.title = body.title?.trim() || 'Untitled note'
  if ('body' in body) allowed.body = body.body

  const updated = await db.note.update({
    where: { id },
    data: allowed,
    include: {
      person: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      company: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.note.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
