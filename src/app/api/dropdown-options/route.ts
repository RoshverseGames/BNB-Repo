import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const field = searchParams.get('field')

  const where = field ? { field } : {}
  const options = await db.dropdownOption.findMany({
    where,
    orderBy: [{ field: 'asc' }, { order: 'asc' }, { label: 'asc' }],
  })
  // Group by field for convenience
  const grouped: Record<string, typeof options> = {}
  for (const o of options) {
    if (!grouped[o.field]) grouped[o.field] = []
    grouped[o.field].push(o)
  }
  return NextResponse.json({ items: options, grouped })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { field, value, label, color, order, isDefault } = body
  if (!field || !value || !label) {
    return NextResponse.json({ error: 'field, value, label are required' }, { status: 400 })
  }
  // Unset other defaults in the same field if this is being marked default
  if (isDefault) {
    await db.dropdownOption.updateMany({
      where: { field, isDefault: true },
      data: { isDefault: false },
    })
  }
  const lastOrder = await db.dropdownOption.aggregate({
    where: { field },
    _max: { order: true },
  })
  const option = await db.dropdownOption.create({
    data: {
      field,
      value: value.toLowerCase().replace(/\s+/g, '_'),
      label,
      color: color ?? null,
      order: typeof order === 'number' ? order : (lastOrder._max.order ?? -1) + 1,
      isDefault: Boolean(isDefault),
    },
  })
  return NextResponse.json(option, { status: 201 })
}
