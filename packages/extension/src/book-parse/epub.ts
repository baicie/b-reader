import path from 'node:path'
import epub from '@b-reader/epub'
import type { BReaderContext, BookConfig } from '@b-reader/utils/dist'
import { useDatabase } from '../db'

export async function parseEpub(
  bookConfig: BookConfig,
  config: BReaderContext,
) {
  try {
    const { setValue } = useDatabase(config)
    console.log('parseEpub: ', bookConfig)
    const { parse } = epub(
      bookConfig.path,
      path.resolve(path.dirname(bookConfig.path), `${bookConfig.name}.unzip`),
    )
    await parse()
  }
  catch (error) {
    console.log(error)
  }
}
