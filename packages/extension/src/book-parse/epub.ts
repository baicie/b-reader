import fs from 'node:fs'
import path from 'node:path'
import { Epub } from '@b-reader/epub'
import type { EpubPublication } from '@b-reader/epub'
import type { BReaderContext, Book, BookConfig } from '@b-reader/utils'
import { useDatabase } from '../db'
import { StoreKeys } from '../config'
import type { BookCache } from './index'

export const EPUB_CACHE_SCHEMA_VERSION = 1

export interface EpubCacheSnapshot {
  schemaVersion: typeof EPUB_CACHE_SCHEMA_VERSION
  sourceFingerprint: string
  sourcePath: string
  publication: EpubPublication
}

async function sourceFingerprint(sourcePath: string) {
  const stat = await fs.promises.stat(sourcePath)
  return `${stat.size}:${stat.mtimeMs}`
}

export async function readEpubSnapshot(book: Book, config: BReaderContext) {
  try {
    const { getValue } = useDatabase(config)
    const snapshot = await getValue<Partial<EpubCacheSnapshot>>(`${StoreKeys.cache}/${book.md5}`)
    if (snapshot.schemaVersion !== EPUB_CACHE_SCHEMA_VERSION
      || snapshot.sourcePath !== book.config.path
      || snapshot.sourceFingerprint !== await sourceFingerprint(book.config.path)
      || !snapshot.publication) {
      return undefined
    }
    return snapshot.publication
  }
  catch {
    return undefined
  }
}

export async function parseEpub(
  book: Book,
  config: BReaderContext,
  bookCache: BookCache,
): Promise<Epub> {
  const { config: bookConfig } = book
  const cached = bookCache[book.md5]
  if (cached instanceof Epub && cached.bookPath === bookConfig.path)
    return cached

  const epub = new Epub(bookConfig.path)
  await epub.parse()

  // cache
  // 先去json中找，如果没有再去epub 实例中找
  // 意味着每次都要构建一个epub实例
  bookCache[book.md5] = epub
  await cacheBook(book, config, epub)
  return epub
}

export async function cacheBook(
  book: Book,
  config: BReaderContext,
  epub: Epub,
) {
  const { setValue } = useDatabase(config)
  if (config.unzip)
    await unzipEpub(epub, book.config)

  const cachePath = `${StoreKeys.cache}/${book.md5}`
  const snapshot: EpubCacheSnapshot = {
    schemaVersion: EPUB_CACHE_SCHEMA_VERSION,
    sourceFingerprint: await sourceFingerprint(book.config.path),
    sourcePath: book.config.path,
    publication: epub.publication!,
  }
  await setValue(cachePath, snapshot)
}

async function unzipEpub(book: Epub, bookConfig: BookConfig) {
  const unzipPath = path.resolve(path.dirname(bookConfig.path), `${bookConfig.name}.unzip`)
  if (!fs.existsSync(unzipPath))
    fs.mkdirSync(unzipPath)

  await book.unzip(unzipPath)
}
