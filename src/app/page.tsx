'use client'

import { useEffect, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/crm/sidebar'
import { Topbar } from '@/components/crm/topbar'
import { CommandPalette } from '@/components/crm/command-palette'
import { KeyboardShortcuts } from '@/components/crm/keyboard-shortcuts'
import { DashboardView } from '@/components/crm/views/dashboard'
import { CompaniesView } from '@/components/crm/views/companies'
import { CompanyDetailView } from '@/components/crm/views/company-detail'
import { PeopleView } from '@/components/crm/views/people'
import { PersonDetailView } from '@/components/crm/views/person-detail'
import { NotesView } from '@/components/crm/views/notes'
import { SettingsView } from '@/components/crm/views/settings'
import { CompanyForm } from '@/components/crm/company-form'
import { PersonForm } from '@/components/crm/person-form'
import { useNav } from '@/stores/nav'
import { useFetch } from '@/hooks/use-fetch'
import type { Company } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'

interface TitleInfo {
  name?: string
  firstName?: string
  lastName?: string
}

function CrmApp() {
  const { view, setView } = useNav()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [companyFormOpen, setCompanyFormOpen] = useState(false)
  const [personFormOpen, setPersonFormOpen] = useState(false)

  // Fetch company list for person form options
  const { data: companiesData } = useFetch<{ items: Company[] }>(
    personFormOpen ? '/api/companies?pageSize=200&sort=name:asc' : null
  )
  const companyOptions = (companiesData?.items ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }))

  // Fetch current record title for breadcrumbs — derive, don't setState in effect
  const titleUrl =
    view.name === 'company'
      ? `/api/companies/${view.id}`
      : view.name === 'person'
      ? `/api/people/${view.id}`
      : null
  const { data: titleInfo } = useFetch<TitleInfo>(titleUrl)

  const title =
    view.name === 'companies'
      ? 'Companies'
      : view.name === 'people'
      ? 'People'
      : view.name === 'notes'
      ? 'Notes'
      : view.name === 'dashboard'
      ? 'Dashboard'
      : view.name === 'settings'
      ? 'Settings'
      : titleInfo?.name
      ? titleInfo.name
      : titleInfo?.firstName
      ? `${titleInfo.firstName} ${titleInfo.lastName ?? ''}`.trim()
      : undefined

  // Reset main scroll when view changes
  useEffect(() => {
    const main = document.getElementById('crm-main')
    if (main) main.scrollTop = 0
  }, [view])

  const handleNew = () => {
    if (view.name === 'people' || view.name === 'person') {
      setPersonFormOpen(true)
    } else {
      setCompanyFormOpen(true)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onNew={handleNew} title={title} hideNew={view.name === 'settings' || view.name === 'notes'} />

        <main id="crm-main" className="flex-1 overflow-y-auto scrollbar-thin">
          {view.name === 'dashboard' && <DashboardView onNew={() => setCompanyFormOpen(true)} />}
          {view.name === 'companies' && (
            <CompaniesView onNew={() => setCompanyFormOpen(true)} />
          )}
          {view.name === 'company' && <CompanyDetailView id={view.id} />}
          {view.name === 'people' && <PeopleView onNew={() => setPersonFormOpen(true)} />}
          {view.name === 'person' && <PersonDetailView id={view.id} />}
          {view.name === 'notes' && <NotesView />}
          {view.name === 'settings' && <SettingsView />}
        </main>
      </div>

      <CommandPalette />
      <KeyboardShortcuts />

      <CompanyForm
        open={companyFormOpen}
        onOpenChange={setCompanyFormOpen}
        onSaved={(c) => setView({ name: 'company', id: c.id })}
      />

      <PersonForm
        open={personFormOpen}
        onOpenChange={setPersonFormOpen}
        companyOptions={companyOptions}
        onSaved={(p) => setView({ name: 'person', id: p.id })}
      />
    </div>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <CrmApp />
      <Toaster richColors closeButton position="bottom-right" />
    </ThemeProvider>
  )
}
