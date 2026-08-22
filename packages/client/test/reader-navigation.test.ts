import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Nav } from '@b-reader/epub'
import { flattenNavigation } from '../src/utils/reader-navigation'

const nav = (content: string, extra: Partial<Nav> = {}): Nav => ({
  label: content,
  content,
  ...extra,
})

describe('reader navigation', () => {
  it('flattens nested clickable entries in document order', () => {
    const items = [
      nav('group', {
        content: 'chapter-1.xhtml#first',
        href: 'chapter-1.xhtml#first',
        children: [
          nav('child', { content: 'chapter-2.xhtml' }),
          nav('nested', { children: [nav('leaf', { content: 'chapter-3.xhtml#part' })], content: 'chapter-3.xhtml#part' }),
        ],
      }),
      nav('external', { content: 'https://example.com/book', external: true }),
    ]

    assert.deepEqual(flattenNavigation(items).map(item => item.content), [
      'chapter-1.xhtml#first',
      'chapter-2.xhtml',
      'chapter-3.xhtml#part',
    ])
  })

  it('keeps a href-less group out while retaining its descendants', () => {
    const items = [nav('group', {
      content: 'chapter.xhtml',
      children: [nav('leaf', { content: 'chapter.xhtml#part' })],
    })]

    assert.deepEqual(flattenNavigation(items).map(item => item.content), ['chapter.xhtml#part'])
  })

  it('does not mutate the original navigation tree', () => {
    const items = [nav('one', { children: [nav('two', { content: 'two.xhtml' })] })]
    const before = JSON.stringify(items)
    flattenNavigation(items)
    assert.equal(JSON.stringify(items), before)
  })
})
