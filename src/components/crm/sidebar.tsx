'use client'

import {
  LayoutDashboard,
  Building2,
  Users,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  Command,
  Settings,
} from 'lucide-react'
import { useNav } from '@/stores/nav'
import { useCommandPalette } from '@/components/crm/command-palette'
import { isMac } from '@/components/crm/keyboard-shortcuts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface NavItem {
  key: string
  label: string
  icon: typeof LayoutDashboard
  view: Parameters<ReturnType<typeof useNav.getState>['setView']>[0]
  match: (v: ReturnType<typeof useNav.getState>['view']) => boolean
}

const items: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    view: { name: 'dashboard' },
    match: (v) => v.name === 'dashboard',
  },
  {
    key: 'companies',
    label: 'Companies',
    icon: Building2,
    view: { name: 'companies' },
    match: (v) => v.name === 'companies' || v.name === 'company',
  },
  {
    key: 'people',
    label: 'People',
    icon: Users,
    view: { name: 'people' },
    match: (v) => v.name === 'people' || v.name === 'person',
  },
  {
    key: 'notes',
    label: 'Notes',
    icon: StickyNote,
    view: { name: 'notes' },
    match: (v) => v.name === 'notes',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    view: { name: 'settings' },
    match: (v) => v.name === 'settings',
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { view, setView, goBack, goForward, canGoBack, canGoForward } = useNav()
  const openPalette = useCommandPalette((s) => s.setOpen)
  const [mac] = useState(() => typeof navigator !== 'undefined' && isMac())

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
          <img
            src="/bnb-logo-sm.png"
            alt="B&B CRM logo"
            className="h-full w-full object-contain"
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-sidebar-foreground">B&B CRM</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Bridges & Blueprints</span>
          </div>
        )}
      </div>

      {/* Search trigger */}
      <div className="p-2">
        <button
          onClick={() => openPalette(true)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background',
            collapsed && 'justify-center'
          )}
        >
          <Command className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                {mac ? '⌘' : 'Ctrl'} K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.match(view)
          return (
            <button
              key={item.key}
              onClick={() => setView(item.view)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && active && (
                <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Back/forward */}
      <div className="border-t border-sidebar-border p-2">
        <div className={cn('flex', collapsed ? 'flex-col gap-1' : 'flex-row gap-1')}>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canGoBack()}
            onClick={goBack}
            className="h-8 flex-1 justify-start px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Back"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {!collapsed && <span>Back</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canGoForward()}
            onClick={goForward}
            className="h-8 flex-1 justify-start px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Forward"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            {!collapsed && <span>Forward</span>}
          </Button>
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            collapsed ? 'justify-center' : ''
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
