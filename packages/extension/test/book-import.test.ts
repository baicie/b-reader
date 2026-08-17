import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createBookRecord,
  createLocalBookConfig,
  getEpubFileName,
  mergeBookStore,
  runBookImportTransaction,
} from '../src/utils/book-import'

describe('EPUB import helpers', () => {
  it('accepts uppercase extensions and preserves the file name', () => {
    const fileName = getEpubFileName('/c:/Users/Alice/My Books/\u4E66\u7C4D.EPUB')
    assert.equal(fileName, '\u4E66\u7C4D.EPUB')
  })

  it('rejects empty paths and non-EPUB files', () => {
    assert.throws(() => getEpubFileName('   '), /path is empty/)
    assert.throws(() => getEpubFileName('/tmp/book.pdf'), /valid EPUB/)
  })

  it('creates a new local config and book record without mutating input', () => {
    const config = createLocalBookConfig('book.epub', 'C:\\books\\book.epub')
    const book = createBookRecord(config)

    assert.notStrictEqual(book.config, config)
    assert.deepEqual(config, {
      name: 'book.epub',
      path: 'C:\\books\\book.epub',
      type: 'application/epub+zip',
    })
    assert.match(book.md5, /^[a-f0-9]{32}$/)
  })

  it('rejects an empty book path before hashing', () => {
    assert.throws(
      () => createBookRecord({ name: 'broken.epub', path: '' }),
      /non-empty string/,
    )
  })

  it('merges a book without mutating the existing store', () => {
    const existing = {
      old: createBookRecord({ name: 'old.epub', path: '/books/old.epub' }),
    }
    const nextBook = createBookRecord({ name: 'new.epub', path: '/books/new.epub' })
    const merged = mergeBookStore(existing, nextBook)

    assert.notStrictEqual(merged, existing)
    assert.deepEqual(Object.keys(existing), ['old'])
    assert.strictEqual(merged[nextBook.md5], nextBook)
  })
})

describe('book import transaction', () => {
  it('commits a staged import without rolling it back', async () => {
    let rollbackCount = 0
    const result = await runBookImportTransaction(
      async () => ({ created: true, value: 'staged' }),
      async staged => `${staged.value}:committed`,
      async () => { rollbackCount += 1 },
    )

    assert.equal(result, 'staged:committed')
    assert.equal(rollbackCount, 0)
  })

  it('rolls back a newly copied file when persistence fails', async () => {
    let rollbackCount = 0
    await assert.rejects(
      runBookImportTransaction(
        async () => ({ created: true }),
        async () => { throw new Error('persist failed') },
        async () => { rollbackCount += 1 },
      ),
      /persist failed/,
    )
    assert.equal(rollbackCount, 1)
  })

  it('does not run cleanup when copying the file fails', async () => {
    let rollbackCount = 0
    await assert.rejects(
      runBookImportTransaction(
        async () => { throw new Error('copy failed') },
        async () => 'unreachable',
        async () => { rollbackCount += 1 },
      ),
      /copy failed/,
    )
    assert.equal(rollbackCount, 0)
  })

  it('does not remove a file that existed before the import', async () => {
    let rollbackCount = 0
    await assert.rejects(
      runBookImportTransaction(
        async () => ({ created: false }),
        async () => { throw new Error('parse failed') },
        async () => { rollbackCount += 1 },
      ),
      /parse failed/,
    )
    assert.equal(rollbackCount, 0)
  })

  it('preserves the import error when best-effort cleanup also fails', async () => {
    const rollbackErrors: unknown[] = []
    await assert.rejects(
      runBookImportTransaction(
        async () => ({ created: true }),
        async () => { throw new Error('parse failed') },
        async () => { throw new Error('cleanup failed') },
        error => rollbackErrors.push(error),
      ),
      /parse failed/,
    )
    assert.equal(rollbackErrors.length, 1)
    assert.match(String(rollbackErrors[0]), /cleanup failed/)
  })
})
