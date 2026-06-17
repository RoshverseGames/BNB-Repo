'use client'

import {
  Building2,
  Users,
  StickyNote,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  Minus,
  Calendar,
  CalendarClock,
  CalendarX,
  Sparkles,
  Loader2,
  Flame,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useFetch } from '@/hooks/use-fetch'
import type { DashboardData } from '@/lib/types'
import { useNav } from '@/stores/nav'
import { StageBadge } from '@/components/crm/stage-badge'
import { CompanyAvatar, Avatar } from '@/components/crm/avatar'
import { EmptyState } from '@/components/crm/empty-state'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { timeAgo, formatDate } from '@/lib/format'

const STAGE_COLORS: Record<string, string> = {
  Lead: '#f59e0b',
  Qualified: '#0ea5e9',
  Customer: '#10b981',
  Churned: '#f43f5e',
}

export function DashboardView({ onNew }: { onNew: () => void }) {
  const { data, loading } = useFetch<DashboardData>('/api/dashboard')
  const { setView } = useNav()

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline health, follow-ups, and recent activity.
        </p>
      </div>

      {/* Top stat row — Lead counts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Total Leads"
          value={data?.stats.totalCompanies}
          loading={loading}
          subtitle="All companies"
          onClick={() => setView({ name: 'companies' })}
        />
        <StatCard
          icon={<Sparkles className="h-4 w-4" />}
          label="New Leads"
          value={data?.stats.newLeadsCount}
          loading={loading}
          subtitle="Created in last 7 days"
          accent="sky"
          onClick={() => setView({ name: 'companies' })}
        />
        <StatCard
          icon={<Loader2 className="h-4 w-4" />}
          label="In Progress"
          value={data?.stats.inProgressLeadsCount}
          loading={loading}
          subtitle="Contacted → Negotiation"
          accent="amber"
          onClick={() => setView({ name: 'companies' })}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Customers Won"
          value={data?.stats.customerCount}
          loading={loading}
          subtitle={`${data?.stats.leadsCount ?? 0} open leads`}
          accent="emerald"
          onClick={() => setView({ name: 'companies' })}
        />
      </div>

      {/* Follow-up row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FollowUpCard
          icon={<Calendar className="h-4 w-4" />}
          label="Follow-up Today"
          value={data?.stats.followUpTodayCount}
          loading={loading}
          accent="sky"
          onClick={() => setView({ name: 'companies' })}
        />
        <FollowUpCard
          icon={<CalendarClock className="h-4 w-4" />}
          label="Follow-up This Week"
          value={data?.stats.followUpWeekCount}
          loading={loading}
          accent="violet"
          onClick={() => setView({ name: 'companies' })}
        />
        <FollowUpCard
          icon={<CalendarX className="h-4 w-4" />}
          label="Overdue Follow-ups"
          value={data?.stats.overdueFollowUpsCount}
          loading={loading}
          accent="rose"
          onClick={() => setView({ name: 'companies' })}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="People"
          value={data?.stats.totalPeople}
          loading={loading}
          onClick={() => setView({ name: 'people' })}
        />
        <StatCard
          icon={<StickyNote className="h-4 w-4" />}
          label="Notes"
          value={data?.stats.totalNotes}
          loading={loading}
          onClick={() => setView({ name: 'notes' })}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Qualified"
          value={data?.stats.qualifiedCount}
          loading={loading}
          onClick={() => setView({ name: 'companies' })}
        />
        <StatCard
          icon={<Minus className="h-4 w-4" />}
          label="Churned"
          value={data?.stats.churnedCount}
          loading={loading}
          accent="rose"
          onClick={() => setView({ name: 'companies' })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Activity chart */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Activity (last 14 days)</h2>
            <p className="text-xs text-muted-foreground">
              Notes added, contacts created, stage changes
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.activitySeries ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(d: string) => d.slice(5).replace('-', '/')}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      fontSize: 12,
                      color: 'var(--popover-foreground)',
                    }}
                    labelFormatter={(d: string) => d}
                    formatter={(v: number) => [v, 'Events']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--foreground)"
                    strokeWidth={1.5}
                    fill="url(#activityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pipeline by stage */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Pipeline by stage</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <StageBreakdown stages={data?.companiesByStage ?? []} />
          )}
        </div>
      </div>

      {/* Follow-up lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FollowUpList
          title="Overdue follow-ups"
          icon={<Flame className="h-4 w-4 text-rose-500" />}
          items={data?.overdueFollowUps ?? []}
          loading={loading}
          emptyText="No overdue follow-ups 🎉"
          tone="rose"
          onSelect={(id) => setView({ name: 'company', id })}
        />
        <FollowUpList
          title="Upcoming follow-ups (this week)"
          icon={<CalendarClock className="h-4 w-4 text-violet-500" />}
          items={data?.upcomingFollowUps ?? []}
          loading={loading}
          emptyText="Nothing scheduled this week."
          tone="violet"
          onSelect={(id) => setView({ name: 'company', id })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Recent activity</h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (data?.recentActivities?.length ?? 0) === 0 ? (
            <EmptyState icon={<Clock className="h-5 w-5" />} title="No activity yet" />
          ) : (
            <ul className="space-y-1">
              {data?.recentActivities?.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted/50"
                >
                  <ActivityDot type={a.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">{a.summary}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recently added companies */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">New companies</h2>
            <button
              onClick={() => setView({ name: 'companies' })}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all →
            </button>
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ul className="space-y-1">
              {data?.recentCompanies?.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setView({ name: 'company', id: c.id })}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/50"
                  >
                    <CompanyAvatar name={c.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.industry} · {c._count.people} people
                      </p>
                    </div>
                    <StageBadge stage={c.stage} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  loading,
  trend,
  subtitle,
  accent = 'default',
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value?: number
  loading: boolean
  trend?: number
  subtitle?: string
  accent?: 'default' | 'sky' | 'amber' | 'emerald' | 'rose'
  onClick?: () => void
}) {
  const accentClasses = {
    default: 'bg-muted text-muted-foreground',
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  }
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20"
    >
      <div className="flex items-center justify-between">
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', accentClasses[accent])}>
          {icon}
        </span>
        {trend !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value ?? 0}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/70">{subtitle}</p>}
      </div>
    </button>
  )
}

function FollowUpCard({
  icon,
  label,
  value,
  loading,
  accent,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value?: number
  loading: boolean
  accent: 'sky' | 'violet' | 'rose'
  onClick?: () => void
}) {
  const accentClasses = {
    sky: 'border-sky-500/30 bg-sky-500/5 text-sky-600 dark:text-sky-400',
    violet: 'border-violet-500/30 bg-violet-500/5 text-violet-600 dark:text-violet-400',
    rose: 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400',
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-foreground/20',
        accentClasses[accent]
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-background/60">
        {icon}
      </span>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value ?? 0}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </button>
  )
}

function StageBreakdown({ stages }: { stages: { stage: string; _count: number }[] }) {
  const total = stages.reduce((sum, s) => sum + s._count, 0) || 1
  const order = ['Lead', 'Qualified', 'Customer', 'Churned']
  const sorted = order
    .map((s) => stages.find((x) => x.stage === s) ?? { stage: s, _count: 0 })
    .filter(Boolean)

  return (
    <div className="space-y-3">
      {sorted.map((s) => {
        const pct = (s._count / total) * 100
        return (
          <div key={s.stage} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <StageBadge stage={s.stage as never} />
              <span className="text-muted-foreground tabular-nums">
                {s._count} · {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: STAGE_COLORS[s.stage] ?? '#94a3b8',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FollowUpList({
  title,
  icon,
  items,
  loading,
  emptyText,
  tone,
  onSelect,
}: {
  title: string
  icon: React.ReactNode
  items: DashboardData['upcomingFollowUps']
  loading: boolean
  emptyText: string
  tone: 'rose' | 'violet'
  onSelect: (id: string) => void
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
          {items?.length ?? 0}
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (items?.length ?? 0) === 0 ? (
        <EmptyState title={emptyText} className="py-8" />
      ) : (
        <ul className="space-y-1">
          {items?.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/50"
              >
                <CompanyAvatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  {c.contactPerson && (
                    <p className="truncate text-xs text-muted-foreground">
                      {c.contactPerson.firstName} {c.contactPerson.lastName}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
                    tone === 'rose'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                  )}
                >
                  {formatDate(c.nextFollowUpDate!)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ActivityDot({ type }: { type: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    note_added: { color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', icon: <Plus className="h-3 w-3" /> },
    company_created: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: <Building2 className="h-3 w-3" /> },
    person_created: { color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: <Users className="h-3 w-3" /> },
    stage_changed: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: <Minus className="h-3 w-3" /> },
  }
  const m = map[type] ?? map.note_added
  return (
    <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', m.color)}>
      {m.icon}
    </span>
  )
}
