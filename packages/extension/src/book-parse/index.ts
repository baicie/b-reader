import type { BReaderContext, Book, BookConfig, SearchOnlineResult } from '@b-reader/utils'
import type { Epub } from '@b-reader/epub'
import { writeBookInfor } from '../utils/read-file'
import { parseEpub } from './epub'
import { parsePdf } from './pdf'

export type BookCache = Record<string, Epub>

const bookCache: BookCache = {

}

export async function parseBook(book: Book, config: BReaderContext) {
  switch (book.config.type) {
    case 'application/epub+zip':
      await parseEpub(book, config, bookCache)
      break
    case 'application/pdf':
      await parsePdf(book, config)
      break
  }

  return bookCache[book.md5]
}

export async function parseBqg(data: SearchOnlineResult, config: BReaderContext) {
  const book: BookConfig = {
    name: data.title,
    path: data.path,
    type: 'online/biquge',
  }

  await writeBookInfor(book, config)
}
