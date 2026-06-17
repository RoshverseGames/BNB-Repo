'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  StickyNote as StickyNoteIcon,
} from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import type { Note } from '@/lib/types'
import { Avatar } from '@/components/crm/avatar'
import { EmptyState } from '@/components/crm/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { timeAgo, formatDateTime } from '@/lib/format'
import { toast } from 'sonner'
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

interface NotesPanelProps {
  companyId?: string
  personId?: string
}

interface NotesResponse {
  items: Note[]
  total: number
}

export function NotesPanel({ companyId, personId }: NotesPanelProps) {
  const params = new URLSearchParams()
  if (companyId) params.set('companyId', companyId)
  if (personId) params.set('personId', personId)
  params.set('pageSize', '100')
  const url = `/api/notes?${params.toString()}`

  const { data, loading, reload, setData } = useFetch<NotesResponse>(url)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const createNote = async () => {
    if (!newBody.trim()) {
      toast.error('Note body is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim() || 'Untitled note',
          body: newBody,
          companyId: companyId ?? null,
          personId: personId ?? null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create note')
      const note = (await res.json()) as Note
      setData({ items: [note, ...(data?.items ?? [])], total: (data?.total ?? 0) + 1 })
      setNewTitle('')
      setNewBody('')
      setCreating(false)
      toast.success('Note added')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async (id: string) => {
    if (!editBody.trim()) {
      toast.error('Note body is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim() || 'Untitled note',
          body: editBody,
        }),
      })
      if (!res.ok) throw new Error('Failed to update note')
      const updated = (await res.json()) as Note
      setData({
        items: (data?.items ?? []).map((n) => (n.id === id ? { ...n, ...updated } : n)),
        total: data?.total ?? 1,
      })
      setEditingId(null)
      toast.success('Note updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/notes/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setData({
        items: (data?.items ?? []).filter((n) => n.id !== deleteId),
        total: Math.max(0, (data?.total ?? 1) - 1),
      })
      toast.success('Note deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setDeleteId(null)
    }
  }

  const startEdit = (n: Note) => {
    setEditingId(n.id)
    setEditTitle(n.title ?? '')
    setEditBody(n.body)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Notes</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
            {data?.total ?? 0}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setCreating((v) => !v)}
          disabled={creating}
        >
          <Plus className="h-3 w-3" />
          Add note
        </Button>
      </div>

      {creating && (
        <div className="border-y border-border bg-muted/30 p-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title (optional)"
            className="mb-2 h-8 text-sm"
          />
          <Textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Write your note…"
            rows={3}
            className="mb-2 text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setCreating(false)
                setNewTitle('')
                setNewBody('')
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={createNote}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save note'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (data?.items?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<StickyNoteIcon className="h-5 w-5" />}
            title="No notes yet"
            description="Capture context from calls, demos, and emails."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-border">
            {data?.items?.map((n) => (
              <li key={n.id} className="group p-3 transition-colors hover:bg-muted/30">
                {editingId === n.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 text-sm font-medium"
                    />
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={4}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3 w-3" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => saveEdit(n.id)}
                        disabled={saving}
                      >
                        <Check className="h-3 w-3" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {n.title && (
                          <p className="truncate text-sm font-medium text-foreground">
                            {n.title}
                          </p>
                        )}
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatDateTime(n.createdAt)}
                          <span className="mx-1">·</span>
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(n)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit note"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setDeleteId(n.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                          title="Delete note"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground/90">{n.body}</p>
                    {n.person && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Avatar
                          name={`${n.person.firstName} ${n.person.lastName}`}
                          color={n.person.avatarColor}
                          size="sm"
                          className="!h-4 !w-4 !text-[8px]"
                        />
                        <span>
                          on {n.person.firstName} {n.person.lastName}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The note will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
