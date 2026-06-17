'use client'

import { useState } from 'react'
import {
  Globe,
  MapPin,
  Phone,
  Linkedin,
  Building2,
  Users as UsersIcon,
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  Plus,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  Activity as ActivityIcon,
  UserCircle,
} from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useNav } from '@/stores/nav'
import type { Company, DropdownOption } from '@/lib/types'
import { StageSelect, StageBadge } from '@/components/crm/stage-badge'
import { CompanyAvatar, Avatar } from '@/components/crm/avatar'
import { OptionChip } from '@/components/crm/option-chip'
import { NotesPanel } from '@/components/crm/notes-panel'
import { CompanyForm } from '@/components/crm/company-form'
import { PersonForm } from '@/components/crm/person-form'
import { EmptyState } from '@/components/crm/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { timeAgo, formatDate, formatDateTime } from '@/lib/format'
import { useDropdownOptions } from '@/hooks/use-dropdown-options'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

export function CompanyDetailView({ id }: { id: string }) {
  const { data, loading, reload, setData } = useFetch<Company>(`/api/companies/${id}`)
  const { options } = useDropdownOptions()
  const { setView } = useNav()
  const [editOpen, setEditOpen] = useState(false)
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateStage = async (stage: Company['stage']) => {
    if (!data) return
    setData({ ...data, stage })
    try {
      await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      })
      toast.success(`Stage updated to ${stage}`)
    } catch {
      toast.error('Failed to update stage')
      reload()
    }
  }

  const toggleIdeal = async () => {
    if (!data) return
    const idealProfile = !data.idealProfile
    setData({ ...data, idealProfile })
    try {
      await fetch(`/api/companies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idealProfile }),
      })
    } catch {
      reload()
    }
  }

  const onDelete = async () => {
    try {
      await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      toast.success('Company deleted')
      setView({ name: 'companies' })
    } catch {
      toast.error('Failed to delete company')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        icon={<Building2 className="h-5 w-5" />}
        title="Company not found"
        description="It may have been deleted."
      />
    )
  }

  const productValues = data.productsServices ? safeParse(data.productsServices) : []

  return (
    <div className="flex h-full flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left/main panel */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="h-full overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="border-b border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <CompanyAvatar name={data.name} size="xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-xl font-semibold tracking-tight">
                      {data.name}
                    </h1>
                    <button
                      onClick={toggleIdeal}
                      title={data.idealProfile ? 'Ideal profile' : 'Mark as ideal'}
                      className={`rounded p-1 transition-colors ${
                        data.idealProfile
                          ? 'text-amber-500'
                          : 'text-muted-foreground/40 hover:text-amber-500'
                      }`}
                    >
                      <Star className="h-4 w-4" fill={data.idealProfile ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  {data.domain && (
                    <a
                      href={data.website ?? `https://${data.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {data.domain}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StageBadge stage={data.stage} />
                    <OptionChip value={data.leadStatus} options={options.leadStatus} />
                    <OptionChip value={data.priority} options={options.priority} />
                    <OptionChip value={data.wonLostOpen} options={options.wonLostOpen} />
                    <span className="text-xs text-muted-foreground">
                      Updated {timeAgo(data.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Quick facts row 1 */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Fact icon={<Building2 className="h-3.5 w-3.5" />} label="Industry" value={data.industry} />
                <Fact icon={<UsersIcon className="h-3.5 w-3.5" />} label="Employees" value={data.employees} />
                <Fact icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={[data.city, data.country].filter(Boolean).join(', ') || undefined} />
                <Fact icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={data.phone} />
                <Fact icon={<Globe className="h-3.5 w-3.5" />} label="Revenue" value={data.revenue} />
              </div>

              {/* Quick facts row 2 — lead/pipeline */}
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Fact icon={<Tag className="h-3.5 w-3.5" />} label="Lead Source" value={chipLabel(data.leadSource, options.leadSource)} />
                <Fact icon={<ActivityIcon className="h-3.5 w-3.5" />} label="Pipeline Stage" value={chipLabel(data.pipelineStage, options.pipelineStage)} />
                <Fact icon={<DollarSign className="h-3.5 w-3.5" />} label="ARR" value={data.arr} />
                <Fact icon={<DollarSign className="h-3.5 w-3.5" />} label="Est. Deal" value={data.estimatedDeal} />
                <Fact icon={<Mail className="h-3.5 w-3.5" />} label="Last Channel" value={chipLabel(data.lastChannelUsed, options.lastChannelUsed)} />
              </div>

              {/* Created by + dates */}
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Fact
                  icon={<UserCircle className="h-3.5 w-3.5" />}
                  label="Created By"
                  value={data.createdBy?.name ?? '—'}
                />
                <Fact
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="First Contact"
                  value={data.firstContactDate ? formatDate(data.firstContactDate) : undefined}
                />
                <Fact
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Last Contact"
                  value={data.lastContactDate ? formatDate(data.lastContactDate) : undefined}
                />
                <Fact
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Next Follow-up"
                  value={data.nextFollowUpDate ? formatDate(data.nextFollowUpDate) : undefined}
                />
                <Fact
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Touches"
                  value={String(data.touchCount ?? 0)}
                />
              </div>

              {/* Loss reason + dates */}
              {(data.lossReason || data.expectedCloseDate || data.dealCloseDate) && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <Fact icon={<Tag className="h-3.5 w-3.5" />} label="Loss Reason" value={chipLabel(data.lossReason, options.lossReason)} />
                  <Fact icon={<Calendar className="h-3.5 w-3.5" />} label="Expected Close" value={data.expectedCloseDate ? formatDate(data.expectedCloseDate) : undefined} />
                  <Fact icon={<Calendar className="h-3.5 w-3.5" />} label="Deal Close" value={data.dealCloseDate ? formatDate(data.dealCloseDate) : undefined} />
                </div>
              )}

              {/* Products */}
              {productValues.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Products / Services:</span>
                  {productValues.map((v) => (
                    <OptionChip key={v} value={v} options={options.productsServices} />
                  ))}
                </div>
              )}
            </div>

            {/* Stage inline editor */}
            <div className="border-b border-border bg-background px-6 py-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Stage</span>
                <StageSelect value={data.stage} onChange={updateStage} />
                {data.linkedinUrl && (
                  <a
                    href={data.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Contact person */}
            {data.contactPerson && (
              <div className="border-b border-border p-6">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Primary contact
                </h2>
                <button
                  onClick={() => setView({ name: 'person', id: data.contactPerson!.id })}
                  className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-muted/40"
                >
                  <Avatar
                    name={`${data.contactPerson.firstName} ${data.contactPerson.lastName}`}
                    color={data.contactPerson.avatarColor}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-foreground">
                      {data.contactPerson.firstName} {data.contactPerson.lastName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{data.contactPerson.title ?? '—'}</p>
                    {data.contactPerson.email && (
                      <a
                        href={`mailto:${data.contactPerson.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <Mail className="h-3 w-3" /> {data.contactPerson.email}
                      </a>
                    )}
                  </div>
                </button>
              </div>
            )}

            {/* Description */}
            {data.description && (
              <div className="border-b border-border p-6">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  About
                </h2>
                <p className="text-sm text-foreground/90">{data.description}</p>
              </div>
            )}

            {/* People */}
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  People
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {data.people?.length ?? 0}
                  </span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => setAddPersonOpen(true)}
                >
                  <Plus className="h-3 w-3" /> Add person
                </Button>
              </div>

              {(data.people?.length ?? 0) === 0 ? (
                <EmptyState
                  icon={<UsersIcon className="h-5 w-5" />}
                  title="No contacts yet"
                  description="Add people from this company."
                  className="py-8"
                />
              ) : (
                <ul className="divide-y divide-border rounded-md border border-border">
                  {data.people?.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setView({ name: 'person', id: p.id })}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/40"
                      >
                        <Avatar
                          name={`${p.firstName} ${p.lastName}`}
                          color={p.avatarColor}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.title ?? '—'}
                          </p>
                        </div>
                        {p.email && (
                          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                            <Mail className="h-3 w-3" />
                            {p.email}
                          </span>
                        )}
                        {p._count?.notes ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                            {p._count.notes} notes
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Activities */}
            {data.activities && data.activities.length > 0 && (
              <div className="border-t border-border p-6">
                <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
                <ul className="space-y-1">
                  {data.activities.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      <span className="flex-1">{a.summary}</span>
                      <span className="shrink-0">{timeAgo(a.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right notes panel */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full border-l border-border bg-card">
            <NotesPanel companyId={id} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <CompanyForm
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={data}
        onSaved={(c) => {
          setData({ ...data, ...c })
          reload()
        }}
      />

      <PersonForm
        open={addPersonOpen}
        onOpenChange={setAddPersonOpen}
        defaultCompanyId={id}
        companyOptions={[{ id: data.id, name: data.name }]}
        onSaved={() => reload()}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {data.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all related notes and activities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
}) {
  return (
    <div className="min-w-0">
      <div className="mb-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="truncate text-sm text-foreground">{value || '—'}</p>
    </div>
  )
}

function chipLabel(value: string | null | undefined, options?: DropdownOption[]): string | undefined {
  if (!value) return undefined
  const o = options?.find((x) => x.value === value)
  return o?.label ?? value
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v.map(String) : []
  } catch {
    return []
  }
}
