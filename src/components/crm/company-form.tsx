'use client'

import { useEffect, useRef, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { Company, DropdownOption, UserProfile } from '@/lib/types'
import { useDropdownOptions } from '@/hooks/use-dropdown-options'
import { useFetch } from '@/hooks/use-fetch'
import { cn } from '@/lib/utils'

interface CompanyFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Company | null
  onSaved: (c: Company) => void
}

interface PeopleListResponse {
  items: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    title?: string | null
    avatarColor: string
    company?: { id: string; name: string } | null
  }[]
}

type UserResponse = UserProfile

function emptyForm() {
  return {
    name: '',
    domain: '',
    industry: '',
    website: '',
    linkedinUrl: '',
    employees: '',
    revenue: '',
    arr: '',
    city: '',
    country: '',
    address: '',
    phone: '',
    description: '',
    stage: 'Lead',
    idealProfile: false,
    leadSource: '',
    leadStatus: '',
    pipelineStage: '',
    priority: '',
    wonLostOpen: '',
    lossReason: '',
    productsServices: [] as string[],
    contactPersonId: '',
    firstContactDate: '',
    lastContactDate: '',
    nextFollowUpDate: '',
    expectedCloseDate: '',
    dealCloseDate: '',
    touchCount: 0,
    lastChannelUsed: '',
    estimatedDeal: '',
  }
}

export function CompanyForm({ open, onOpenChange, initial, onSaved }: CompanyFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl gap-0 p-0">
        {open && (
          <CompanyFormBody
            initial={initial}
            onSaved={onSaved}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CompanyFormBody({
  initial,
  onSaved,
  onOpenChange,
}: {
  initial?: Company | null
  onSaved: (c: Company) => void
  onOpenChange: (v: boolean) => void
}) {
  const isEdit = !!initial
  const [saving, setSaving] = useState(false)
  const { options, loading: optsLoading } = useDropdownOptions()
  const { data: userData } = useFetch<UserResponse>('/api/user')
  const { data: peopleData } = useFetch<PeopleListResponse>('/api/people-list?limit=200')

  // Build initial form state lazily (runs once per mount; the parent remounts via Dialog)
  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        name: initial.name ?? '',
        domain: initial.domain ?? '',
        industry: initial.industry ?? '',
        website: initial.website ?? '',
        linkedinUrl: initial.linkedinUrl ?? '',
        employees: initial.employees ?? '',
        revenue: initial.revenue ?? '',
        arr: initial.arr ?? '',
        city: initial.city ?? '',
        country: initial.country ?? '',
        address: initial.address ?? '',
        phone: initial.phone ?? '',
        description: initial.description ?? '',
        stage: initial.stage ?? 'Lead',
        idealProfile: initial.idealProfile ?? false,
        leadSource: initial.leadSource ?? '',
        leadStatus: initial.leadStatus ?? '',
        pipelineStage: initial.pipelineStage ?? '',
        priority: initial.priority ?? '',
        wonLostOpen: initial.wonLostOpen ?? '',
        lossReason: initial.lossReason ?? '',
        productsServices: initial.productsServices
          ? safeParse(initial.productsServices)
          : [],
        contactPersonId: initial.contactPersonId ?? '',
        firstContactDate: toDateInput(initial.firstContactDate),
        lastContactDate: toDateInput(initial.lastContactDate),
        nextFollowUpDate: toDateInput(initial.nextFollowUpDate),
        expectedCloseDate: toDateInput(initial.expectedCloseDate),
        dealCloseDate: toDateInput(initial.dealCloseDate),
        touchCount: initial.touchCount ?? 0,
        lastChannelUsed: initial.lastChannelUsed ?? '',
        estimatedDeal: initial.estimatedDeal ?? '',
      }
    }
    return emptyForm()
  })

  // For new companies, once dropdown options load, apply defaults.
  // Use a ref so we only run this once.
  const appliedDefaults = useRef(false)
  useEffect(() => {
    if (appliedDefaults.current) return
    if (initial) {
      appliedDefaults.current = true
      return
    }
    if (!options || optsLoading) return
    appliedDefaults.current = true
    setForm((p) => {
      const next = { ...p }
      const tryDefault = (field: keyof typeof next, opts?: { isDefault: boolean; value: string }[]) => {
        const def = opts?.find((o) => o.isDefault)
        if (def && !next[field]) (next as Record<string, unknown>)[field] = def.value
      }
      tryDefault('leadStatus', options.leadStatus)
      tryDefault('pipelineStage', options.pipelineStage)
      tryDefault('priority', options.priority)
      tryDefault('wonLostOpen', options.wonLostOpen)
      tryDefault('lastChannelUsed', options.lastChannelUsed)
      return next
    })
  }, [options, optsLoading, initial])

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }))

  const toggleProduct = (value: string) => {
    setForm((p) => {
      const cur = new Set(p.productsServices)
      if (cur.has(value)) cur.delete(value)
      else cur.add(value)
      return { ...p, productsServices: Array.from(cur) }
    })
  }

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Company name is required')
      return
    }
    setSaving(true)
    try {
      const url = isEdit ? `/api/companies/${initial!.id}` : '/api/companies'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload = { ...form, createdById: userData?.id }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Save failed')
      }
      const saved = (await res.json()) as Company
      toast.success(isEdit ? 'Company updated' : 'Company created')
      onSaved(saved)
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader className="border-b border-border px-6 py-4">
        <DialogTitle>{isEdit ? 'Edit company' : 'Add new company'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the company profile. Changes save when you click Save.'
            : 'Fill in what you know — you can always edit later.'}
        </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92vh-9rem)] overflow-y-auto px-6 py-5 scrollbar-thin">
          {/* Section: Basics */}
          <Section title="Company basics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Nebula Labs"
                  autoFocus
                />
              </Field>
              <Field label="Domain">
                <Input
                  value={form.domain}
                  onChange={(e) => set('domain', e.target.value)}
                  placeholder="nebula.com"
                />
              </Field>
              <Field label="Website">
                <Input
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                  placeholder="https://nebula.com"
                />
              </Field>
              <Field label="LinkedIn URL">
                <Input
                  value={form.linkedinUrl}
                  onChange={(e) => set('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/company/nebula"
                />
              </Field>
              <Field label="Industry">
                <Input
                  value={form.industry}
                  onChange={(e) => set('industry', e.target.value)}
                  placeholder="SaaS"
                />
              </Field>
              <DropdownField
                label="Employees"
                value={form.employees}
                onChange={(v) => set('employees', v)}
                options={options.employees}
                loading={optsLoading}
                placeholder="Select range"
              />
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+1 415 555 0142"
                />
              </Field>
              <Field label="Location">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="City"
                  />
                  <Input
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <Input
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="123 Market St, San Francisco"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Short description of what the company does…"
                  rows={2}
                />
              </Field>
            </div>
          </Section>

          {/* Section: Lead & Pipeline */}
          <Section title="Lead & Pipeline">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DropdownField
                label="Lead Source"
                value={form.leadSource}
                onChange={(v) => set('leadSource', v)}
                options={options.leadSource}
                loading={optsLoading}
                placeholder="Select source"
                allowClear
              />
              <DropdownField
                label="Lead Status"
                value={form.leadStatus}
                onChange={(v) => set('leadStatus', v)}
                options={options.leadStatus}
                loading={optsLoading}
                placeholder="Select status"
                allowClear
              />
              <DropdownField
                label="Pipeline Stage"
                value={form.pipelineStage}
                onChange={(v) => set('pipelineStage', v)}
                options={options.pipelineStage}
                loading={optsLoading}
                placeholder="Select stage"
                allowClear
              />
              <DropdownField
                label="Priority"
                value={form.priority}
                onChange={(v) => set('priority', v)}
                options={options.priority}
                loading={optsLoading}
                placeholder="Select priority"
                allowClear
              />
              <DropdownField
                label="Won / Lost / Open"
                value={form.wonLostOpen}
                onChange={(v) => set('wonLostOpen', v)}
                options={options.wonLostOpen}
                loading={optsLoading}
                placeholder="Select state"
                allowClear
              />
              <DropdownField
                label="Loss Reason"
                value={form.lossReason}
                onChange={(v) => set('lossReason', v)}
                options={options.lossReason}
                loading={optsLoading}
                placeholder="Select reason"
                allowClear
                disabled={form.wonLostOpen !== 'lost'}
              />
              <Field label="Estimated Deal">
                <Input
                  value={form.estimatedDeal}
                  onChange={(e) => set('estimatedDeal', e.target.value)}
                  placeholder="$25K"
                />
              </Field>
              <Field label="ARR">
                <Input
                  value={form.arr}
                  onChange={(e) => set('arr', e.target.value)}
                  placeholder="$120K"
                />
              </Field>
              <Field label="Revenue range">
                <Input
                  value={form.revenue}
                  onChange={(e) => set('revenue', e.target.value)}
                  placeholder="$10-50M"
                />
              </Field>
              <Field label="Products / Services" className="lg:col-span-3">
                <div className="flex flex-wrap gap-3 rounded-md border border-border bg-background p-3">
                  {(options.productsServices ?? []).map((o) => {
                    const checked = form.productsServices.includes(o.value)
                    return (
                      <label
                        key={o.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                          checked
                            ? 'border-foreground/40 bg-foreground/5'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleProduct(o.value)}
                        />
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: o.color ?? 'var(--muted-foreground)' }}
                        />
                        {o.label}
                      </label>
                    )
                  })}
                  {(!options.productsServices || options.productsServices.length === 0) && (
                    <span className="text-xs text-muted-foreground">No options defined.</span>
                  )}
                </div>
              </Field>
            </div>
          </Section>

          {/* Section: Contact Person */}
          <Section title="Contact person">
            <Field label="Primary contact (from People)">
              <select
                value={form.contactPersonId}
                onChange={(e) => set('contactPersonId', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— None —</option>
                {(peopleData?.items ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                    {p.title ? ` · ${p.title}` : ''}
                    {p.company ? ` · ${p.company.name}` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-muted-foreground/70">
                Create new people from the People tab; they will appear here.
              </p>
            </Field>
          </Section>

          {/* Section: Touches & Follow-ups */}
          <Section title="Touches & follow-ups">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="First Contact Date">
                <Input
                  type="date"
                  value={form.firstContactDate}
                  onChange={(e) => set('firstContactDate', e.target.value)}
                />
              </Field>
              <Field label="Last Contact Date">
                <Input
                  type="date"
                  value={form.lastContactDate}
                  onChange={(e) => set('lastContactDate', e.target.value)}
                />
              </Field>
              <Field label="Next Follow-up Date">
                <Input
                  type="date"
                  value={form.nextFollowUpDate}
                  onChange={(e) => set('nextFollowUpDate', e.target.value)}
                />
              </Field>
              <Field label="Expected Close Date">
                <Input
                  type="date"
                  value={form.expectedCloseDate}
                  onChange={(e) => set('expectedCloseDate', e.target.value)}
                />
              </Field>
              <Field label="Deal Close Date">
                <Input
                  type="date"
                  value={form.dealCloseDate}
                  onChange={(e) => set('dealCloseDate', e.target.value)}
                />
              </Field>
              <Field label="No. of Touches">
                <Input
                  type="number"
                  min={0}
                  value={form.touchCount}
                  onChange={(e) => set('touchCount', Number(e.target.value) || 0)}
                />
              </Field>
              <DropdownField
                label="Last Channel Used"
                value={form.lastChannelUsed}
                onChange={(v) => set('lastChannelUsed', v)}
                options={options.lastChannelUsed}
                loading={optsLoading}
                placeholder="Select channel"
                allowClear
              />
            </div>
          </Section>

          {/* Section: Misc */}
          <Section title="Profile">
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={form.idealProfile}
                  onCheckedChange={(v) => set('idealProfile', v === true)}
                />
                Mark as ideal customer profile
              </label>
            </div>
          </Section>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create company'}
          </Button>
        </DialogFooter>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
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

function DropdownField({
  label,
  value,
  onChange,
  options,
  loading,
  placeholder,
  allowClear,
  disabled,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options?: DropdownOption[]
  loading?: boolean
  placeholder?: string
  allowClear?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <select
          value={value}
          disabled={disabled || loading}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        >
          <option value="">{placeholder ?? '— Select —'}</option>
          {(options ?? []).map((o) => (
            <option key={o.id} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {allowClear && value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
    </div>
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

function toDateInput(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
