import type { ParserOptions } from 'xml2js'
import { parseStringPromise } from 'xml2js'
import { EpubError } from './errors'

export function useParseXml() {
  const parse = async (content: string, options?: ParserOptions, source = 'XML document') => {
    try {
      return await parseStringPromise(content, {
        explicitArray: true,
        ...options,
      }) as Record<string, unknown>
    }
    catch (cause) {
      throw new EpubError('INVALID_XML', `Unable to parse ${source}`, { cause, path: source })
    }
  }

  return { parse }
}
