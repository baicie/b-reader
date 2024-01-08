import { Commands } from '../config'
import { webviewCommandFactory } from '../utils/webview-factory-ommand'
import { prepareWebView } from '../view/common-reader'

export default webviewCommandFactory(Commands.openCommonReader, prepareWebView)
