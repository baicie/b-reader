import { ExtensionContext, commands } from "vscode";
import { Commands } from "../config";
import { prepareWebView } from "../view/reader";
import { BReaderContext } from "@b-reader/utils";

export default function regisiterCommands(
  context: ExtensionContext,
  config: BReaderContext
) {
  let kindDisposable = commands.registerCommand(
    Commands.openReaderWebView,
    async (data) => {
      prepareWebView(context, config, data);
    }
  );
  context.subscriptions.push(kindDisposable);
}
