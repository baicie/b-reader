import { ExtensionContext, commands } from "vscode";
import { Commands } from "../config";
import { prepareWebView } from "../view/bookself";
import { BReaderContext } from "@b-reader/utils";

export default function regisiterCommands(
  context: ExtensionContext,
  config: BReaderContext
) {
  const webview = commands.registerCommand(
    Commands.openBookSelefWebView,
    async (data) => {
      prepareWebView(context, config, data);
    }
  );
  context.subscriptions.push(webview);
}
