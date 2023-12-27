import path from 'node:path'
import type { BReaderContext, BookConfig } from '@b-reader/utils/dist'
import pdfparser from '@b-reader/pdf'
import { Uri, workspace } from 'vscode'

export async function parsePdf(bookConfig: BookConfig,
  config: BReaderContext) {
  console.log('parsePdf: ', bookConfig, config)
  const res = await pdfparser(bookConfig.path, path.resolve(path.dirname(bookConfig.path), `${bookConfig.name}.pdf.json`))
  console.log(res)
}
