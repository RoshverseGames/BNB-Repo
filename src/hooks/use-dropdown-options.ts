'use client'

import { useFetch } from '@/hooks/use-fetch'
import type { DropdownOption } from '@/lib/types'

interface DropdownOptionsResponse {
  items: DropdownOption[]
  grouped: Record<string, DropdownOption[]>
}

// Always-on hook that returns the grouped dropdown options for the whole app.
export function useDropdownOptions() {
  const { data, loading, reload } = useFetch<DropdownOptionsResponse>('/api/dropdown-options')
  return {
    options: data?.grouped ?? {},
    loading,
    reload,
  }
}

export function findOption(
  options: DropdownOption[] | undefined,
  value?: string | null
): DropdownOption | undefined {
  if (!value || !options) return undefined
  return options.find((o) => o.value === value)
}
