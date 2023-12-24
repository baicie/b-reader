import { ExtensionContext, commands } from "vscode";
import { Commands } from "../config";
import { prepareWebView } from "../view/web-view";
import { BReaderContext } from "@b-reader/utils";

export default function regisiterCommands(
  context: ExtensionContext,
  config: BReaderContext
) {
  let kindDisposable = commands.registerCommand(
    Commands.openReaderWebView,
    async () => {
      prepareWebView(context, config);
    }
  );
  context.subscriptions.push(kindDisposable);
}
