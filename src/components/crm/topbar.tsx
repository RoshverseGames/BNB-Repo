'use client'

import { useState } from 'react'
import { ChevronRight, Plus, Search } from 'lucide-react'
import { useNav } from '@/stores/nav'
import { useCommandPalette } from '@/components/crm/command-palette'
import { ThemeToggle } from '@/components/crm/theme-toggle'
import { isMac } from '@/components/crm/keyboard-shortcuts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopbarProps {
  onNew: () => void
  title?: string
  hideNew?: boolean
}

export function Topbar({ onNew, title, hideNew }: TopbarProps) {
  const { view, setView } = useNav()
  const openPalette = useCommandPalette((s) => s.setOpen)
  const [mac] = useState(() => typeof navigator !== 'undefined' && isMac())

  const crumbs = buildCrumbs(view, setView, title)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      {/* Breadcrumbs */}
      <nav className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => (
          <div key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
            <button
              onClick={c.onClick}
              disabled={!c.onClick}
              className={cn(
                'truncate rounded px-1.5 py-0.5 transition-colors',
                i === crumbs.length - 1
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
                c.onClick && 'hover:bg-muted'
              )}
            >
              {c.label}
            </button>
          </div>
        ))}
      </nav>

      {/* Search */}
      <button
        onClick={() => openPalette(true)}
        className="hidden items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted md:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search</span>
        <kbd className="rounded bg-background px-1 py-0.5 text-[10px] font-mono">
          {mac ? '⌘' : 'Ctrl'} K
        </kbd>
      </button>

      <ThemeToggle />

      {!hideNew && (
        <Button
          size="sm"
          onClick={onNew}
          className="h-8 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
        </Button>
      )}
    </header>
  )
}

function buildCrumbs(
  view: ReturnType<typeof useNav.getState>['view'],
  setView: ReturnType<typeof useNav.getState>['setView'],
  title?: string
): { label: string; onClick?: () => void }[] {
  switch (view.name) {
    case 'dashboard':
      return [{ label: 'Dashboard' }]
    case 'companies':
      return [{ label: 'Companies' }]
    case 'company':
      return [
        { label: 'Companies', onClick: () => setView({ name: 'companies' }) },
        { label: title ?? 'Company' },
      ]
    case 'people':
      return [{ label: 'People' }]
    case 'person':
      return [
        { label: 'People', onClick: () => setView({ name: 'people' }) },
        { label: title ?? 'Person' },
      ]
    case 'notes':
      return [{ label: 'Notes' }]
    case 'settings':
      return [{ label: 'Settings' }]
    default:
      return [{ label: 'Dashboard' }]
  }
}
