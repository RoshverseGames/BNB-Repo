'use client'

import { useState } from 'react'
import { StickyNote, Search, X, Building2, Users } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useNav } from '@/stores/nav'
import type { Note } from '@/lib/types'
import { Avatar } from '@/components/crm/avatar'
import { EmptyState } from '@/components/crm/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'

interface NotesResponse {
  items: Note[]
  total: number
}

export function NotesView() {
  const { setView } = useNav()
  const [search, setSearch] = useState('')

  const { data, loading } = useFetch<NotesResponse>(
    `/api/notes?pageSize=100&sort=updatedAt:desc`
  )

  const filtered = (data?.items ?? []).filter((n) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (n.title?.toLowerCase().includes(q) ?? false) ||
      n.body.toLowerCase().includes(q) ||
      (n.company?.name.toLowerCase().includes(q) ?? false) ||
      (n.person ? `${n.person.firstName} ${n.person.lastName}`.toLowerCase().includes(q) : false)
    )
  })

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">
          {data?.total ?? 0} notes across companies and people
        </p>
      </div>

      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes by title, body, company, or person…"
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

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-5 w-5" />}
          title={search ? 'No matching notes' : 'No notes yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Notes added on companies or people will appear here.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <NoteCard key={n.id} note={n} onOpenCompany={(id) => setView({ name: 'company', id })} onOpenPerson={(id) => setView({ name: 'person', id })} />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note,
  onOpenCompany,
  onOpenPerson,
}: {
  note: Note
  onOpenCompany: (id: string) => void
  onOpenPerson: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground">
          {note.title || 'Untitled note'}
        </h3>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {formatDate(note.createdAt)}
        </span>
      </div>
      <p className={cn('line-clamp-4 text-xs text-foreground/80 whitespace-pre-wrap')}>
        {note.body}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        {note.company && (
          <button
            onClick={() => onOpenCompany(note.company!.id)}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          >
            <Building2 className="h-2.5 w-2.5" />
            {note.company.name}
          </button>
        )}
        {note.person && (
          <button
            onClick={() => onOpenPerson(note.person!.id)}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          >
            <Avatar
              name={`${note.person.firstName} ${note.person.lastName}`}
              color={note.person.avatarColor}
              size="sm"
              className="!h-3.5 !w-3.5 !text-[7px]"
            />
            {note.person.firstName} {note.person.lastName}
          </button>
        )}
      </div>
    </div>
  )
}
