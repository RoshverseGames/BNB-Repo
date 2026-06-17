'use client'

import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-16 w-16 text-lg',
}

export function Avatar({ name, color = '#94a3b8', size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white ring-1 ring-black/5',
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials || '?'}
    </span>
  )
}

export function CompanyAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: AvatarProps['size']
  className?: string
}) {
  const letter = name[0]?.toUpperCase() ?? '?'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-muted font-semibold text-foreground',
        sizes[size],
        className
      )}
    >
      {letter}
    </span>
  )
}
