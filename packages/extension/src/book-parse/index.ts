import type { BReaderContext, Book } from '@b-reader/utils'
import { parseEpub } from './epub'
import { parsePdf } from './pdf'

export async function parseBook(book: Book, config: BReaderContext) {
  switch (book.config.type) {
    case 'application/epub+zip':
      await parseEpub(book, config)
      break
    case 'application/pdf':
      await parsePdf(book, config)
      break
  }
}
