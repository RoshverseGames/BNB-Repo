import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday)
  endOfToday.setDate(endOfToday.getDate() + 1)
  const endOfWeek = new Date(startOfToday)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const startOf7DaysAgo = new Date(startOfToday)
  startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7)

  const [
    totalCompanies,
    totalPeople,
    totalNotes,
    // Stage counts (legacy)
    leadsCount,
    qualifiedCount,
    customerCount,
    churnedCount,
    // Lead status counts
    newLeadsCount,
    inProgressLeadsCount,
    // Follow-ups
    followUpTodayCount,
    followUpWeekCount,
    overdueFollowUpsCount,
    // Grouped data
    companiesByStage,
    companiesByIndustry,
    companiesByLeadStatus,
    companiesByPipelineStage,
    recentActivities,
    recentCompanies,
    upcomingFollowUps,
    overdueFollowUps,
  ] = await Promise.all([
    db.company.count(),
    db.person.count(),
    db.note.count(),
    db.company.count({ where: { stage: 'Lead' } }),
    db.company.count({ where: { stage: 'Qualified' } }),
    db.company.count({ where: { stage: 'Customer' } }),
    db.company.count({ where: { stage: 'Churned' } }),
    // New = leadStatus == 'new' AND created in last 7 days
    db.company.count({
      where: { leadStatus: 'new', createdAt: { gte: startOf7DaysAgo } },
    }),
    // In progress = leadStatus in [contacted, qualified, brand_report, negotiation]
    db.company.count({
      where: {
        leadStatus: { in: ['contacted', 'qualified', 'brand_report', 'negotiation'] },
      },
    }),
    db.company.count({
      where: { nextFollowUpDate: { gte: startOfToday, lt: endOfToday } },
    }),
    db.company.count({
      where: { nextFollowUpDate: { gte: startOfToday, lt: endOfWeek } },
    }),
    db.company.count({
      where: { nextFollowUpDate: { lt: startOfToday } },
    }),
    db.company.groupBy({ by: ['stage'], _count: true }),
    db.company.groupBy({ by: ['industry'], _count: true, orderBy: { _count: { industry: 'desc' } } }),
    db.company.groupBy({ by: ['leadStatus'], _count: true }),
    db.company.groupBy({ by: ['pipelineStage'], _count: true }),
    db.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        company: { select: { id: true, name: true } },
        person: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      },
    }),
    db.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { people: true, notes: true } },
        contactPerson: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      },
    }),
    // Upcoming follow-ups (today through week)
    db.company.findMany({
      where: { nextFollowUpDate: { gte: startOfToday, lt: endOfWeek } },
      orderBy: { nextFollowUpDate: 'asc' },
      take: 8,
      include: {
        contactPerson: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      },
    }),
    // Overdue
    db.company.findMany({
      where: { nextFollowUpDate: { lt: startOfToday } },
      orderBy: { nextFollowUpDate: 'asc' },
      take: 8,
      include: {
        contactPerson: { select: { id: true, firstName: true, lastName: true, avatarColor: true } },
      },
    }),
  ])

  // Build last 14 days activity series
  const dayMs = 24 * 60 * 60 * 1000
  const series: { date: string; total: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const start = new Date(now.getTime() - i * dayMs)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start.getTime() + dayMs)
    const total = await db.activity.count({
      where: { createdAt: { gte: start, lt: end } },
    })
    series.push({
      date: start.toISOString().slice(0, 10),
      total,
    })
  }

  return NextResponse.json({
    stats: {
      totalCompanies,
      totalPeople,
      totalNotes,
      leadsCount,
      qualifiedCount,
      customerCount,
      churnedCount,
      newLeadsCount,
      inProgressLeadsCount,
      followUpTodayCount,
      followUpWeekCount,
      overdueFollowUpsCount,
    },
    companiesByStage,
    companiesByIndustry,
    companiesByLeadStatus,
    companiesByPipelineStage,
    activitySeries: series,
    recentActivities,
    recentCompanies,
    upcomingFollowUps,
    overdueFollowUps,
  })
}
