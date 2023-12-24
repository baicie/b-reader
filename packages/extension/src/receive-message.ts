import { MessageType } from "@b-reader/utils";
import { ExtensionContext, Webview } from "vscode";
import { readFile, writeBook } from "./utils/read-file";
import { openUrl } from "./utils/open";
import { BReaderContext } from "./context";

export async function receiveMessage(
  webview: Webview,
  context: ExtensionContext,
  config: BReaderContext
) {
  webview.onDidReceiveMessage(
    async (message: MessageType<any>) => {
      switch (message.path) {
        case "book":
          await writeBook(message.data, config);
          break;
        case "openLocal":
          if (!config.bookPath) {
            return;
          }
          openUrl(config.bookPath.fsPath);
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}
