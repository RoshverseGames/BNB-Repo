import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const stage = searchParams.get('stage') ?? ''
  const industry = searchParams.get('industry') ?? ''
  const leadStatus = searchParams.get('leadStatus') ?? ''
  const pipelineStage = searchParams.get('pipelineStage') ?? ''
  const priority = searchParams.get('priority') ?? ''
  const wonLostOpen = searchParams.get('wonLostOpen') ?? ''
  const createdById = searchParams.get('createdById') ?? ''
  const followUp = searchParams.get('followUp') ?? '' // today | week | overdue
  const sort = searchParams.get('sort') ?? 'updatedAt:desc'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('pageSize') ?? '100', 10)))

  const [sortField, sortDir] = sort.split(':') as [string, 'asc' | 'desc']

  const where: Record<string, unknown> = { AND: [] }
  if (search.trim()) {
    ;(where.AND as unknown[]).push({
      OR: [
        { name: { contains: search } },
        { domain: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
        { industry: { contains: search } },
      ],
    })
  }
  if (stage && stage !== 'all') (where.AND as unknown[]).push({ stage })
  if (industry && industry !== 'all') (where.AND as unknown[]).push({ industry })
  if (leadStatus && leadStatus !== 'all') (where.AND as unknown[]).push({ leadStatus })
  if (pipelineStage && pipelineStage !== 'all') (where.AND as unknown[]).push({ pipelineStage })
  if (priority && priority !== 'all') (where.AND as unknown[]).push({ priority })
  if (wonLostOpen && wonLostOpen !== 'all') (where.AND as unknown[]).push({ wonLostOpen })
  if (createdById) (where.AND as unknown[]).push({ createdById })
  if (followUp) {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(startOfToday)
    endOfToday.setDate(endOfToday.getDate() + 1)
    const endOfWeek = new Date(startOfToday)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    if (followUp === 'today') {
      ;(where.AND as unknown[]).push({
        nextFollowUpDate: { gte: startOfToday, lt: endOfToday },
      })
    } else if (followUp === 'week') {
      ;(where.AND as unknown[]).push({
        nextFollowUpDate: { gte: startOfToday, lt: endOfWeek },
      })
    } else if (followUp === 'overdue') {
      ;(where.AND as unknown[]).push({
        nextFollowUpDate: { lt: startOfToday },
      })
    }
  }
  if ((where.AND as unknown[]).length === 0) delete where.AND

  // Map sort fields that need to traverse relations
  const sortableFields = new Set([
    'name', 'industry', 'createdAt', 'updatedAt', 'employees',
    'leadStatus', 'pipelineStage', 'priority', 'wonLostOpen', 'lossReason',
    'leadSource', 'lastChannelUsed', 'nextFollowUpDate', 'firstContactDate',
    'lastContactDate', 'expectedCloseDate', 'dealCloseDate', 'touchCount',
    'estimatedDeal', 'arr', 'revenue',
  ])
  const orderBy: Record<string, 'asc' | 'desc'> = sortableFields.has(sortField)
    ? { [sortField]: sortDir === 'asc' ? 'asc' : 'desc' }
    : { updatedAt: sortDir === 'asc' ? 'asc' : 'desc' }

  const [total, companies] = await Promise.all([
    db.company.count({ where }),
    db.company.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { people: true, notes: true } },
        contactPerson: {
          select: { id: true, firstName: true, lastName: true, avatarColor: true, email: true, title: true },
        },
        createdBy: { select: { id: true, name: true, initials: true, avatarColor: true } },
      },
    }),
  ])

  return NextResponse.json({
    items: companies,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, domain, industry, website, linkedinUrl,
    employees, revenue, arr, city, country, address, phone,
    description, stage, idealProfile,
    leadSource, leadStatus, pipelineStage, priority, wonLostOpen, lossReason,
    productsServices, contactPersonId, createdById,
    firstContactDate, lastContactDate, nextFollowUpDate, expectedCloseDate, dealCloseDate,
    touchCount, lastChannelUsed, estimatedDeal,
  } = body

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const parseDate = (v?: string) => (v ? new Date(v) : null)

  const company = await db.company.create({
    data: {
      name,
      domain: domain ?? null,
      industry: industry ?? null,
      website: website ?? null,
      linkedinUrl: linkedinUrl ?? null,
      employees: employees ?? null,
      revenue: revenue ?? null,
      arr: arr ?? null,
      city: city ?? null,
      country: country ?? null,
      address: address ?? null,
      phone: phone ?? null,
      description: description ?? null,
      stage: stage ?? 'Lead',
      idealProfile: Boolean(idealProfile),
      leadSource: leadSource || null,
      leadStatus: leadStatus || null,
      pipelineStage: pipelineStage || null,
      priority: priority || null,
      wonLostOpen: wonLostOpen || null,
      lossReason: lossReason || null,
      productsServices: productsServices ? JSON.stringify(productsServices) : null,
      contactPersonId: contactPersonId || null,
      createdById: createdById || null,
      firstContactDate: parseDate(firstContactDate),
      lastContactDate: parseDate(lastContactDate),
      nextFollowUpDate: parseDate(nextFollowUpDate),
      expectedCloseDate: parseDate(expectedCloseDate),
      dealCloseDate: parseDate(dealCloseDate),
      touchCount: typeof touchCount === 'number' ? touchCount : 0,
      lastChannelUsed: lastChannelUsed || null,
      estimatedDeal: estimatedDeal || null,
    },
    include: {
      contactPerson: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      createdBy: { select: { id: true, name: true, initials: true, avatarColor: true } },
    },
  })

  await db.activity.create({
    data: {
      type: 'company_created',
      summary: `Added company ${name}`,
      companyId: company.id,
    },
  })

  return NextResponse.json(company, { status: 201 })
}
