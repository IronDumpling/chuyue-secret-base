'use client'

import { Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ALL,
  applySelectionToParams,
  listMemoryKey,
  selectionFromParams,
  type Selection,
} from '@/lib/filter-model'
import { getBasePath } from '@/lib/utils'

// useLayoutEffect warns during the static render, where there is nothing to lay out.
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

// The "Back to ..." link on a post is a plain link to the list, so it cannot carry the filter
// by itself. The list remembers its query here (per tab, per list address) and the link reads
// it back. Storage can be unavailable (private windows), so both sides fail quietly.
const memoryKey = (listPath: string) => listMemoryKey(listPath, getBasePath())

function remember(listPath: string, query: string) {
  try {
    if (query) sessionStorage.setItem(memoryKey(listPath), query)
    else sessionStorage.removeItem(memoryKey(listPath))
  } catch {}
}

// '/en/blog/' -> '/en/blog/?group=reviews', or the path unchanged when nothing is remembered.
export function rememberedListHref(listPath: string): string {
  try {
    const query = sessionStorage.getItem(memoryKey(listPath))
    return query ? `${listPath}${listPath.endsWith('/') ? '' : '/'}?${query}` : listPath
  } catch {
    return listPath
  }
}

// Follows the address while the list stays mounted: a link to the plain list (the "Blog" item
// of the header) changes the query without remounting anything. It lives in its own Suspense
// boundary because useSearchParams needs one in a static export; that way only this empty
// component waits for the browser and the list itself is still in the exported HTML.
function AddressWatcher({ onChange }: { onChange: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => onChange(new URLSearchParams(searchParams.toString())), [searchParams, onChange])
  return null
}

// The filter choice, kept in the query string of the current history entry. Coming back from a
// post restores that entry, so the list opens with the filter it was left with, while a fresh
// visit (a link to /blog/) has no query and opens unfiltered. Render `watcher` next to the list.
//
// The server-rendered page is always unfiltered, so the query is read after mount, before the
// browser paints. Reading it in the initial state would not match the HTML on hydration.
export function useUrlSelection(enabled = true) {
  const [selection, setSelection] = useState<Selection>(ALL)

  const readAddress = useCallback((params: URLSearchParams) => {
    const chosen = selectionFromParams(params)
    setSelection(previous =>
      previous.group === chosen.group && previous.category === chosen.category ? previous : chosen
    )
    const query = new URLSearchParams()
    applySelectionToParams(query, chosen)
    remember(window.location.pathname, query.toString())
  }, [])

  useBeforePaint(() => {
    if (enabled) readAddress(new URLSearchParams(window.location.search))
  }, [enabled, readAddress])

  const choose = useCallback(
    (next: Selection) => {
      setSelection(next)
      if (!enabled) return
      const params = new URLSearchParams(window.location.search)
      applySelectionToParams(params, next)
      const query = params.toString()
      // replace, not push: a filter click is not a page the back button should stop on.
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
      )
      remember(window.location.pathname, query)
    },
    [enabled]
  )

  const watcher = enabled ? (
    <Suspense fallback={null}>
      <AddressWatcher onChange={readAddress} />
    </Suspense>
  ) : null

  return { selection, choose, watcher }
}
