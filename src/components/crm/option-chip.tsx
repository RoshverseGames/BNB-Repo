'use client'

import { cn, hexToRgba } from '@/lib/utils'
import type { DropdownOption } from '@/lib/types'

interface OptionChipProps {
  option?: DropdownOption
  value?: string | null
  options?: DropdownOption[]
  className?: string
  empty?: string
}

// Renders a colored chip for a dropdown option value.
export function OptionChip({
  option,
  value,
  options,
  className,
  empty = '—',
}: OptionChipProps) {
  const opt = option ?? (value && options ? options.find((o) => o.value === value) : undefined)

  if (!opt || !value) {
    return <span className={cn('text-xs text-muted-foreground/60', className)}>{empty}</span>
  }

  const bg = opt.color ? hexToRgba(opt.color, 0.12) : 'var(--muted)'
  const fg = opt.color || 'var(--muted-foreground)'
  const border = opt.color ? hexToRgba(opt.color, 0.25) : 'var(--border)'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        className
      )}
      style={{
        backgroundColor: bg,
        color: fg,
        borderColor: border,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: opt.color || 'currentColor' }}
      />
      {opt.label}
    </span>
  )
}
