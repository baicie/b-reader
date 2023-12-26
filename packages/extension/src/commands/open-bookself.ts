import { Commands } from "../config";
import { webviewCommandFactory } from "../utils/webview-factory-ommand";
import { prepareWebView } from "../view/bookself";

export default webviewCommandFactory(
  Commands.openBookSelefWebView,
  prepareWebView
);
