'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useFetch } from '@/hooks/use-fetch'
import type { Company, Person } from '@/lib/types'
import { toast } from 'sonner'

interface PersonFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Person | null
  defaultCompanyId?: string | null
  companyOptions?: { id: string; name: string }[]
  onSaved: (p: Person) => void
}

const AVATAR_COLORS = [
  '#f97316', '#22c55e', '#0ea5e9', '#a855f7',
  '#ec4899', '#eab308', '#14b8a6', '#6366f1',
]

export function PersonForm({
  open,
  onOpenChange,
  initial,
  defaultCompanyId,
  companyOptions,
  onSaved,
}: PersonFormProps) {
  const isEdit = !!initial
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    linkedinUrl: '',
    city: '',
    country: '',
    companyId: '',
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  })

  useEffect(() => {
    if (open) {
      setForm({
        firstName: initial?.firstName ?? '',
        lastName: initial?.lastName ?? '',
        email: initial?.email ?? '',
        phone: initial?.phone ?? '',
        title: initial?.title ?? '',
        linkedinUrl: initial?.linkedinUrl ?? '',
        city: initial?.city ?? '',
        country: initial?.country ?? '',
        companyId: initial?.companyId ?? defaultCompanyId ?? '',
        avatarColor: initial?.avatarColor ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      })
    }
  }, [open, initial, defaultCompanyId])

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First and last name are required')
      return
    }
    setSaving(true)
    try {
      const url = isEdit ? `/api/people/${initial!.id}` : '/api/people'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Save failed')
      }
      const saved = (await res.json()) as Person
      toast.success(isEdit ? 'Person updated' : 'Person created')
      onSaved(saved)
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{isEdit ? 'Edit person' : 'Add new person'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the contact details. Changes save when you click Save.'
              : 'Capture contact info — link them to a company if applicable.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 scrollbar-thin">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" required>
              <Input
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="Emma"
                autoFocus
              />
            </Field>
            <Field label="Last name" required>
              <Input
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="Smith"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="emma@nebula.com"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 415 555 0142"
              />
            </Field>
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="VP of Sales"
              />
            </Field>
            <Field label="Company">
              <select
                value={form.companyId}
                onChange={(e) => set('companyId', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— No company —</option>
                {companyOptions?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City">
              <Input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="San Francisco"
              />
            </Field>
            <Field label="Country">
              <Input
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                placeholder="USA"
              />
            </Field>
            <Field label="LinkedIn URL" className="sm:col-span-2">
              <Input
                value={form.linkedinUrl}
                onChange={(e) => set('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/emma-smith"
              />
            </Field>
            <Field label="Avatar color" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('avatarColor', c)}
                    className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                      form.avatarColor === c ? 'ring-foreground' : 'ring-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </Field>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create person'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      {children}
    </div>
  )
}
