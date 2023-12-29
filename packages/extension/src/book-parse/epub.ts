import fs from 'node:fs'
import path from 'node:path'
import { Epub } from '@b-reader/epub'
import type { BReaderContext, Book, BookConfig } from '@b-reader/utils'
import { useDatabase } from '../db'
import { StoreKeys } from '../config'

export async function parseEpub(
  book: Book,
  config: BReaderContext,
) {
  try {
    const { config: bookConfig } = book
    const epub = new Epub(bookConfig.path)
    await epub.parse()

    // book.getCover
    cacheBook(book, config, epub)
  }
  catch (error) {
    // console.log(error)
  }
}

async function cacheBook(
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
