import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  // Return default user's column prefs
  let user = await db.userProfile.findFirst({ where: { isDefault: true } })
  if (!user) {
    user = await db.userProfile.create({
      data: { name: 'Default User', email: 'user@local', isDefault: true },
    })
  }
  const prefs = await db.companyColumnPref.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json({ items: prefs, userId: user.id })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // body can be: { field, label } to add a new column, or { items: [...] } to replace all
  let user = await db.userProfile.findFirst({ where: { isDefault: true } })
  if (!user) {
    user = await db.userProfile.create({
      data: { name: 'Default User', email: 'user@local', isDefault: true },
    })
  }

  if (Array.isArray(body.items)) {
    // Replace all prefs for this user (atomic reorder)
    await db.companyColumnPref.deleteMany({ where: { userId: user.id } })
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i]
      await db.companyColumnPref.create({
        data: {
          userId: user.id,
          field: item.field,
          label: item.label,
          order: i,
          visible: item.visible !== false,
          width: item.width ?? null,
        },
      })
    }
    const all = await db.companyColumnPref.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ items: all })
  }

  // Single add
  const { field, label, visible } = body
  if (!field || !label) {
    return NextResponse.json({ error: 'field and label are required' }, { status: 400 })
  }
  const existing = await db.companyColumnPref.findFirst({
    where: { userId: user.id, field },
  })
  if (existing) {
    return NextResponse.json(existing)
  }
  const lastOrder = await db.companyColumnPref.aggregate({
    where: { userId: user.id },
    _max: { order: true },
  })
  const pref = await db.companyColumnPref.create({
    data: {
      userId: user.id,
      field,
      label,
      order: (lastOrder._max.order ?? -1) + 1,
      visible: visible !== false,
    },
  })
  return NextResponse.json(pref, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  // body: { items: [{id, field, label, order, visible}] } — bulk update
  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      if (!item.id) continue
      await db.companyColumnPref.update({
        where: { id: item.id },
        data: {
          label: item.label,
          order: item.order,
          visible: item.visible !== false,
        },
      })
    }
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'items array required' }, { status: 400 })
}
