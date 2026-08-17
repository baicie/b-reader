import path from 'node:path'
import type { BReaderContext, Book, BookConfig } from '@b-reader/utils'
import { Uri, workspace } from 'vscode'
import { parseBook } from '../book-parse'
import { StoreKeys } from '../config'
import { useDatabase } from '../db'
import { createBookRecord, createLocalBookConfig, getEpubFileName, mergeBookStore } from './book-import'

export async function readFile(filePath: string) {
  return await workspace.fs.readFile(Uri.file(path.resolve(filePath)))
}

export async function writeFile(filePath: string, content: string) {
  return await workspace.fs.writeFile(
    Uri.file(path.resolve(filePath)),
    Buffer.from(content),
  )
}

export interface WrittenBook {
  book: BookConfig
  created: boolean
  uri: Uri
}

export async function writeBook(source: Uri, config: BReaderContext): Promise<WrittenBook> {
  if (!config.bookPath)
    throw new Error('Book storage is not initialized')

  const name = getEpubFileName(source.path)
  const destination = Uri.joinPath(config.bookPath, name)
  let created = false

  try {
    await workspace.fs.stat(destination)
  }
  catch {
    await workspace.fs.copy(source, destination, { overwrite: false })
    created = true
  }

  return {
    book: createLocalBookConfig(name, destination.fsPath),
    created,
    uri: destination,
  }
}

export async function writeBookInfor(book: BookConfig, config: BReaderContext, save = true): Promise<Book> {
  const { setValue, getValue } = useDatabase(config)
  const nextBook = createBookRecord(book)
  const result = await parseBook(nextBook, config)

  if (result && !nextBook.img)
    nextBook.img = await result.getCover?.() ?? ''

  if (!save)
    return nextBook

  const bookStore = await getValue<Record<string, Book>>(StoreKeys.book)
  await setValue(StoreKeys.book, mergeBookStore(bookStore, nextBook))

  return nextBook
}
