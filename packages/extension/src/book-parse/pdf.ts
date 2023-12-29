import path from 'node:path'
import type { BReaderContext, Book } from '@b-reader/utils/dist'
import pdfparser from '@b-reader/pdf'

export async function parsePdf(book: Book,
  config: BReaderContext) {
  const { config: bookConfig } = book
  const res = await pdfparser(bookConfig.path, path.resolve(path.dirname(bookConfig.path), `${bookConfig.name}.pdf.json`))
}
