import fs from 'node:fs'
import path from 'node:path'
import { Epub } from '@b-reader/epub'
import type { BReaderContext, Book, BookConfig } from '@b-reader/utils'
import { useDatabase } from '../db'
import { StoreKeys } from '../config'
import type { BookCache } from './index'

export async function parseEpub(
  book: Book,
  config: BReaderContext,
  bookCache: BookCache,
) {
  const { config: bookConfig } = book
  const epub = new Epub(bookConfig.path)
  await epub.parse()

  // cache
  // 先去json中找，如果没有再去epub 实例中找
  // 意味着每次都要构建一个epub实例
  bookCache[book.md5] = epub
  // cacheBook(book, config, epub)
}

export async function cacheBook(
  book: Book,
  config: BReaderContext,
  epub: Epub,
) {
  const { setValue, getValue } = useDatabase(config)
  if (config.unzip)
    await unzipEpub(epub, book.config)

  const cachePath = `${StoreKeys.cache}/${book.md5}`
  const oldEpub = await getValue(cachePath)
  setValue(cachePath, Object.assign(oldEpub, epub))
}

async function unzipEpub(book: Epub, bookConfig: BookConfig) {
  const unzipPath = path.resolve(path.dirname(bookConfig.path), `${bookConfig.name}.unzip`)
  if (!fs.existsSync(unzipPath))
    fs.mkdirSync(unzipPath)

  await book.unzip(unzipPath)
}
