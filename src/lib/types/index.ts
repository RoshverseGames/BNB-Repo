// Shared B&B CRM types — mirror Prisma models for client-side use

export type Stage = 'Lead' | 'Qualified' | 'Customer' | 'Churned'

export interface UserProfile {
  id: string
  name: string
  email: string
  title?: string | null
  phone?: string | null
  avatarColor: string
  initials?: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
  _count?: { companies: number }
}

export interface DropdownOption {
  id: string
  field: string
  value: string
  label: string
  color?: string | null
  order: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CompanyColumnPref {
  id: string
  userId: string
  field: string
  label: string
  order: number
  visible: boolean
  width?: number | null
}

export interface Company {
  id: string
  name: string
  domain?: string | null
  industry?: string | null
  website?: string | null
  linkedinUrl?: string | null
  employees?: string | null
  revenue?: string | null
  arr?: string | null
  city?: string | null
  country?: string | null
  address?: string | null
  phone?: string | null
  description?: string | null
  stage: Stage
  idealProfile: boolean
  // New fields
  leadSource?: string | null
  leadStatus?: string | null
  pipelineStage?: string | null
  priority?: string | null
  wonLostOpen?: string | null
  lossReason?: string | null
  productsServices?: string | null // JSON-encoded array of values
  contactPersonId?: string | null
  contactPerson?: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    title?: string | null
    phone?: string | null
    avatarColor: string
    linkedinUrl?: string | null
  } | null
  createdById?: string | null
  createdBy?: { id: string; name: string; initials?: string | null; avatarColor: string; title?: string | null; email: string } | null
  firstContactDate?: string | null
  lastContactDate?: string | null
  nextFollowUpDate?: string | null
  expectedCloseDate?: string | null
  dealCloseDate?: string | null
  touchCount: number
  lastChannelUsed?: string | null
  estimatedDeal?: string | null
  createdAt: string
  updatedAt: string
  _count?: { people: number; notes: number; activities: number }
  people?: Person[]
  notes?: Note[]
  activities?: Activity[]
}

export interface Person {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  title?: string | null
  linkedinUrl?: string | null
  city?: string | null
  country?: string | null
  avatarColor: string
  companyId?: string | null
  company?: { id: string; name: string; domain?: string | null; stage?: Stage } | null
  createdAt: string
  updatedAt: string
  _count?: { notes: number }
  notes?: Note[]
  activities?: Activity[]
}

export interface Note {
  id: string
  title?: string
  body: string
  companyId?: string | null
  personId?: string | null
  person?: { id: string; firstName: string; lastName: string; avatarColor: string } | null
  company?: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: 'note_added' | 'company_created' | 'person_created' | 'stage_changed'
  summary: string
  companyId?: string | null
  personId?: string | null
  company?: { id: string; name: string } | null
  person?: { id: string; firstName: string; lastName: string; avatarColor: string } | null
  createdAt: string
}

export interface DashboardData {
  stats: {
    totalCompanies: number
    totalPeople: number
    totalNotes: number
    leadsCount: number
    qualifiedCount: number
    customerCount: number
    churnedCount: number
    newLeadsCount: number
    inProgressLeadsCount: number
    followUpTodayCount: number
    followUpWeekCount: number
    overdueFollowUpsCount: number
  }
  companiesByStage: { stage: string; _count: number }[]
  companiesByIndustry: { industry: string; _count: number }[]
  companiesByLeadStatus: { leadStatus: string; _count: number }[]
  companiesByPipelineStage: { pipelineStage: string; _count: number }[]
  activitySeries: { date: string; total: number }[]
  recentActivities: (Activity & {
    company?: { id: string; name: string } | null
    person?: { id: string; firstName: string; lastName: string; avatarColor: string } | null
  })[]
  recentCompanies: (Company & { _count: { people: number; notes: number } })[]
  upcomingFollowUps: (Company & {
    contactPerson?: { id: string; firstName: string; lastName: string; avatarColor: string } | null
  })[]
  overdueFollowUps: (Company & {
    contactPerson?: { id: string; firstName: string; lastName: string; avatarColor: string } | null
  })[]
}

export type View =
  | { name: 'dashboard' }
  | { name: 'companies' }
  | { name: 'company'; id: string }
  | { name: 'people' }
  | { name: 'person'; id: string }
  | { name: 'notes' }
  | { name: 'settings' }

export const STAGES: Stage[] = ['Lead', 'Qualified', 'Customer', 'Churned']

export const STAGE_STYLES: Record<Stage, { label: string; dot: string; chip: string }> = {
  Lead: {
    label: 'Lead',
    dot: 'bg-amber-500',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  Qualified: {
    label: 'Qualified',
    dot: 'bg-sky-500',
    chip: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
  },
  Customer: {
    label: 'Customer',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
  Churned: {
    label: 'Churned',
    dot: 'bg-rose-500',
    chip: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  },
}

// Field labels for company columns
export const FIELD_LABELS: Record<string, string> = {
  name: 'Company',
  contactPerson: 'Contact Person',
  website: 'Website',
  linkedinUrl: 'LinkedIn',
  location: 'Location',
  leadSource: 'Lead Source',
  industry: 'Industry',
  employees: 'Employees',
  arr: 'ARR',
  leadStatus: 'Lead Status',
  pipelineStage: 'Pipeline Stage',
  priority: 'Priority',
  createdBy: 'Created By',
  firstContactDate: 'First Contact',
  lastContactDate: 'Last Contact',
  nextFollowUpDate: 'Next Follow-up',
  touchCount: 'No. of Touches',
  lastChannelUsed: 'Last Channel',
  estimatedDeal: 'Estimated Deal',
  expectedCloseDate: 'Expected Close',
  productsServices: 'Products / Services',
  wonLostOpen: 'Won/Lost/Open',
  lossReason: 'Loss Reason',
  dealCloseDate: 'Deal Close Date',
  domain: 'Domain',
  revenue: 'Revenue',
  city: 'City',
  country: 'Country',
  phone: 'Phone',
  description: 'Description',
  stage: 'Legacy Stage',
  idealProfile: 'Ideal Profile',
  updatedAt: 'Updated',
  createdAt: 'Created',
  _countPeople: 'People Count',
  _countNotes: 'Notes Count',
}

// All selectable company columns for the column picker
export const ALL_COMPANY_COLUMNS: { field: string; label: string }[] = [
  { field: 'name', label: 'Company' },
  { field: 'contactPerson', label: 'Contact Person' },
  { field: 'website', label: 'Website' },
  { field: 'linkedinUrl', label: 'LinkedIn' },
  { field: 'location', label: 'Location' },
  { field: 'leadSource', label: 'Lead Source' },
  { field: 'industry', label: 'Industry' },
  { field: 'employees', label: 'Employees' },
  { field: 'arr', label: 'ARR' },
  { field: 'leadStatus', label: 'Lead Status' },
  { field: 'pipelineStage', label: 'Pipeline Stage' },
  { field: 'priority', label: 'Priority' },
  { field: 'createdBy', label: 'Created By' },
  { field: 'firstContactDate', label: 'First Contact' },
  { field: 'lastContactDate', label: 'Last Contact' },
  { field: 'nextFollowUpDate', label: 'Next Follow-up' },
  { field: 'touchCount', label: 'No. of Touches' },
  { field: 'lastChannelUsed', label: 'Last Channel' },
  { field: 'estimatedDeal', label: 'Estimated Deal' },
  { field: 'expectedCloseDate', label: 'Expected Close' },
  { field: 'productsServices', label: 'Products / Services' },
  { field: 'wonLostOpen', label: 'Won/Lost/Open' },
  { field: 'lossReason', label: 'Loss Reason' },
  { field: 'dealCloseDate', label: 'Deal Close Date' },
  { field: '_countPeople', label: 'People Count' },
  { field: '_countNotes', label: 'Notes Count' },
  { field: 'updatedAt', label: 'Updated' },
  { field: 'createdAt', label: 'Created' },
]

// Dropdown field keys
export const DROPDOWN_FIELDS = [
  'leadSource',
  'employees',
  'leadStatus',
  'pipelineStage',
  'priority',
  'lastChannelUsed',
  'productsServices',
  'wonLostOpen',
  'lossReason',
] as const

export const DROPDOWN_FIELD_LABELS: Record<string, string> = {
  leadSource: 'Lead Source',
  employees: 'Employees',
  leadStatus: 'Lead Status',
  pipelineStage: 'Pipeline Stage',
  priority: 'Priority',
  lastChannelUsed: 'Last Channel Used',
  productsServices: 'Products / Services',
  wonLostOpen: 'Won / Lost / Open',
  lossReason: 'Loss Reason',
}
