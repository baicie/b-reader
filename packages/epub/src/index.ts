import unzipper from 'unzipper'
import xml2js from 'xml2js'

export default async function parseEpub(bookPath: string, unzipPath: string) {
  const zip = await unzipper.Open.file(bookPath)
  zip.extract({ path: unzipPath })
}
