/* eslint-disable n/prefer-global/buffer */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { BReaderContext, Book, BookConfig, BookType } from '@b-reader/utils'
import { Uri, workspace } from 'vscode'
import { useDatabase } from '../db'
import { StoreKeys } from '../config'
import { parseBook } from '../book-parse'

export async function readFile(filePath: string) {
  return await workspace.fs.readFile(Uri.file(path.resolve(filePath)))
}

export async function writeFile(filePath: string, content: string) {
  return await workspace.fs.writeFile(
    Uri.file(path.resolve(filePath)),
    Buffer.from(content),
  )
}

export async function writeBook(book: BookConfig, config: BReaderContext) {
  try {
    const { name } = book
    const bookNamePath = path.join(config.bookPath!.fsPath, name)

    if (!fs.existsSync(bookNamePath)) {
      // 书不在
      fs.copyFileSync(book.path, bookNamePath)
    }
    book.path = bookNamePath
  }
  catch (error) {
    // console.log('writeBook error: ', error)
  }
}

export async function writeBookInfor(book: BookConfig, config: BReaderContext, save = true) {
  const { setValue, getValue } = useDatabase(config)
  const bookid = crypto.createHash('md5').update(book.path, 'utf-8').digest('hex')
  const _book: Book = {
    config: book,
    md5: bookid,
    img: '',
  }
  const result = await parseBook(_book, config)

  if (result && !_book.img)
    _book.img = await result.getCover?.() ?? ''

  if (!save)
    return _book

  const bookStore = await getValue<Record<string, Book>>(StoreKeys.book)

  bookStore[bookid] = _book

  await setValue(StoreKeys.book, bookStore)
}
