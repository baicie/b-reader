import { randomUUID } from 'node:crypto'
import type { BReaderContext } from '@b-reader/utils'

export function mixinAppid(config: BReaderContext) {
  const appid = randomUUID()
  config.appid = appid
}
