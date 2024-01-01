import type { ParserOptions } from 'xml2js'
import { parseStringPromise } from 'xml2js'
import type { ConstructorOptions } from 'jsdom'
import { JSDOM } from 'jsdom'
import { DOMParser } from '@xmldom/xmldom'

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

  const jsdomParse = async (content: string, options: ConstructorOptions) => {
    const dom = new JSDOM(content, options)
    return dom.window.document
  }

  const parseXml = async (content: string, type = 'application/xhtml+xml') => {
    const dom = new DOMParser().parseFromString(content, type)
    return dom
  }

  return {
    parseXml,
    jsdomParse,
    parse,
  }
}
