'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  LayoutDashboard,
  Building2,
  Users,
  StickyNote,
  Settings,
  Moon,
  Sun,
  ArrowLeft,
  ArrowRight,
  Search,
} from 'lucide-react'
import { useNav } from '@/stores/nav'
import { useTheme } from 'next-themes'
import type { Company, Person } from '@/lib/types'

interface PaletteState {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

export const useCommandPalette = create<PaletteState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}))

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const { setView, goBack, goForward, canGoBack, canGoForward } = useNav()
  const { setTheme } = useTheme()
  const [results, setResults] = useState<{ companies: Company[]; people: Person[] }>({
    companies: [],
    people: [],
  })

  // global shortcut is registered in keyboard-shortcuts.tsx
  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch('/api/companies?pageSize=5&sort=updatedAt:desc')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setResults((p) => ({ ...p, companies: d.items ?? [] }))
      })
      .catch(() => {})
    fetch('/api/people?pageSize=5&sort=updatedAt:desc')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setResults((p) => ({ ...p, people: d.items ?? [] }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [open])

  const run = (fn: () => void) => {
    fn()
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => setView({ name: 'dashboard' }))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Go to Dashboard</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView({ name: 'companies' }))}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Go to Companies</span>
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView({ name: 'people' }))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Go to People</span>
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView({ name: 'notes' }))}>
            <StickyNote className="mr-2 h-4 w-4" />
            <span>Go to Notes</span>
            <CommandShortcut>G N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView({ name: 'settings' }))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Go to Settings</span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {canGoBack() || canGoForward() ? (
          <CommandGroup heading="History">
            {canGoBack() && (
              <CommandItem onSelect={() => run(goBack)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Go back</span>
                <CommandShortcut>⌘[</CommandShortcut>
              </CommandItem>
            )}
            {canGoForward() && (
              <CommandItem onSelect={() => run(goForward)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Go forward</span>
                <CommandShortcut>⌘]</CommandShortcut>
              </CommandItem>
            )}
          </CommandGroup>
        ) : null}

        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => run(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Switch to Light mode</span>
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Switch to Dark mode</span>
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {results.companies.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Companies">
              {results.companies.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => run(() => setView({ name: 'company', id: c.id }))}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{c.name}</span>
                  {c.domain && (
                    <span className="ml-2 text-xs text-muted-foreground">{c.domain}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.people.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="People">
              {results.people.map((p) => (
                <CommandItem
                  key={p.id}
                  onSelect={() => run(() => setView({ name: 'person', id: p.id }))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{p.firstName} {p.lastName}</span>
                  {p.title && (
                    <span className="ml-2 text-xs text-muted-foreground">{p.title}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem onSelect={() => run(() => window.open('/?help=1', '_self'))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search tips</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
