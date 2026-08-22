import { Epub } from '@b-reader/epub'
import type { BReaderContext, Book } from '@b-reader/utils'
import { parseEpub } from './epub'
import { parseBqg } from './online'
import { parsePdf } from './pdf'

export type BookCache = Record<string, Epub | Book>

const bookCache: BookCache = {

}
const epubParsePromises = new Map<string, Promise<Epub>>()

export async function parseBook(book: Book, config: BReaderContext) {
  switch (book.config.type) {
    case 'application/epub+zip':
      {
        const cached = bookCache[book.md5]
        if (cached instanceof Epub && cached.bookPath === book.config.path)
          return cached

        const pending = epubParsePromises.get(book.md5)
        if (pending)
          return pending

        const parsePromise = parseEpub(book, config, bookCache)
        epubParsePromises.set(book.md5, parsePromise)
        try {
          return await parsePromise
        }
        finally {
          epubParsePromises.delete(book.md5)
        }
      }
    case 'application/pdf':
      await parsePdf(book, config)
      break
    case 'online/biquge':
      await parseBqg(book, config, bookCache)
      break
  }

  return bookCache[book.md5]
}
