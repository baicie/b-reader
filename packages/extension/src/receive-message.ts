import { BReaderContext, Book, BookConfig, MessageType } from "@b-reader/utils";
import { ExtensionContext, Webview } from "vscode";
import { StoreKeys } from "./config";
import { useDatabase } from "./db";
import { openUrl } from "./utils/open";
import { writeBook, writeBookInfor } from "./utils/read-file";
import { sendMessage } from "./utils/send-message";

export async function receiveMessage(
  webview: Webview,
  context: ExtensionContext,
  config: BReaderContext
) {
  webview.onDidReceiveMessage(
    async (message: MessageType<any>) => {
      switch (message.path) {
        case "book":
          await receiveBook(message.data, config);
          break;
        case "openLocal":
          if (!message.data) {
            return;
          }
          openUrl(message.data);
          break;
        case "bookInfor":
          receiveBookInfor(config, webview);
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

async function receiveBook(book: BookConfig, config: BReaderContext) {
  await writeBook(book, config);
  writeBookInfor(book, config);
}

async function receiveBookInfor(config: BReaderContext, webview: Webview) {
  const { getValue } = useDatabase(config);
  const res = await getValue<Record<string, Book>>(StoreKeys.book);
  console.log("res: ", res);
  sendMessage(webview, "bookInfor", res);
}
