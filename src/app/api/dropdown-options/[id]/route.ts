import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const existing = await db.dropdownOption.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed: Record<string, unknown> = {}
  const fields = ['value', 'label', 'color', 'order', 'isDefault']
  for (const f of fields) {
    if (f in body) {
      if (f === 'isDefault') allowed[f] = Boolean(body[f])
      else if (f === 'order') allowed[f] = Number(body[f])
      else if (f === 'color') allowed[f] = body[f] || null
      else allowed[f] = body[f]
    }
  }

  // If marking as default, unset other defaults in same field
  if (body.isDefault === true) {
    await db.dropdownOption.updateMany({
      where: { field: existing.field, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    })
  }

  // If changing value, ensure uniqueness
  if (body.value && body.value !== existing.value) {
    const dup = await db.dropdownOption.findFirst({
      where: { field: existing.field, value: body.value, id: { not: id } },
    })
    if (dup) {
      return NextResponse.json({ error: 'Value already exists in this field' }, { status: 409 })
    }
    allowed.value = String(body.value).toLowerCase().replace(/\s+/g, '_')
  }

  const updated = await db.dropdownOption.update({ where: { id }, data: allowed })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // When deleting a dropdown option, null out the value on companies that had it
  // We do not know which field it belongs to without fetching first.
  const existing = await db.dropdownOption.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Determine which company field corresponds to this dropdown field
  const fieldMap: Record<string, string> = {
    leadSource: 'leadSource',
    employees: 'employees',
    leadStatus: 'leadStatus',
    pipelineStage: 'pipelineStage',
    priority: 'priority',
    lastChannelUsed: 'lastChannelUsed',
    productsServices: 'productsServices',
    wonLostOpen: 'wonLostOpen',
    lossReason: 'lossReason',
  }
  const companyField = fieldMap[existing.field]
  if (companyField) {
    // For text fields, set matching companies to null
    await db.company.updateMany({
      where: { [companyField]: existing.value } as never,
      data: { [companyField]: null } as never,
    })
  }

  await db.dropdownOption.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
