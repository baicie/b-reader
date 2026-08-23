import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Nav } from '@b-reader/epub'
import {
  createReaderState,
  flattenNavigation,
  moveNavigation,
  selectNavigation,
  setProgress,
  splitNavigationTarget,
  toggleBookmark,
} from '../src/utils/reader-navigation'

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

  it('selects fragments and moves between readable chapters', () => {
    const state = createReaderState()
    const items = [nav('one', { content: 'one.xhtml#intro' }), nav('two', { content: 'two.xhtml' })]

    assert.deepEqual(splitNavigationTarget('one.xhtml#intro'), { href: 'one.xhtml', fragment: 'intro' })
    selectNavigation(state, 'one.xhtml#intro')
    assert.equal(state.currentHref, 'one.xhtml')
    assert.equal(state.currentFragment, 'intro')
    assert.equal(moveNavigation(state, items, 1)?.content, 'two.xhtml')
    assert.equal(state.currentHref, 'two.xhtml')
    assert.equal(moveNavigation(state, items, 1), undefined)
  })

  it('clamps progress and toggles a bookmark for the current target', () => {
    const state = createReaderState()
    selectNavigation(state, 'chapter.xhtml#part')
    setProgress(state, 2)
    assert.equal(state.progress, 1)
    assert.equal(toggleBookmark(state, 'Chapter', 123), true)
    assert.equal(state.bookmarks[0].createdAt, 123)
    assert.equal(toggleBookmark(state, 'Chapter', 456), false)
    assert.equal(state.bookmarks.length, 0)
  })
})
