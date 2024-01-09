import type { Epub } from '@b-reader/epub'
import type { BReaderContext, Book } from '@b-reader/utils'
import { parseEpub } from './epub'
import { parseBqg } from './online'
import { parsePdf } from './pdf'

export type BookCache = Record<string, Epub | Book>

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
    case 'online/biquge':
      await parseBqg(book, config, bookCache)
      break
  }

  return bookCache[book.md5]
}
