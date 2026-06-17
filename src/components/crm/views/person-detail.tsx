'use client'

import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Building2,
  Pencil,
  Trash2,
  ExternalLink,
  Users as UsersIcon,
  StickyNote as StickyNoteIcon,
  Clock,
} from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useNav } from '@/stores/nav'
import type { Person, Company } from '@/lib/types'
import { Avatar } from '@/components/crm/avatar'
import { StageBadge } from '@/components/crm/stage-badge'
import { NotesPanel } from '@/components/crm/notes-panel'
import { PersonForm } from '@/components/crm/person-form'
import { EmptyState } from '@/components/crm/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { timeAgo } from '@/lib/format'
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

export function PersonDetailView({ id }: { id: string }) {
  const { data, loading, reload, setData } = useFetch<Person>(`/api/people/${id}`)
  const { setView } = useNav()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const onDelete = async () => {
    try {
      await fetch(`/api/people/${id}`, { method: 'DELETE' })
      toast.success('Person deleted')
      setView({ name: 'people' })
    } catch {
      toast.error('Failed to delete person')
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
        icon={<UsersIcon className="h-5 w-5" />}
        title="Person not found"
        description="It may have been deleted."
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="h-full overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="border-b border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <Avatar
                  name={`${data.firstName} ${data.lastName}`}
                  color={data.avatarColor}
                  size="xl"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-semibold tracking-tight">
                    {data.firstName} {data.lastName}
                  </h1>
                  {data.title && (
                    <p className="text-sm text-muted-foreground">{data.title}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {data.company && (
                      <button
                        onClick={() => setView({ name: 'company', id: data.company!.id })}
                        className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-muted"
                      >
                        <Building2 className="h-3 w-3" />
                        {data.company.name}
                        {data.company.stage && <StageBadge stage={data.company.stage} />}
                      </button>
                    )}
                    <span>Updated {timeAgo(data.updatedAt)}</span>
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

              {/* Quick facts */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data.email && (
                  <Fact
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Email"
                    value={
                      <a
                        href={`mailto:${data.email}`}
                        className="truncate text-foreground hover:underline"
                      >
                        {data.email}
                      </a>
                    }
                  />
                )}
                {data.phone && (
                  <Fact
                    icon={<Phone className="h-3.5 w-3.5" />}
                    label="Phone"
                    value={<span className="text-foreground">{data.phone}</span>}
                  />
                )}
                {(data.city || data.country) && (
                  <Fact
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Location"
                    value={[data.city, data.country].filter(Boolean).join(', ')}
                  />
                )}
                {data.linkedinUrl && (
                  <Fact
                    icon={<Linkedin className="h-3.5 w-3.5" />}
                    label="LinkedIn"
                    value={
                      <a
                        href={data.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-foreground hover:underline"
                      >
                        Profile
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    }
                  />
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
              <div className="bg-background p-4 text-center">
                <p className="text-xl font-semibold tabular-nums">
                  {data._count?.notes ?? 0}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
              </div>
              <div className="bg-background p-4 text-center">
                <p className="text-xl font-semibold tabular-nums">
                  {data._count?.activities ?? 0}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Activities
                </p>
              </div>
              <div className="bg-background p-4 text-center">
                <p className="text-xl font-semibold tabular-nums">
                  {timeAgo(data.createdAt).replace(' ago', '')}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  In CRM
                </p>
              </div>
            </div>

            {/* Activities */}
            {data.activities && data.activities.length > 0 && (
              <div className="p-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Activity timeline
                </h2>
                <ol className="relative space-y-3 border-l border-border pl-4">
                  {data.activities.slice(0, 12).map((a) => (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[1.2rem] top-1.5 h-2 w-2 rounded-full bg-muted-foreground/50 ring-2 ring-background" />
                      <p className="text-sm text-foreground">{a.summary}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(!data.activities || data.activities.length === 0) && (
              <div className="p-6">
                <EmptyState
                  icon={<StickyNoteIcon className="h-5 w-5" />}
                  title="No activity yet"
                  description="Add a note to start the timeline."
                  className="py-10"
                />
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full border-l border-border bg-card">
            <NotesPanel personId={id} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <PersonForm
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={data}
        onSaved={(p) => {
          setData({ ...data, ...p })
          reload()
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {data.firstName} {data.lastName}?
            </AlertDialogTitle>
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
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="mb-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="truncate text-sm">{value || '—'}</div>
    </div>
  )
}
