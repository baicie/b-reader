import type { ExtensionContext } from 'vscode'
import type { BReaderContext } from '@b-reader/utils'
import OpenReader from './open-reader'
import OpenBookSelf from './open-bookself'
import OpenWelcome from './open-welcome'
import SearchOnline from './open-search-online'
import CommonReader from './open-common-reader'

export function regisiterCommands(
  context: ExtensionContext,
  config: BReaderContext,
) {
  OpenReader(context, config)
  OpenBookSelf(context, config)
  OpenWelcome(context, config)
  SearchOnline(context, config)
  CommonReader(context, config)
}
