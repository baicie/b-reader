import { BReaderContext } from "@b-reader/utils/dist";
import { ExtensionContext, commands } from "vscode";

export const webviewCommandFactory = (name: string, cb: Function) => {
  return (context: ExtensionContext, config: BReaderContext) => {
    const webview = commands.registerCommand(name, async (data) => {
      cb(context, config, data);
    });
    context.subscriptions.push(webview);
  };
};
