import type { Nav } from '@b-reader/epub'

export interface ReaderSettings {
  fontSize: number
  lineHeight: number
  letterSpacing: number
  padding: number
}

export interface ReaderBookmark {
  href: string
  fragment?: string
  label: string
  createdAt: number
}

export interface ReaderState {
  currentHref: string
  currentFragment?: string
  progress: number
  settings: ReaderSettings
  bookmarks: ReaderBookmark[]
}

export function flattenNavigation(items: Nav[], result: Nav[] = []) {
  for (const item of items) {
    if (item.children?.length) {
      if ((item.href || item.path) && !item.external)
        result.push(item)
      flattenNavigation(item.children, result)
    }
    else if (item.content && !item.external) {
      result.push(item)
    }
  }
  return result
}

export function splitNavigationTarget(target: string) {
  const hashIndex = target.indexOf('#')
  return hashIndex === -1
    ? { href: target, fragment: undefined }
    : { href: target.slice(0, hashIndex), fragment: target.slice(hashIndex + 1) || undefined }
}

export function createReaderState(initial: Partial<ReaderState> = {}): ReaderState {
  return {
    currentHref: initial.currentHref ?? '',
    currentFragment: initial.currentFragment,
    progress: clampProgress(initial.progress ?? 0),
    settings: {
      fontSize: initial.settings?.fontSize ?? 16,
      lineHeight: initial.settings?.lineHeight ?? 26,
      letterSpacing: initial.settings?.letterSpacing ?? 0,
      padding: initial.settings?.padding ?? 24,
    },
    bookmarks: initial.bookmarks?.map(bookmark => ({ ...bookmark })) ?? [],
  }
}

export function selectNavigation(state: ReaderState, target: string) {
  const next = splitNavigationTarget(target)
  state.currentHref = next.href
  state.currentFragment = next.fragment
  return next
}

export function moveNavigation(state: ReaderState, navigation: Nav[], direction: -1 | 1) {
  const chapters = flattenNavigation(navigation)
  const currentIndex = chapters.findIndex((item) => {
    const target = splitNavigationTarget(item.content)
    return target.href === state.currentHref
  })
  const next = chapters[currentIndex + direction]
  if (!next)
    return undefined
  selectNavigation(state, next.content)
  return next
}

export function setProgress(state: ReaderState, progress: number) {
  state.progress = clampProgress(progress)
}

export function toggleBookmark(state: ReaderState, label: string, now = Date.now()) {
  const existingIndex = state.bookmarks.findIndex(bookmark => bookmark.href === state.currentHref && bookmark.fragment === state.currentFragment)
  if (existingIndex >= 0) {
    state.bookmarks.splice(existingIndex, 1)
    return false
  }
  state.bookmarks.push({
    href: state.currentHref,
    fragment: state.currentFragment,
    label,
    createdAt: now,
  })
  return true
}

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}
