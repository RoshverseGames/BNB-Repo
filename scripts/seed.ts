// Seed script for B&B CRM
// Run with: bun run /home/z/my-project/scripts/seed.ts

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const industries = [
  'SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'AI / ML',
  'Cybersecurity', 'EdTech', 'Manufacturing', 'Media', 'Logistics',
]

const cities = [
  ['San Francisco', 'USA'], ['New York', 'USA'], ['London', 'UK'],
  ['Berlin', 'Germany'], ['Paris', 'France'], ['Tokyo', 'Japan'],
  ['Singapore', 'Singapore'], ['Toronto', 'Canada'], ['Sydney', 'Australia'],
  ['Amsterdam', 'Netherlands'],
]

const avatarColors = [
  '#f97316', '#22c55e', '#0ea5e9', '#a855f7',
  '#ec4899', '#eab308', '#14b8a6', '#6366f1',
]

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'Lucas', 'Mia', 'Oliver', 'Amelia', 'Elijah', 'Harper',
  'James', 'Evelyn', 'Benjamin', 'Abigail', 'Henry', 'Emily', 'Alexander',
  'Ella', 'Daniel', 'Scarlett', 'Michael', 'Grace', 'Sebastian', 'Chloe',
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
]

const titles = [
  'CEO', 'CTO', 'CFO', 'VP of Sales', 'VP of Marketing', 'Head of Product',
  'Head of Engineering', 'Director of Operations', 'Sales Director',
  'Marketing Director', 'Product Manager', 'Engineering Manager',
  'Customer Success Lead', 'BizDev Lead', 'COO', 'Chief Revenue Officer',
]

const companyNames = [
  'Nebula Labs', 'Brightwave', 'Quantix', 'Lumen AI', 'Northstar',
  'Apex Dynamics', 'Cobalt', 'Drift Mobility', 'Helix Bio', 'Forge Digital',
  'Pulse Robotics', 'Verve Systems', 'Stratos Cloud', 'Aurora Health',
  'Tessera Pay', 'Pixel Foundry', 'Cascade ML', 'Beacon Security',
  'Mosaic Logistics', 'Indigo Media', 'Onyx Energy', 'Saffron Retail',
  'Zephyr Cloud', 'Trellis Edu', 'Cardinal Insurance', 'Citrine VR',
  'Marble Analytics', 'Polar Foods', 'Ridge Robotics', 'Solstice Travel',
]

const noteSnippets = [
  'Had a great first call — they are evaluating 3 vendors and want a proposal by end of month.',
  'Procurement is asking about SOC2 — sending the latest security pack today.',
  'Champion change: original sponsor moved teams, new POC is the VP of Engineering.',
  'Pricing concern at the enterprise tier; considering a tiered discount for annual commit.',
  'Demo went well. Their main use case is automating customer onboarding workflows.',
  'Followed up on the POC results — strong engagement from the data team.',
  'They are piloting with one squad and will expand if NPS stays above 40.',
  'Contract renewal coming up in Q3. Looking at expanding scope to include the API tier.',
  'Initial outreach via LinkedIn. Open to a 30 min discovery call next week.',
  'Competitor X is in the mix — they liked our deeper integration catalog.',
  'Asked for a comparison sheet between our plan and the open source edition.',
  'Security review passed. Legal is redlining the MSA — minor edits only.',
  'Lost deal last quarter, but new leadership wants to revisit in 60 days.',
  'Customer story approved — they will speak at our annual conference.',
  'Bug reported on the dashboard export; engineering is shipping a fix in v2.4.',
  'Onboarding kickoff scheduled. Migration of legacy data estimated at 2 weeks.',
  'Net new opportunity in EMEA. Localised pricing still needs finance sign-off.',
  'They want a custom SLA — escalating to the CRO before sending terms.',
]

// Default dropdown definitions: field -> list of { value, label, color, isDefault }
const dropdownDefaults: Record<
  string,
  { value: string; label: string; color?: string; isDefault?: boolean }[]
> = {
  leadSource: [
    { value: 'linkedin', label: 'LinkedIn', color: '#0a66c2' },
    { value: 'referral', label: 'Referral', color: '#16a34a' },
    { value: 'website', label: 'Website', color: '#0ea5e9' },
    { value: 'cold_email', label: 'Cold Email', color: '#f59e0b' },
    { value: 'event', label: 'Event', color: '#a855f7' },
    { value: 'paid_ad', label: 'Paid Ad', color: '#ec4899' },
    { value: 'inbound_call', label: 'Inbound Call', color: '#14b8a6' },
    { value: 'other', label: 'Other', color: '#64748b', isDefault: true },
  ],
  employees: [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '501-1000', label: '501-1000' },
    { value: '1000+', label: '1000+' },
  ],
  leadStatus: [
    { value: 'new', label: 'New', color: '#0ea5e9', isDefault: true },
    { value: 'contacted', label: 'Contacted', color: '#6366f1' },
    { value: 'qualified', label: 'Qualified', color: '#14b8a6' },
    { value: 'brand_report', label: 'Brand Report', color: '#a855f7' },
    { value: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
    { value: 'closed_won', label: 'Closed Won', color: '#16a34a' },
    { value: 'closed_lost', label: 'Closed Lost', color: '#ef4444' },
    { value: 'on_hold', label: 'On Hold', color: '#64748b' },
  ],
  pipelineStage: [
    { value: 'awareness', label: 'Awareness', color: '#0ea5e9', isDefault: true },
    { value: 'discovery_call', label: 'Discovery Call', color: '#6366f1' },
    { value: 'brand_audit_done', label: 'Brand Audit Done', color: '#a855f7' },
    { value: 'proposal_sent', label: 'Proposal Sent', color: '#f59e0b' },
    { value: 'contract_review', label: 'Contract Review', color: '#ec4899' },
    { value: 'won', label: 'Won', color: '#16a34a' },
    { value: 'lost', label: 'Lost', color: '#ef4444' },
  ],
  priority: [
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'medium', label: 'Medium', color: '#f59e0b', isDefault: true },
    { value: 'low', label: 'Low', color: '#64748b' },
  ],
  lastChannelUsed: [
    { value: 'email', label: 'Email', color: '#0ea5e9', isDefault: true },
    { value: 'call', label: 'Call', color: '#14b8a6' },
    { value: 'video_call', label: 'Video Call', color: '#a855f7' },
    { value: 'linkedin', label: 'LinkedIn', color: '#0a66c2' },
    { value: 'whatsapp', label: 'WhatsApp', color: '#22c55e' },
    { value: 'in_person', label: 'In-Person', color: '#f59e0b' },
    { value: 'other', label: 'Other', color: '#64748b' },
  ],
  productsServices: [
    { value: 'marketing_services', label: 'Marketing Services', color: '#0ea5e9' },
    { value: 'video_production', label: 'Video Production', color: '#a855f7' },
    { value: 'hbtd', label: 'HBTD', color: '#f59e0b' },
  ],
  wonLostOpen: [
    { value: 'open', label: 'Open', color: '#0ea5e9', isDefault: true },
    { value: 'won', label: 'Won', color: '#16a34a' },
    { value: 'lost', label: 'Lost', color: '#ef4444' },
  ],
  lossReason: [
    { value: 'budget', label: 'Budget', color: '#ef4444' },
    { value: 'no_decision', label: 'No Decision', color: '#64748b' },
    { value: 'competitor_chosen', label: 'Competitor Chosen', color: '#f59e0b' },
    { value: 'wrong_timing', label: 'Wrong Timing', color: '#a855f7' },
    { value: 'no_response', label: 'No Response', color: '#64748b' },
    { value: 'requirement_mismatch', label: 'Requirement Mismatch', color: '#ec4899' },
    { value: 'other', label: 'Other', color: '#64748b' },
  ],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function domainFor(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18) + '.com'
}

async function main() {
  console.log('Clearing existing data…')
  await db.activity.deleteMany()
  await db.note.deleteMany()
  await db.person.deleteMany()
  await db.company.deleteMany()
  await db.dropdownOption.deleteMany()
  await db.companyColumnPref.deleteMany()
  await db.userProfile.deleteMany()

  // 1. Seed user profile (default)
  const user = await db.userProfile.create({
    data: {
      name: 'Alex Bridges',
      email: 'alex@bridgesandblueprints.com',
      title: 'Founder',
      phone: '+1 415 555 0142',
      avatarColor: '#0ea5e9',
      initials: 'AB',
      isDefault: true,
    },
  })
  console.log('Created user:', user.name)

  // 2. Seed dropdown options
  for (const [field, options] of Object.entries(dropdownDefaults)) {
    for (let i = 0; i < options.length; i++) {
      const o = options[i]
      await db.dropdownOption.create({
        data: {
          field,
          value: o.value,
          label: o.label,
          color: o.color ?? null,
          order: i,
          isDefault: o.isDefault ?? false,
        },
      })
    }
  }
  console.log('Seeded dropdown options for', Object.keys(dropdownDefaults).length, 'fields')

  // 3. Seed default column preferences
  const defaultColumns: { field: string; label: string; order: number; visible: boolean }[] = [
    { field: 'name', label: 'Company', order: 0, visible: true },
    { field: 'contactPerson', label: 'Contact Person', order: 1, visible: true },
    { field: 'industry', label: 'Industry', order: 2, visible: true },
    { field: 'employees', label: 'Employees', order: 3, visible: true },
    { field: 'location', label: 'Location', order: 4, visible: true },
    { field: 'leadStatus', label: 'Lead Status', order: 5, visible: true },
    { field: 'pipelineStage', label: 'Pipeline Stage', order: 6, visible: true },
    { field: 'priority', label: 'Priority', order: 7, visible: true },
    { field: 'estimatedDeal', label: 'Estimated Deal', order: 8, visible: true },
    { field: 'nextFollowUpDate', label: 'Next Follow-up', order: 9, visible: true },
    { field: 'wonLostOpen', label: 'Won/Lost/Open', order: 10, visible: true },
    { field: 'createdBy', label: 'Created By', order: 11, visible: true },
    { field: 'updatedAt', label: 'Updated', order: 12, visible: true },
  ]
  for (const col of defaultColumns) {
    await db.companyColumnPref.create({
      data: { ...col, userId: user.id },
    })
  }

  // 4. Seed companies + people + notes + activities
  console.log('Seeding companies, people, notes, activities…')
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000

  const leadSources = dropdownDefaults.leadSource.map((o) => o.value)
  const employeesOpts = dropdownDefaults.employees.map((o) => o.value)
  const leadStatuses = dropdownDefaults.leadStatus.map((o) => o.value)
  const pipelineStages = dropdownDefaults.pipelineStage.map((o) => o.value)
  const priorities = dropdownDefaults.priority.map((o) => o.value)
  const channels = dropdownDefaults.lastChannelUsed.map((o) => o.value)
  const products = dropdownDefaults.productsServices.map((o) => o.value)
  const wonLostOpen = dropdownDefaults.wonLostOpen.map((o) => o.value)

  for (let i = 0; i < companyNames.length; i++) {
    const name = companyNames[i]
    const [city, country] = pick(cities)
    // Make ~25% of companies created in last 7 days (new leads)
    const createdDaysAgo = i < 8 ? randInt(0, 6) : randInt(7, 180)
    const createdAt = new Date(now - createdDaysAgo * DAY)

    const leadStatus = i < 8 ? 'new' : pick(leadStatuses)
    const pipelineStage = pick(pipelineStages)
    const wonLostOpenVal =
      leadStatus === 'closed_won' ? 'won' :
      leadStatus === 'closed_lost' ? 'lost' : pick(wonLostOpen)
    const lossReason = wonLostOpenVal === 'lost' ? pick(dropdownDefaults.lossReason).value : null
    const priority = pick(priorities)
    const firstContactDate = new Date(now - randInt(0, Math.max(1, createdDaysAgo)) * DAY)
    const lastContactDate = new Date(now - randInt(0, 30) * DAY)
    // next follow-up: 70% in past or today, 30% in next 14 days — for nice dashboard data
    const nextFollowUpOffset = Math.random() < 0.5
      ? -randInt(0, 10)  // overdue
      : randInt(0, 14)   // upcoming
    const nextFollowUpDate = new Date(now + nextFollowUpOffset * DAY)
    const expectedCloseDate = new Date(now + randInt(-30, 90) * DAY)
    const dealCloseDate = wonLostOpenVal === 'won' || wonLostOpenVal === 'lost'
      ? new Date(now - randInt(0, 30) * DAY)
      : null
    const productCount = randInt(1, 2)
    const selectedProducts = [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, productCount)

    const company = await db.company.create({
      data: {
        name,
        domain: domainFor(name),
        industry: pick(industries),
        website: `https://${domainFor(name)}`,
        linkedinUrl: `https://linkedin.com/company/${domainFor(name).replace('.com', '')}`,
        employees: pick(employeesOpts),
        revenue: pick(['$0-1M', '$1-10M', '$10-50M', '$50-200M', '$200M+']),
        arr: pick(['$0', '$25K', '$80K', '$150K', '$400K', '$1.2M', '$3.5M']),
        city,
        country,
        address: `${randInt(100, 999)} Market St, ${city}`,
        phone: `+1 ${randInt(200, 999)} ${randInt(200, 999)} ${randInt(1000, 9999)}`,
        description: `${name} builds ${pick(['developer tools', 'data infrastructure', 'workflow automation', 'customer engagement', 'AI agents', 'security tooling', 'payment rails', 'logistics software', 'education platforms', 'media tooling'])} for modern teams.`,
        stage: leadStatus === 'closed_won' ? 'Customer' : leadStatus === 'closed_lost' ? 'Churned' : 'Lead',
        idealProfile: Math.random() > 0.6,
        // New fields
        leadSource: pick(leadSources),
        leadStatus,
        pipelineStage,
        priority,
        wonLostOpen: wonLostOpenVal,
        lossReason,
        productsServices: JSON.stringify(selectedProducts),
        createdById: user.id,
        firstContactDate,
        lastContactDate,
        nextFollowUpDate,
        expectedCloseDate,
        dealCloseDate,
        touchCount: randInt(0, 12),
        lastChannelUsed: pick(channels),
        estimatedDeal: pick(['$5K', '$15K', '$25K', '$50K', '$80K', '$120K', '$250K', '$500K']),
        createdAt,
        updatedAt: new Date(now - randInt(0, createdDaysAgo) * DAY),
      },
    })

    await db.activity.create({
      data: {
        type: 'company_created',
        summary: `Added company ${name}`,
        companyId: company.id,
        createdAt,
      },
    })

    // 1-4 people per company
    const personCount = randInt(1, 4)
    const createdPeople: { id: string; firstName: string; lastName: string }[] = []
    for (let p = 0; p < personCount; p++) {
      const firstName = pick(firstNames)
      const lastName = pick(lastNames)
      const personCreated = new Date(now - randInt(0, createdDaysAgo) * DAY)
      const person = await db.person.create({
        data: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`,
          phone: `+1 ${randInt(200, 999)} ${randInt(200, 999)} ${randInt(1000, 9999)}`,
          title: pick(titles),
          linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randInt(100, 999)}`,
          city: company.city,
          country: company.country,
          avatarColor: pick(avatarColors),
          companyId: company.id,
          createdAt: personCreated,
          updatedAt: personCreated,
        },
      })
      createdPeople.push({ id: person.id, firstName, lastName })

      await db.activity.create({
        data: {
          type: 'person_created',
          summary: `Added contact ${firstName} ${lastName} at ${name}`,
          companyId: company.id,
          personId: person.id,
          createdAt: personCreated,
        },
      })
    }

    // Mark first person as primary contact
    if (createdPeople.length > 0) {
      await db.company.update({
        where: { id: company.id },
        data: { contactPersonId: createdPeople[0].id },
      })
    }

    // 1-4 notes per company
    const noteCount = randInt(1, 4)
    for (let n = 0; n < noteCount; n++) {
      const noteCreated = new Date(now - randInt(0, createdDaysAgo) * DAY)
      const body = pick(noteSnippets)
      const attachToPerson = Math.random() > 0.5 && createdPeople.length > 0
      const person = attachToPerson ? pick(createdPeople) : null

      await db.note.create({
        data: {
          title: body.split('—')[0].slice(0, 60).trim() || 'Note',
          body,
          companyId: company.id,
          personId: person?.id ?? null,
          createdAt: noteCreated,
          updatedAt: noteCreated,
        },
      })

      await db.activity.create({
        data: {
          type: 'note_added',
          summary: `Note added on ${name}${person ? ` · ${person.firstName} ${person.lastName}` : ''}`,
          companyId: company.id,
          personId: person?.id ?? null,
          createdAt: noteCreated,
        },
      })
    }
  }

  // Also seed a few standalone people (no company)
  for (let i = 0; i < 4; i++) {
    const firstName = pick(firstNames)
    const lastName = pick(lastNames)
    const [city, country] = pick(cities)
    const personCreated = new Date(now - randInt(1, 60) * DAY)
    await db.person.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        phone: `+1 ${randInt(200, 999)} ${randInt(200, 999)} ${randInt(1000, 9999)}`,
        title: pick(titles),
        city,
        country,
        avatarColor: pick(avatarColors),
        createdAt: personCreated,
        updatedAt: personCreated,
      },
    })
  }

  const counts = {
    users: await db.userProfile.count(),
    companies: await db.company.count(),
    people: await db.person.count(),
    notes: await db.note.count(),
    activities: await db.activity.count(),
    dropdownOptions: await db.dropdownOption.count(),
    columnPrefs: await db.companyColumnPref.count(),
  }
  console.log('Seed complete:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
