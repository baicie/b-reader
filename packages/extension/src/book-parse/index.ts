import type { BReaderContext, BookConfig } from '@b-reader/utils'
import { parseEpub } from './epub'
import { parsePdf } from './pdf'

export async function parseBook(book: BookConfig, config: BReaderContext) {
  switch (book.type) {
    case 'application/epub+zip':
      await parseEpub(book, config)
      break
    case 'application/pdf':
      await parsePdf(book, config)
      break
  }
}
