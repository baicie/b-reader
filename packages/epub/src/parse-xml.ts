import type { ParserOptions } from 'xml2js'
import { parseStringPromise } from 'xml2js'

export function useParseXml() {
  const parse = async (content: string, options?: ParserOptions) => {
    try {
      return await parseStringPromise(content, options)
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log('useParseXml parse error', error)
      return null
    }
  }

  return {
    parse,
  }
}
