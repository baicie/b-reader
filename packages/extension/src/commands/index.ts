import type { ExtensionContext } from 'vscode'
import type { BReaderContext } from '@b-reader/utils'
import OpenReader from './open-reader'
import OpenBookSelf from './open-bookself'
import openWelcome from './open-welcome'

export function regisiterCommands(
  context: ExtensionContext,
  config: BReaderContext,
) {
  OpenReader(context, config)
  OpenBookSelf(context, config)
  openWelcome(context, config)
}
