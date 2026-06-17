'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  SlidersHorizontal,
  Mail,
  Building2,
} from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useNav } from '@/stores/nav'
import type { Person } from '@/lib/types'
import { Avatar } from '@/components/crm/avatar'
import { StageBadge } from '@/components/crm/stage-badge'
import { EmptyState } from '@/components/crm/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/format'

type SortField = 'firstName' | 'lastName' | 'createdAt' | 'updatedAt'
type SortDir = 'asc' | 'desc'

interface PeopleResponse {
  items: Person[]
  total: number
}

export function PeopleView({ onNew }: { onNew: () => void }) {
  const { setView } = useNav()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const sort = `${sortField}:${sortDir}`
  const query = new URLSearchParams({
    search: debouncedSearch,
    companyId: companyFilter !== 'all' ? companyFilter : '',
    sort,
    pageSize: '100',
  }).toString()

  const { data, loading } = useFetch<PeopleResponse>(`/api/people?${query}`, {
    deps: [debouncedSearch, companyFilter, sortField, sortDir],
  })

  const companies = useMemo(() => {
    const map = new Map<string, string>()
    data?.items?.forEach((p) => {
      if (p.company) map.set(p.company.id, p.company.name)
    })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data?.items])

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir(field === 'firstName' || field === 'lastName' ? 'asc' : 'desc')
    }
  }

  const activeFilterCount = companyFilter !== 'all' ? 1 : 0

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">People</h1>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} contacts across all companies
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New person</span>
          </Button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, title, city…"
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
          <label className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Company</span>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setCompanyFilter('all')}
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <SortableTh
                label="Name"
                field="lastName"
                sortField={sortField}
                sortDir={sortDir}
                onClick={toggleSort}
                className="pl-4"
              />
              <th className="hidden h-9 px-3 text-left font-medium md:table-cell">Title</th>
              <th className="hidden h-9 px-3 text-left font-medium lg:table-cell">Email</th>
              <th className="hidden h-9 px-3 text-left font-medium xl:table-cell">Company</th>
              <th className="hidden h-9 px-3 text-left font-medium xl:table-cell">Location</th>
              <th className="hidden h-9 px-3 text-center font-medium sm:table-cell">Notes</th>
              <SortableTh
                label="Updated"
                field="updatedAt"
                sortField={sortField}
                sortDir={sortDir}
                onClick={toggleSort}
                className="pr-4 text-right"
              />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 pl-4"><Skeleton className="h-8 w-40" /></td>
                  <td className="hidden px-3 py-3 md:table-cell"><Skeleton className="h-5 w-24" /></td>
                  <td className="hidden px-3 py-3 lg:table-cell"><Skeleton className="h-5 w-32" /></td>
                  <td className="hidden px-3 py-3 xl:table-cell"><Skeleton className="h-5 w-28" /></td>
                  <td className="hidden px-3 py-3 xl:table-cell"><Skeleton className="h-5 w-24" /></td>
                  <td className="hidden px-3 py-3 sm:table-cell"><Skeleton className="h-5 w-8" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-5 w-16" /></td>
                </tr>
              ))
            ) : (data?.items?.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <EmptyState
                    icon={<Users className="h-5 w-5" />}
                    title="No people found"
                    description={
                      search || activeFilterCount > 0
                        ? 'Try adjusting your search or filters.'
                        : 'Get started by adding your first contact.'
                    }
                    action={
                      !search && activeFilterCount === 0 ? (
                        <Button size="sm" onClick={onNew} className="mt-2 gap-1.5">
                          <Users className="h-3.5 w-3.5" /> Add person
                        </Button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              data?.items?.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setView({ name: 'person', id: p.id })}
                  className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                >
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={`${p.firstName} ${p.lastName}`}
                        color={p.avatarColor}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground md:hidden">
                          {p.title ?? p.email ?? ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 text-muted-foreground md:table-cell">
                    {p.title ?? '—'}
                  </td>
                  <td className="hidden px-3 py-3 lg:table-cell">
                    {p.email ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{p.email}</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    {p.company ? (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{p.company.name}</span>
                        {p.company.stage && <StageBadge stage={p.company.stage} />}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 text-muted-foreground xl:table-cell">
                    {[p.city, p.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="hidden px-3 py-3 text-center tabular-nums text-muted-foreground sm:table-cell">
                    {p._count?.notes ?? 0}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-muted-foreground">
                    {timeAgo(p.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && (data?.items?.length ?? 0) > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {data?.items?.length} of {data?.total} people
          </span>
          <span>
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">N</kbd> to add
          </span>
        </div>
      )}
    </div>
  )
}

function SortableTh({
  label,
  field,
  sortField,
  sortDir,
  onClick,
  className,
}: {
  label: string
  field: SortField
  sortField: SortField
  sortDir: SortDir
  onClick: (f: SortField) => void
  className?: string
}) {
  const active = sortField === field
  return (
    <th className={cn('h-9 px-3 text-left font-medium', className)}>
      <button
        onClick={() => onClick(field)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
          active && 'text-foreground'
        )}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </th>
  )
}
