import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const company = await db.company.findUnique({
    where: { id },
    include: {
      people: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { notes: true } } },
      },
      contactPerson: {
        select: { id: true, firstName: true, lastName: true, email: true, title: true, phone: true, avatarColor: true, linkedinUrl: true },
      },
      createdBy: { select: { id: true, name: true, initials: true, avatarColor: true, title: true, email: true } },
      notes: {
        orderBy: { createdAt: 'desc' },
        include: {
          person: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { people: true, notes: true, activities: true } },
    },
  })
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(company)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const existing = await db.company.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed: Record<string, unknown> = {}
  const textFields = [
    'name', 'domain', 'industry', 'website', 'linkedinUrl', 'employees',
    'revenue', 'arr', 'city', 'country', 'address', 'phone', 'description',
    'stage', 'leadSource', 'leadStatus', 'pipelineStage', 'priority',
    'wonLostOpen', 'lossReason', 'lastChannelUsed', 'estimatedDeal',
    'contactPersonId', 'createdById',
  ]
  for (const f of textFields) {
    if (f in body) allowed[f] = body[f] === '' ? null : body[f]
  }
  if ('idealProfile' in body) allowed.idealProfile = Boolean(body.idealProfile)
  if ('touchCount' in body) allowed.touchCount = Number(body.touchCount) || 0
  if ('productsServices' in body) {
    allowed.productsServices = body.productsServices
      ? JSON.stringify(body.productsServices)
      : null
  }
  // Dates
  const dateFields = [
    'firstContactDate', 'lastContactDate', 'nextFollowUpDate',
    'expectedCloseDate', 'dealCloseDate',
  ]
  for (const f of dateFields) {
    if (f in body) {
      allowed[f] = body[f] ? new Date(body[f]) : null
    }
  }

  const updated = await db.company.update({
    where: { id },
    data: allowed,
    include: {
      contactPerson: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      createdBy: { select: { id: true, name: true, initials: true, avatarColor: true } },
    },
  })

  if (body.stage && body.stage !== existing.stage) {
    await db.activity.create({
      data: {
        type: 'stage_changed',
        summary: `Stage changed from ${existing.stage} → ${body.stage} on ${existing.name}`,
        companyId: id,
      },
    })
  }
  if (body.leadStatus && body.leadStatus !== existing.leadStatus) {
    await db.activity.create({
      data: {
        type: 'stage_changed',
        summary: `Lead status changed to ${body.leadStatus} on ${existing.name}`,
        companyId: id,
      },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.company.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
