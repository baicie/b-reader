import type { BReaderContext } from '@b-reader/utils'
import type { ExtensionContext } from 'vscode'
import { } from './bookself'
import { prepareSliderBarWebView } from './sliderbar'

export function regisiterWebView(
  context: ExtensionContext,
  config: BReaderContext,
) {
  prepareSliderBarWebView(context, config)
}
