import { ExtensionContext, commands } from "vscode";
import { Commands } from "../config";
import { prepareWebView } from "../view/web-view";

export default function regisiterCommands(context: ExtensionContext) {
  let kindDisposable = commands.registerCommand(
    Commands.openReaderWebView,
    async () => {
      prepareWebView(context);
    }
  );
  context.subscriptions.push(kindDisposable);
}
