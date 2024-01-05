import { Commands } from '../config'
import { webviewCommandFactory } from '../utils/webview-factory-ommand'
import { prepareWebView } from '../view/search-online'

export default webviewCommandFactory(Commands.openSearchOnline, prepareWebView)
