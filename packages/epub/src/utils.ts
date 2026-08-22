import path from 'node:path'
import { EpubError } from './errors'
import type { Nav, TocNavPoint } from './types'

export type XmlRecord = Record<string, unknown>

const unsafeKeys = new Set(['__proto__', 'constructor', 'prototype'])
const externalScheme = /^[a-z][a-z\d+.-]*:/i

export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null)
    return []
  return Array.isArray(value) ? value : [value]
}

export function isRecord(value: unknown): value is XmlRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function localName(name: string) {
  return name.includes(':') ? name.slice(name.lastIndexOf(':') + 1) : name
}

export function attributes(node: unknown): Record<string, string> {
  if (!isRecord(node) || !isRecord(node.$))
    return {}

  return Object.fromEntries(
    Object.entries(node.$)
      .filter(([key, value]) => !unsafeKeys.has(key) && value != null)
      .map(([key, value]) => [key, String(value)]),
  )
}

export function attribute(node: unknown, name: string): string | undefined {
  const attrs = attributes(node)
  const entry = Object.entries(attrs).find(([key]) => key === name || localName(key) === name)
  return entry?.[1]
}

export function children(node: unknown, name: string): unknown[] {
  if (!isRecord(node))
    return []

  return Object.entries(node)
    .filter(([key]) => key !== '$' && key !== '_' && localName(key) === name)
    .flatMap(([, value]) => asArray(value))
}

export function firstChild(node: unknown, name: string): unknown | undefined {
  return children(node, name)[0]
}

export function findDescendant(node: unknown, predicate: (name: string, value: unknown) => boolean): unknown | undefined {
  if (!isRecord(node))
    return undefined

  for (const [key, rawValue] of Object.entries(node)) {
    if (key === '$' || key === '_')
      continue
    for (const value of asArray(rawValue)) {
      if (predicate(localName(key), value))
        return value
      const nested = findDescendant(value, predicate)
      if (nested)
        return nested
    }
  }

  return undefined
}

export function findDescendants(node: unknown, predicate: (name: string, value: unknown) => boolean): unknown[] {
  if (!isRecord(node))
    return []

  const result: unknown[] = []
  for (const [key, rawValue] of Object.entries(node)) {
    if (key === '$' || key === '_')
      continue
    for (const value of asArray(rawValue)) {
      if (predicate(localName(key), value))
        result.push(value)
      result.push(...findDescendants(value, predicate))
    }
  }
  return result
}

export function textContent(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number')
    return String(node).trim()
  if (Array.isArray(node))
    return node.map(textContent).filter(Boolean).join(' ').trim()
  if (!isRecord(node))
    return ''

  const values: string[] = []
  if (typeof node._ === 'string')
    values.push(node._)
  for (const [key, value] of Object.entries(node)) {
    if (key === '$' || key === '_' || key === '$$')
      continue
    const text = textContent(value)
    if (text)
      values.push(text)
  }
  return values.join(' ').replace(/\s+/g, ' ').trim()
}

export function expandedData(data: unknown): unknown {
  if (Array.isArray(data))
    return data.map(expandedData)
  if (!isRecord(data))
    return data

  const result: XmlRecord = {}
  for (const [key, value] of Object.entries(data)) {
    if (unsafeKeys.has(key))
      continue
    if (key === '$' && isRecord(value)) {
      for (const [attributeName, attributeValue] of Object.entries(value)) {
        if (!unsafeKeys.has(attributeName))
          result[attributeName] = expandedData(attributeValue)
      }
    }
    else {
      result[key] = expandedData(value)
    }
  }
  return result
}

interface ParsedReference {
  pathname: string
  fragment?: string
}

function parseReference(reference: string): ParsedReference | undefined {
  const trimmed = reference.trim()
  if (externalScheme.test(trimmed) || trimmed.startsWith('//'))
    return undefined

  const hashIndex = trimmed.indexOf('#')
  const beforeHash = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex)
  const rawFragment = hashIndex === -1 ? undefined : trimmed.slice(hashIndex + 1)
  const queryIndex = beforeHash.indexOf('?')
  const rawPathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex)

  try {
    const normalized = rawPathname.replaceAll('\\', '/')
    const pathname = normalized.split('/').map((segment) => {
      const decoded = decodeURIComponent(segment)
      if (decoded.includes('/') || decoded.includes('\\') || decoded.includes('\0'))
        throw new Error('Encoded path separators and NUL bytes are not allowed')
      return decoded
    }).join('/')
    const fragment = rawFragment === undefined ? undefined : decodeURIComponent(rawFragment)
    if (pathname.includes('\0') || fragment?.includes('\0'))
      throw new Error('NUL bytes are not allowed')
    return { pathname, fragment }
  }
  catch (cause) {
    throw new EpubError('INVALID_PATH', `Invalid encoded EPUB path: ${reference}`, { cause, path: reference })
  }
}

function appendSegments(target: string[], pathname: string, source: string) {
  for (const segment of pathname.split('/')) {
    if (!segment || segment === '.')
      continue
    if (segment === '..') {
      if (!target.length)
        throw new EpubError('INVALID_PATH', `EPUB path escapes the archive root: ${source}`, { path: source })
      target.pop()
      continue
    }
    target.push(segment)
  }
}

/** Resolve an EPUB URI reference to a normalized path inside the ZIP archive. */
export function resolveArchivePath(importer: string, reference: string): string | undefined {
  const parsed = parseReference(reference)
  if (!parsed)
    return undefined

  const importerPath = parseReference(importer)?.pathname ?? importer
  const segments = parsed.pathname.startsWith('/')
    ? []
    : path.posix.dirname(importerPath).split('/').filter(segment => Boolean(segment) && segment !== '.')

  appendSegments(segments, parsed.pathname, reference)
  if (!segments.length)
    throw new EpubError('INVALID_PATH', `EPUB path resolves to the archive root: ${reference}`, { path: reference })

  return segments.join('/')
}

export function splitHref(href: string): { pathname: string, fragment?: string } {
  const hashIndex = href.indexOf('#')
  return hashIndex === -1
    ? { pathname: href }
    : { pathname: href.slice(0, hashIndex), fragment: href.slice(hashIndex + 1) }
}

export function relativeToPackage(packagePath: string, archivePath: string, fragment?: string) {
  const relative = path.posix.relative(path.posix.dirname(packagePath), archivePath) || path.posix.basename(archivePath)
  return fragment ? `${relative}#${fragment}` : relative
}

/**
 * Backwards-compatible path resolver. External URLs are returned unchanged.
 */
export function resolveId(importer: string, reference: string) {
  const parsed = parseReference(reference)
  if (!parsed)
    return reference
  const resolved = resolveArchivePath(importer, reference)
  return parsed.fragment ? `${resolved}#${parsed.fragment}` : resolved ?? reference
}

export function transformNavPoint(
  navPoints: TocNavPoint[],
  parentId = 'root',
  resolveContent: (href: string) => string = href => href,
): Nav[] {
  return navPoints.map((item, index) => {
    const id = item.id || `${parentId}-${index + 1}`
    const rawContent = item.content?.[0]?.src ?? ''
    const result: Nav = {
      label: item.navLabel?.[0]?.text?.[0]?.trim() || rawContent || `Chapter ${index + 1}`,
      content: rawContent ? resolveContent(rawContent) : '',
      parentId,
    }
    if (item.navPoint?.length)
      result.children = transformNavPoint(item.navPoint, id, resolveContent)
    if (!result.content && result.children?.length)
      result.content = firstNavigationContent(result.children)
    return result
  })
}

export function firstNavigationContent(items: Nav[]): string {
  for (const item of items) {
    if (item.content)
      return item.content
    const nested = firstNavigationContent(item.children ?? [])
    if (nested)
      return nested
  }
  return ''
}
