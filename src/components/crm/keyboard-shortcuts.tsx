'use client'

import { useEffect } from 'react'
import { useNav } from '@/stores/nav'
import { useCommandPalette } from '@/components/crm/command-palette'
import { useTheme } from 'next-themes'

function isMac() {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
}

function isTextInput(t: EventTarget | null) {
  if (!t) return false
  const el = t as HTMLElement
  if (el.isContentEditable) return true
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

export function KeyboardShortcuts() {
  const { setView, goBack, goForward } = useNav()
  const togglePalette = useCommandPalette((s) => s.toggle)
  const { setTheme } = useTheme()

  useEffect(() => {
    let lastKey = ''
    let lastKeyAt = 0

    const handler = (e: KeyboardEvent) => {
      const mod = isMac() ? e.metaKey : e.ctrlKey
      const targetIsText = isTextInput(e.target)

      // ⌘/Ctrl + K → palette
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        togglePalette()
        return
      }

      // ⌘/Ctrl + [ → back,  ⌘/Ctrl + ] → forward
      if (mod && e.key === '[') {
        e.preventDefault()
        goBack()
        return
      }
      if (mod && e.key === ']') {
        e.preventDefault()
        goForward()
        return
      }

      // ⌘/Ctrl + B → dashboard
      if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setView({ name: 'dashboard' })
        return
      }

      // Single-key shortcuts (only when not typing in a field)
      if (targetIsText || e.metaKey || e.ctrlKey || e.altKey) return

      const now = Date.now()
      const key = e.key.toLowerCase()

      // G then <letter> for navigation
      if (key === 'g' && now - lastKeyAt < 700) {
        // double g within 700ms — wait for next key
        return
      }
      if (lastKey === 'g' && now - lastKeyAt < 700) {
        if (key === 'd') {
          e.preventDefault()
          setView({ name: 'dashboard' })
          lastKey = ''
          return
        }
        if (key === 'c') {
          e.preventDefault()
          setView({ name: 'companies' })
          lastKey = ''
          return
        }
        if (key === 'p') {
          e.preventDefault()
          setView({ name: 'people' })
          lastKey = ''
          return
        }
        if (key === 'n') {
          e.preventDefault()
          setView({ name: 'notes' })
          lastKey = ''
          return
        }
        if (key === 's') {
          e.preventDefault()
          setView({ name: 'settings' })
          lastKey = ''
          return
        }
      }

      // T → toggle theme
      if (key === 't') {
        e.preventDefault()
        const cur = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        setTheme(cur === 'dark' ? 'light' : 'dark')
        return
      }

      // B → back (single key)
      if (key === 'b' && !lastKey) {
        e.preventDefault()
        goBack()
        return
      }

      lastKey = key
      lastKeyAt = now
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setView, goBack, goForward, togglePalette, setTheme])

  return null
}

export { isMac }
