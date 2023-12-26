import { Commands } from "../config";
import { webviewCommandFactory } from "../utils/webview-factory-ommand";
import { prepareWebView } from "../view/reader";

export default webviewCommandFactory(Commands.openReader, prepareWebView);
