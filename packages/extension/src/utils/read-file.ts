import fs from 'node:fs'
import path from 'node:path'
import type { BReaderContext, Book, BookConfig, BookType } from '@b-reader/utils'
import { calculateMD5 } from '@b-reader/utils'
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
    console.log('writeBook error: ', error)
  }
}

export async function writeBookInfor(book: BookConfig, config: BReaderContext) {
  const { setValue, getValue } = useDatabase(config)

  const bookid = await calculateMD5(book.path)
  const _book: Book = {
    config: book,
    md5: bookid,
    img: '',
  }
  parseBook(book, config)
  const bookStore = await getValue<Record<string, Book>>(StoreKeys.book)

  bookStore[bookid] = _book

  await setValue(StoreKeys.book, bookStore)
}

export function getImage(type: BookType) {
  //
}
