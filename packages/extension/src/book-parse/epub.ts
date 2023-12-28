import path from 'node:path'
import { Epub } from '@b-reader/epub'
import type { BReaderContext, BookConfig } from '@b-reader/utils/dist'
import { Uri, workspace } from 'vscode'
import { useDatabase } from '../db'

export async function parseEpub(
  bookConfig: BookConfig,
  config: BReaderContext,
) {
  try {
    const { setValue } = useDatabase(config)
    const book = new Epub(bookConfig.path)
    await book.parse()
    const spines = book.getSpines()
    const res = await book.getContent(spines[1].idref)
    console.log(
      'book', book,
    )

    setValue(
      'test', res,
    )
  }
  catch (error) {
    console.log(error)
  }
}
