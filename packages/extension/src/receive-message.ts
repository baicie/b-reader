import {
  BReaderContext,
  BReaderUser,
  Book,
  BookConfig,
  MessageType,
} from "@b-reader/utils";
import { ExtensionContext, Webview, commands } from "vscode";
import { Commands, StoreKeys } from "./config";
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
    async (message: MessageType) => {
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
        case "openWebview":
          openWebview(message.data, config);
          break;
        case "config":
          sendMessage(webview, "config", config);
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
  await sendMessage(webview, "bookInfor", res);
}

async function openWebview(data: string, config: BReaderContext) {
  const { setValue, getValue } = useDatabase(config);
  const bookStore = await getValue<BReaderUser>(StoreKeys.user);

  if (bookStore.welcome) {
    await commands.executeCommand(Commands.openReaderWebView, data);
  } else {
    await commands.executeCommand(Commands.openWelcome, data);
    await setValue(StoreKeys.user, {
      welcome: true,
    });
  }
}
