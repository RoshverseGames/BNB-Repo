'use client'

import { create } from 'zustand'
import type { View } from '@/lib/types'

interface NavState {
  view: View
  history: View[]
  forwardStack: View[]
  setView: (view: View) => void
  goBack: () => void
  goForward: () => void
  canGoBack: () => boolean
  canGoForward: () => boolean
}

export const useNav = create<NavState>((set, get) => ({
  view: { name: 'dashboard' },
  history: [],
  forwardStack: [],
  setView: (view) =>
    set((s) => ({
      view,
      history: [...s.history, s.view].slice(-50),
      forwardStack: [],
    })),
  goBack: () => {
    const { history, view, forwardStack } = get()
    if (history.length === 0) return
    const previous = history[history.length - 1]
    set({
      view: previous,
      history: history.slice(0, -1),
      forwardStack: [view, ...forwardStack].slice(0, 50),
    })
  },
  goForward: () => {
    const { history, view, forwardStack } = get()
    if (forwardStack.length === 0) return
    const next = forwardStack[0]
    set({
      view: next,
      history: [...history, view].slice(-50),
      forwardStack: forwardStack.slice(1),
    })
  },
  canGoBack: () => get().history.length > 0,
  canGoForward: () => get().forwardStack.length > 0,
}))
