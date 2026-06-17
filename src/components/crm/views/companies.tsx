'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  SlidersHorizontal,
  Columns3,
  Mail,
  ExternalLink,
  Star,
} from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useNav } from '@/stores/nav'
import type { Company, CompanyColumnPref, DropdownOption } from '@/lib/types'
import { STAGES, ALL_COMPANY_COLUMNS } from '@/lib/types'
import { StageBadge } from '@/components/crm/stage-badge'
import { CompanyAvatar, Avatar } from '@/components/crm/avatar'
import { OptionChip } from '@/components/crm/option-chip'
import { EmptyState } from '@/components/crm/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { timeAgo, formatDate } from '@/lib/format'
import { useDropdownOptions } from '@/hooks/use-dropdown-options'

type SortField = string
type SortDir = 'asc' | 'desc'

interface CompaniesResponse {
  items: Company[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

interface ColumnPrefsResponse {
  items: CompanyColumnPref[]
}

export function CompaniesView({ onNew }: { onNew: () => void }) {
  const { setView } = useNav()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all')
  const [pipelineStageFilter, setPipelineStageFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [wonLostOpenFilter, setWonLostOpenFilter] = useState<string>('all')
  const [followUpFilter, setFollowUpFilter] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [columnsPopoverOpen, setColumnsPopoverOpen] = useState(false)

  // Server-fetched prefs are source of truth. We only keep a draft when the
  // columns popover is open so changes can be edited before being saved.
  const { data: prefsData, reload: reloadPrefs } = useFetch<ColumnPrefsResponse>('/api/column-prefs')
  const [draftPrefs, setDraftPrefs] = useState<CompanyColumnPref[] | null>(null)

  // When popover closes, discard draft.
  const visiblePrefs = (draftPrefs ?? prefsData?.items ?? [])
    .filter((p) => p.visible)
    .sort((a, b) => a.order - b.order)

  const { options } = useDropdownOptions()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const sort = `${sortField}:${sortDir}`
  const query = new URLSearchParams({
    search: debouncedSearch,
    stage: stageFilter,
    industry: industryFilter,
    leadStatus: leadStatusFilter,
    pipelineStage: pipelineStageFilter,
    priority: priorityFilter,
    wonLostOpen: wonLostOpenFilter,
    followUp: followUpFilter,
    sort,
    pageSize: '100',
  }).toString()

  const { data, loading } = useFetch<CompaniesResponse>(`/api/companies?${query}`, {
    deps: [debouncedSearch, stageFilter, industryFilter, leadStatusFilter, pipelineStageFilter, priorityFilter, wonLostOpenFilter, followUpFilter, sortField, sortDir],
  })

  // Build industry options from current data
  const industries = useMemo(() => {
    const set = new Set<string>()
    data?.items?.forEach((c) => c.industry && set.add(c.industry))
    return Array.from(set).sort()
  }, [data?.items])

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir(field === 'name' ? 'asc' : 'desc')
    }
  }

  const activeFilterCount =
    (stageFilter !== 'all' ? 1 : 0) +
    (industryFilter !== 'all' ? 1 : 0) +
    (leadStatusFilter !== 'all' ? 1 : 0) +
    (pipelineStageFilter !== 'all' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0) +
    (wonLostOpenFilter !== 'all' ? 1 : 0) +
    (followUpFilter !== '' ? 1 : 0)

  const clearFilters = () => {
    setStageFilter('all')
    setIndustryFilter('all')
    setLeadStatusFilter('all')
    setPipelineStageFilter('all')
    setPriorityFilter('all')
    setWonLostOpenFilter('all')
    setFollowUpFilter('')
  }

  // Column visibility popover handlers — operate on draftPrefs (a copy of server prefs)
  const allPrefs = draftPrefs ?? prefsData?.items ?? []
  const toggleColumnVisible = (id: string) => {
    setDraftPrefs(
      allPrefs.map((x) => (x.id === id ? { ...x, visible: !x.visible } : x))
    )
  }
  const addColumn = (field: string, label: string) => {
    setDraftPrefs([
      ...allPrefs,
      {
        id: `temp-${Date.now()}`,
        userId: '',
        field,
        label,
        order: allPrefs.length,
        visible: true,
      },
    ])
  }
  const saveColumns = async () => {
    if (!draftPrefs) return
    const items = draftPrefs.map((p, i) => ({
      field: p.field,
      label: p.label,
      order: i,
      visible: p.visible,
    }))
    await fetch('/api/column-prefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    setDraftPrefs(null)
    setColumnsPopoverOpen(false)
    reloadPrefs()
  }

  const availableToAdd = ALL_COMPANY_COLUMNS.filter(
    (c) => !allPrefs.some((p) => p.field === c.field)
  )

  // When opening the popover, initialize draft from server prefs; when closing, discard
  const onPopoverOpenChange = (open: boolean) => {
    setColumnsPopoverOpen(open)
    if (open) {
      setDraftPrefs(prefsData?.items ?? [])
    } else {
      setDraftPrefs(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} companies · your CRM book of business
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Column picker */}
          <Popover open={columnsPopoverOpen} onOpenChange={onPopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
              >
                <Columns3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Visible columns
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin">
                {allPrefs.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={p.visible}
                      onCheckedChange={() => toggleColumnVisible(p.id)}
                    />
                    <span className="flex-1">{p.label}</span>
                  </label>
                ))}
              </div>
              {availableToAdd.length > 0 && (
                <div className="border-t border-border p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Add column
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {availableToAdd.map((c) => (
                      <button
                        key={c.field}
                        onClick={() => addColumn(c.field, c.label)}
                        className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        + {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 border-t border-border p-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => onPopoverOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" className="h-7 text-xs" onClick={saveColumns} disabled={!draftPrefs}>
                  Save
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            className={cn('h-8 gap-1.5', activeFilterCount > 0 && 'border-foreground/30')}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button size="sm" className="h-8 gap-1.5" onClick={onNew}>
            <Building2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New company</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, domain, industry, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-3">
          <FilterChip
            label="Stage"
            value={stageFilter === 'all' ? 'All' : stageFilter}
            options={[{ value: 'all', label: 'All stages' }, ...STAGES.map((s) => ({ value: s, label: s }))]}
            onChange={setStageFilter}
          />
          <FilterChip
            label="Industry"
            value={industryFilter === 'all' ? 'All' : industryFilter}
            options={[{ value: 'all', label: 'All industries' }, ...industries.map((i) => ({ value: i, label: i }))]}
            onChange={setIndustryFilter}
          />
          <FilterChip
            label="Lead Status"
            value={leadStatusFilter === 'all' ? 'All' : leadStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              ...(options.leadStatus ?? []).map((o) => ({ value: o.value, label: o.label })),
            ]}
            onChange={setLeadStatusFilter}
          />
          <FilterChip
            label="Pipeline"
            value={pipelineStageFilter === 'all' ? 'All' : pipelineStageFilter}
            options={[
              { value: 'all', label: 'All stages' },
              ...(options.pipelineStage ?? []).map((o) => ({ value: o.value, label: o.label })),
            ]}
            onChange={setPipelineStageFilter}
          />
          <FilterChip
            label="Priority"
            value={priorityFilter === 'all' ? 'All' : priorityFilter}
            options={[
              { value: 'all', label: 'All priorities' },
              ...(options.priority ?? []).map((o) => ({ value: o.value, label: o.label })),
            ]}
            onChange={setPriorityFilter}
          />
          <FilterChip
            label="Won/Lost/Open"
            value={wonLostOpenFilter === 'all' ? 'All' : wonLostOpenFilter}
            options={[
              { value: 'all', label: 'All' },
              ...(options.wonLostOpen ?? []).map((o) => ({ value: o.value, label: o.label })),
            ]}
            onChange={setWonLostOpenFilter}
          />
          <FilterChip
            label="Follow-up"
            value={followUpFilter === '' ? 'Any' : followUpFilter}
            options={[
              { value: '', label: 'Any time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This week' },
              { value: 'overdue', label: 'Overdue' },
            ]}
            onChange={setFollowUpFilter}
          />
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={clearFilters}
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              {visiblePrefs.map((col) => (
                <ColumnHeader
                  key={col.id}
                  field={col.field}
                  label={col.label}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {visiblePrefs.map((col) => (
                    <td key={col.id} className="px-3 py-3">
                      <Skeleton className="h-5 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (data?.items?.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={visiblePrefs.length || 1} className="p-0">
                  <EmptyState
                    icon={<Building2 className="h-5 w-5" />}
                    title="No companies found"
                    description={
                      search || activeFilterCount > 0
                        ? 'Try adjusting your search or filters.'
                        : 'Get started by adding your first company.'
                    }
                    action={
                      !search && activeFilterCount === 0 ? (
                        <Button size="sm" onClick={onNew} className="mt-2 gap-1.5">
                          <Building2 className="h-3.5 w-3.5" /> Add company
                        </Button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              data?.items?.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setView({ name: 'company', id: c.id })}
                  className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                >
                  {visiblePrefs.map((col) => (
                    <td key={col.id} className="px-3 py-3 align-middle">
                      <CellContent field={col.field} company={c} options={options} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && (data?.items?.length ?? 0) > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {data?.items?.length} of {data?.total} companies
          </span>
          <span>
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">N</kbd> to add ·{' '}
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> to search
          </span>
        </div>
      )}
    </div>
  )
}

function ColumnHeader({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: string
  label: string
  sortField: string
  sortDir: SortDir
  onSort: (f: string) => void
}) {
  const sortableFields = new Set([
    'name', 'industry', 'createdAt', 'updatedAt', 'employees',
    'leadStatus', 'pipelineStage', 'priority', 'wonLostOpen', 'lossReason',
    'leadSource', 'lastChannelUsed', 'nextFollowUpDate', 'firstContactDate',
    'lastContactDate', 'expectedCloseDate', 'dealCloseDate', 'touchCount',
    'estimatedDeal', 'arr', 'revenue',
  ])
  const sortable = sortableFields.has(field)
  const active = sortField === field
  return (
    <th className="h-9 px-3 text-left font-medium">
      <button
        onClick={() => sortable && onSort(field)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors',
          sortable && 'hover:text-foreground',
          active && 'text-foreground',
          !sortable && 'cursor-default'
        )}
        disabled={!sortable}
      >
        {label}
        {sortable && (
          active ? (
            sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          )
        )}
      </button>
    </th>
  )
}

function CellContent({
  field,
  company: c,
  options,
}: {
  field: string
  company: Company
  options: Record<string, DropdownOption[]>
}) {
  switch (field) {
    case 'name':
      return (
        <div className="flex items-center gap-3">
          <CompanyAvatar name={c.name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate font-medium text-foreground">{c.name}</p>
              {c.idealProfile && (
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">{c.domain}</p>
          </div>
        </div>
      )
    case 'contactPerson':
      if (!c.contactPerson) return <span className="text-muted-foreground/60">—</span>
      return (
        <div className="flex items-center gap-2">
          <Avatar
            name={`${c.contactPerson.firstName} ${c.contactPerson.lastName}`}
            color={c.contactPerson.avatarColor}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">
              {c.contactPerson.firstName} {c.contactPerson.lastName}
            </p>
            {c.contactPerson.title && (
              <p className="truncate text-xs text-muted-foreground">{c.contactPerson.title}</p>
            )}
          </div>
        </div>
      )
    case 'website':
      return c.website ? (
        <a
          href={c.website}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <span className="truncate max-w-[140px]">{c.website.replace(/^https?:\/\//, '')}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <span className="text-muted-foreground/60">—</span>
      )
    case 'linkedinUrl':
      return c.linkedinUrl ? (
        <a
          href={c.linkedinUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
        >
          LinkedIn <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-muted-foreground/60">—</span>
      )
    case 'location':
      return (
        <span className="text-muted-foreground">
          {[c.city, c.country].filter(Boolean).join(', ') || '—'}
        </span>
      )
    case 'city':
      return <span className="text-muted-foreground">{c.city || '—'}</span>
    case 'country':
      return <span className="text-muted-foreground">{c.country || '—'}</span>
    case 'phone':
      return <span className="text-muted-foreground">{c.phone || '—'}</span>
    case 'industry':
      return <span className="text-muted-foreground">{c.industry || '—'}</span>
    case 'employees':
      return <span className="text-muted-foreground">{c.employees || '—'}</span>
    case 'revenue':
      return <span className="text-muted-foreground">{c.revenue || '—'}</span>
    case 'arr':
      return <span className="text-muted-foreground">{c.arr || '—'}</span>
    case 'leadSource':
      return <OptionChip value={c.leadSource} options={options.leadSource} />
    case 'leadStatus':
      return <OptionChip value={c.leadStatus} options={options.leadStatus} />
    case 'pipelineStage':
      return <OptionChip value={c.pipelineStage} options={options.pipelineStage} />
    case 'priority':
      return <OptionChip value={c.priority} options={options.priority} />
    case 'lastChannelUsed':
      return <OptionChip value={c.lastChannelUsed} options={options.lastChannelUsed} />
    case 'wonLostOpen':
      return <OptionChip value={c.wonLostOpen} options={options.wonLostOpen} />
    case 'lossReason':
      return <OptionChip value={c.lossReason} options={options.lossReason} />
    case 'estimatedDeal':
      return <span className="font-medium tabular-nums text-foreground">{c.estimatedDeal || '—'}</span>
    case 'productsServices': {
      const values = c.productsServices ? safeParse(c.productsServices) : []
      if (values.length === 0) return <span className="text-muted-foreground/60">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {values.map((v) => (
            <OptionChip key={v} value={v} options={options.productsServices} />
          ))}
        </div>
      )
    }
    case 'firstContactDate':
      return <span className="text-xs text-muted-foreground">{c.firstContactDate ? formatDate(c.firstContactDate) : '—'}</span>
    case 'lastContactDate':
      return <span className="text-xs text-muted-foreground">{c.lastContactDate ? formatDate(c.lastContactDate) : '—'}</span>
    case 'nextFollowUpDate':
      return c.nextFollowUpDate ? (
        <FollowUpCell iso={c.nextFollowUpDate} />
      ) : (
        <span className="text-muted-foreground/60">—</span>
      )
    case 'expectedCloseDate':
      return <span className="text-xs text-muted-foreground">{c.expectedCloseDate ? formatDate(c.expectedCloseDate) : '—'}</span>
    case 'dealCloseDate':
      return <span className="text-xs text-muted-foreground">{c.dealCloseDate ? formatDate(c.dealCloseDate) : '—'}</span>
    case 'touchCount':
      return <span className="tabular-nums text-foreground">{c.touchCount ?? 0}</span>
    case 'createdBy':
      if (!c.createdBy) return <span className="text-muted-foreground/60">—</span>
      return (
        <div className="flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-medium text-white"
            style={{ backgroundColor: c.createdBy.avatarColor }}
          >
            {c.createdBy.initials || c.createdBy.name[0]?.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground">{c.createdBy.name}</span>
        </div>
      )
    case 'stage':
      return <StageBadge stage={c.stage} />
    case 'idealProfile':
      return c.idealProfile ? (
        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      ) : (
        <span className="text-muted-foreground/40">—</span>
      )
    case '_countPeople':
      return <span className="tabular-nums text-muted-foreground">{c._count?.people ?? 0}</span>
    case '_countNotes':
      return <span className="tabular-nums text-muted-foreground">{c._count?.notes ?? 0}</span>
    case 'updatedAt':
      return <span className="text-xs text-muted-foreground">{timeAgo(c.updatedAt)}</span>
    case 'createdAt':
      return <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
    case 'description':
      return <span className="line-clamp-1 text-xs text-muted-foreground">{c.description || '—'}</span>
    case 'domain':
      return <span className="text-xs text-muted-foreground">{c.domain || '—'}</span>
    default:
      return <span className="text-muted-foreground/40">—</span>
  }
}

function FollowUpCell({ iso }: { iso: string }) {
  const d = new Date(iso)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const today = new Date(now)
  today.setDate(today.getDate() + 1)
  const isOverdue = d < now
  const isToday = d >= now && d < today
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
        isOverdue
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          : isToday
          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {formatDate(iso)}
    </span>
  )
}

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v.map(String) : []
  } catch {
    return []
  }
}
