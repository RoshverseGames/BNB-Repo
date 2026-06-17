'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface FetchState<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
  reload: () => void
  setData: (data: T | undefined) => void
}

export function useFetch<T>(
  url: string | null,
  options?: { deps?: unknown[] }
): FetchState<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [reloadCount, setReloadCount] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const reload = useCallback(() => setReloadCount((c) => c + 1), [])

  useEffect(() => {
    // When URL becomes null we want to clear any previously fetched data.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!url) {
      setData(undefined)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(undefined)

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    fetch(url, { signal: ac.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json() as Promise<T>
      })
      .then((d) => {
        if (!ac.signal.aborted) {
          setData(d)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        if (!ac.signal.aborted) {
          setError(e)
          setLoading(false)
        }
      })

    return () => ac.abort()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [url, reloadCount, ...(options?.deps ?? [])])

  return { data, loading, error, reload, setData }
}
