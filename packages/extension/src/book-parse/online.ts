import type { BReaderContext, Book } from '@b-reader/utils'
import { getCover } from '@b-reader/online'
import type { BookCache } from './index'

export async function parseBqg(book: Book, config: BReaderContext, bookCache: BookCache) {
  book.img = await getCover(config.biquge!, book.config.path)
  bookCache[book.md5] = book
}
