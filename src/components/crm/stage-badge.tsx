'use client'

import { cn } from '@/lib/utils'
import { STAGE_STYLES, type Stage } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STAGES } from '@/lib/types'

export function StageBadge({
  stage,
  className,
  onClick,
}: {
  stage: Stage
  className?: string
  onClick?: () => void
}) {
  const s = STAGE_STYLES[stage] ?? STAGE_STYLES.Lead
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        s.chip,
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}

export function StageSelect({
  value,
  onChange,
  className,
}: {
  value: Stage
  onChange: (v: Stage) => void
  className?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Stage)}>
      <SelectTrigger className={cn('h-7 w-auto gap-1.5 border-none px-2 text-xs', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STAGES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            <span className="flex items-center gap-2">
              <span className={cn('h-1.5 w-1.5 rounded-full', STAGE_STYLES[s].dot)} />
              {s}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
