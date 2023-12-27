import { parseStringPromise } from 'xml2js'

export function useParseXml() {
  // const xml = await parseStringPromise(content)
  const parse = async (content: string) => await parseStringPromise(content)
  return {
    // xml,
    parse,
  }
}
