import { Commands } from "../config";
import { webviewCommandFactory } from "../utils/webview-factory-ommand";
import { prepareWebView } from "../view/welcome";

export default webviewCommandFactory(Commands.openWelcome, prepareWebView);
