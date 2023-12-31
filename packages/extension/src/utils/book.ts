import type { BReaderContext, Book } from '@b-reader/utils'
import { StoreKeys } from '../config'
import { useDatabase } from '../db'

export async function getCacheBook(bookId: string, config: BReaderContext) {
  const { getValue } = useDatabase(config)
  const book = await getValue<Record<string, Book>>(StoreKeys.book)
  return book[bookId]
}
