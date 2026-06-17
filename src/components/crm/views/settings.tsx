'use client'

import { useEffect, useState } from 'react'
import {
  User as UserIcon,
  Palette,
  Columns3,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  GripVertical,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { Avatar } from '@/components/crm/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn, hexToRgba } from '@/lib/utils'
import {
  DROPDOWN_FIELDS,
  DROPDOWN_FIELD_LABELS,
  ALL_COMPANY_COLUMNS,
  type UserProfile,
  type DropdownOption,
  type CompanyColumnPref,
} from '@/lib/types'
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

const AVATAR_COLORS = [
  '#0ea5e9', '#f97316', '#22c55e', '#a855f7',
  '#ec4899', '#eab308', '#14b8a6', '#6366f1',
  '#ef4444', '#64748b',
]

const DEFAULT_COLOR_PALETTE = [
  '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#14b8a6',
  '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#64748b',
  '#0a66c2', '#16a34a',
]

export function SettingsView() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your user profile, dropdown options, and Companies table columns.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile" className="gap-1.5">
            <UserIcon className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="dropdowns" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Dropdowns
          </TabsTrigger>
          <TabsTrigger value="columns" className="gap-1.5">
            <Columns3 className="h-3.5 w-3.5" /> Columns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="dropdowns">
          <DropdownsTab />
        </TabsContent>
        <TabsContent value="columns">
          <ColumnsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile tab
// ---------------------------------------------------------------------------
function ProfileTab() {
  const { data, loading, reload } = useFetch<UserProfile>('/api/user')

  if (loading || !data) return <Skeleton className="h-96 w-full" />
  return <ProfileForm key={data.id} initial={data} onSaved={reload} />
}

function ProfileForm({
  initial,
  onSaved,
}: {
  initial: UserProfile
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    email: initial.email ?? '',
    title: initial.title ?? '',
    phone: initial.phone ?? '',
    avatarColor: initial.avatarColor ?? '#0ea5e9',
    initials: initial.initials ?? (initial.name ? initial.name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() : ''),
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Profile saved')
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-4">
        <Avatar
          name={form.initials || form.name || 'U'}
          color={form.avatarColor}
          size="xl"
        />
        <div>
          <h2 className="text-base font-semibold">{form.name || 'Your name'}</h2>
          <p className="text-sm text-muted-foreground">{form.title || 'Your title'}</p>
          <p className="text-xs text-muted-foreground/70">
            This profile appears in the “Created By” column on Companies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Alex Bridges"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="alex@bridgesandblueprints.com"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Founder"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 415 555 0142"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Initials</Label>
          <Input
            value={form.initials}
            onChange={(e) => setForm({ ...form, initials: e.target.value.toUpperCase().slice(0, 3) })}
            placeholder="AB"
            maxLength={3}
          />
          <p className="mt-1 text-[10px] text-muted-foreground/70">Auto-derived from name if blank.</p>
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Avatar color</Label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, avatarColor: c })}
                className={cn(
                  'h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                  form.avatarColor === c ? 'ring-foreground' : 'ring-transparent'
                )}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dropdowns tab
// ---------------------------------------------------------------------------
function DropdownsTab() {
  const { data, loading, reload } = useFetch<{ items: DropdownOption[]; grouped: Record<string, DropdownOption[]> }>(
    '/api/dropdown-options'
  )
  const [activeField, setActiveField] = useState<string>(DROPDOWN_FIELDS[0])

  if (loading) return <Skeleton className="h-96 w-full" />

  const options = data?.grouped?.[activeField] ?? []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
      {/* Field picker */}
      <div className="space-y-1">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Fields
        </p>
        {DROPDOWN_FIELDS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveField(f)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
              activeField === f
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            <span>{DROPDOWN_FIELD_LABELS[f]}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {data?.grouped?.[f]?.length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Options editor */}
      <DropdownFieldEditor
        field={activeField}
        options={options}
        onChange={reload}
      />
    </div>
  )
}

function DropdownFieldEditor({
  field,
  options,
  onChange,
}: {
  field: string
  options: DropdownOption[]
  onChange: () => void
}) {
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState<string>(DEFAULT_COLOR_PALETTE[0])
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editColor, setEditColor] = useState<string>('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const create = async () => {
    if (!newLabel.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/dropdown-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          value: newLabel.toLowerCase().replace(/\s+/g, '_'),
          label: newLabel.trim(),
          color: newColor,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed')
      }
      toast.success('Option added')
      setNewLabel('')
      onChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (o: DropdownOption) => {
    setEditingId(o.id)
    setEditLabel(o.label)
    setEditColor(o.color ?? DEFAULT_COLOR_PALETTE[0])
  }

  const saveEdit = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/dropdown-options/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editLabel.trim(),
          color: editColor,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Option updated')
      setEditingId(null)
      onChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const setDefault = async (o: DropdownOption) => {
    try {
      await fetch(`/api/dropdown-options/${o.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      toast.success(`"${o.label}" set as default`)
      onChange()
    } catch {
      toast.error('Failed')
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/dropdown-options/${deleteId}`, { method: 'DELETE' })
      toast.success('Option deleted')
      onChange()
    } catch {
      toast.error('Failed')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-sm font-semibold">{DROPDOWN_FIELD_LABELS[field]}</h3>
          <p className="text-xs text-muted-foreground">
            Add, edit, recolor, or delete options. Changes apply everywhere this dropdown is used.
          </p>
        </div>
      </div>

      {/* Add new */}
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[180px]">
            <Label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              New option label
            </Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="e.g. Trade Show"
              className="h-8"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Color
            </Label>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
          <Button size="sm" onClick={create} disabled={creating || !newLabel.trim()} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Existing options */}
      <ul className="divide-y divide-border">
        {options.length === 0 && (
          <li className="p-6 text-center text-sm text-muted-foreground">
            No options yet. Add one above.
          </li>
        )}
        {options.map((o) => (
          <li key={o.id} className="flex items-center gap-3 p-3">
            {editingId === o.id ? (
              <>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="h-8 flex-1"
                  autoFocus
                />
                <ColorPicker value={editColor} onChange={setEditColor} compact />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditingId(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 w-8 p-0"
                  onClick={() => saveEdit(o.id)}
                  disabled={saving}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: o.color ? hexToRgba(o.color, 0.12) : 'var(--muted)',
                    color: o.color ?? 'var(--muted-foreground)',
                    borderColor: o.color ? hexToRgba(o.color, 0.25) : 'var(--border)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: o.color || 'currentColor' }}
                  />
                  {o.label}
                  {o.isDefault && (
                    <span className="ml-1 rounded bg-foreground/10 px-1 py-0 text-[9px] uppercase tracking-wide">
                      Default
                    </span>
                  )}
                </span>
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-mono text-[10px] opacity-60">{o.value}</span>
                </span>
                {!o.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => setDefault(o)}
                  >
                    Set default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => startEdit(o)}
                  title="Edit"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                  onClick={() => setDeleteId(o.id)}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this option?</AlertDialogTitle>
            <AlertDialogDescription>
              Companies currently using this option will have that field cleared.
              This action cannot be undone.
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

function ColorPicker({
  value,
  onChange,
  compact,
}: {
  value: string
  onChange: (v: string) => void
  compact?: boolean
}) {
  return (
    <div className={cn('flex flex-wrap gap-1', compact && 'flex-nowrap')}>
      {DEFAULT_COLOR_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            'h-6 w-6 rounded-full ring-1 ring-offset-1 ring-offset-background transition-all',
            value === c ? 'ring-foreground scale-110' : 'ring-transparent'
          )}
          style={{ backgroundColor: c }}
          aria-label={c}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-6 cursor-pointer rounded-full border border-border bg-transparent p-0"
        title="Custom color"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Columns tab
// ---------------------------------------------------------------------------
function ColumnsTab() {
  const { data, loading, reload } = useFetch<{ items: CompanyColumnPref[] }>(
    '/api/column-prefs'
  )
  const [draft, setDraft] = useState<CompanyColumnPref[] | null>(null)
  const [saving, setSaving] = useState(false)

  // Use draft if available (after user edits), otherwise use server data.
  // On first load, treat the server data as the working draft by initializing lazily.
  const prefs = draft ?? data?.items ?? []

  // Sync draft when server data first loads (but never overwrite unsaved edits)
  useEffect(() => {
    if (data && draft === null) {
      setDraft(data.items)
    }
  }, [data, draft])

  const availableToAdd = ALL_COMPANY_COLUMNS.filter(
    (c) => !prefs.some((p) => p.field === c.field)
  )

  const toggleVisible = (id: string) => {
    setDraft((p) =>
      (p ?? []).map((x) => (x.id === id ? { ...x, visible: !x.visible } : x))
    )
  }

  const move = (id: string, dir: -1 | 1) => {
    setDraft((p) => {
      const cur = p ?? []
      const idx = cur.findIndex((x) => x.id === id)
      if (idx < 0) return cur
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= cur.length) return cur
      const next = [...cur]
      const [item] = next.splice(idx, 1)
      next.splice(newIdx, 0, item)
      return next.map((x, i) => ({ ...x, order: i }))
    })
  }

  const remove = (id: string) => {
    setDraft((p) =>
      (p ?? [])
        .filter((x) => x.id !== id)
        .map((x, i) => ({ ...x, order: i }))
    )
  }

  const add = (field: string, label: string) => {
    const cur = draft ?? []
    const newItem: CompanyColumnPref = {
      id: `temp-${Date.now()}`,
      userId: '',
      field,
      label,
      order: cur.length,
      visible: true,
    }
    setDraft([...cur, newItem])
  }

  const save = async () => {
    setSaving(true)
    try {
      const items = prefs.map((p, i) => ({
        field: p.field,
        label: p.label,
        order: i,
        visible: p.visible,
      }))
      const res = await fetch('/api/column-prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Columns saved')
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Visible columns</h3>
            <p className="text-xs text-muted-foreground">
              Reorder, show/hide, or remove columns from the Companies table.
            </p>
          </div>
          <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save layout'}
          </Button>
        </div>

        <ul className="space-y-1">
          {prefs.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              <div className="flex flex-col">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={() => move(p.id, -1)}
                  disabled={i === 0}
                >
                  <span className="text-[10px]">▲</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={() => move(p.id, 1)}
                  disabled={i === prefs.length - 1}
                >
                  <span className="text-[10px]">▼</span>
                </Button>
              </div>
              <span className="flex-1 text-sm">{p.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground/60">{p.field}</span>
              <Switch checked={p.visible} onCheckedChange={() => toggleVisible(p.id)} />
              {p.visible ? (
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground/40" />
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                onClick={() => remove(p.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {availableToAdd.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Add more columns</h3>
          <div className="flex flex-wrap gap-2">
            {availableToAdd.map((c) => (
              <button
                key={c.field}
                onClick={() => add(c.field, c.label)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
