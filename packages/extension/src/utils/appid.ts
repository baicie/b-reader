import type { BReaderContext } from '@b-reader/utils'
import { v4 as uuid } from 'uuid'

export function mixinAppid(config: BReaderContext) {
  const appid = uuid()
  config.appid = appid
}
