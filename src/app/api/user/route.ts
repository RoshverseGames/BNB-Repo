import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  // Return default user (currently single-user CRM)
  let user = await db.userProfile.findFirst({
    where: { isDefault: true },
    include: { _count: { select: { companies: true } } },
  })
  if (!user) {
    user = await db.userProfile.create({
      data: {
        name: 'Default User',
        email: 'user@local',
        isDefault: true,
      },
      include: { _count: { select: { companies: true } } },
    })
  }
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const allowed: Record<string, unknown> = {}
  const fields = ['name', 'email', 'title', 'phone', 'avatarColor', 'initials']
  for (const f of fields) {
    if (f in body) allowed[f] = body[f] ?? null
  }

  let user = await db.userProfile.findFirst({ where: { isDefault: true } })
  if (!user) {
    user = await db.userProfile.create({
      data: { name: body.name ?? 'Default User', email: body.email ?? 'user@local', isDefault: true, ...allowed },
    })
  } else {
    user = await db.userProfile.update({ where: { id: user.id }, data: allowed })
  }
  return NextResponse.json(user)
}
