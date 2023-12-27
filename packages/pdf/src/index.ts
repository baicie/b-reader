import fs from 'node:fs'
import PDFParser from 'pdf2json'

export default async function pdfToJSON(pdfPath: string, targetPath: string): Promise<boolean | string> {
  const pdfParser = new PDFParser()
  await pdfParser.loadPDF(pdfPath)
  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataError', (errData) => {
      reject(errData)
    })
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      fs.writeFileSync(targetPath, JSON.stringify(pdfData), { encoding: 'utf-8' })
      resolve(true)
    })
  })
}
