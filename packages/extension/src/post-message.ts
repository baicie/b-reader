import { MessageType } from "@b-reader/utils";
import { ExtensionContext, Webview } from "vscode";
import { readFile } from "./utils/read-file";

export async function receiveMessage(
  webview: Webview,
  context: ExtensionContext
) {
  webview.onDidReceiveMessage(
    async (message: MessageType<any>) => {
      switch (message.path) {
        case "book":
          await resolveBook(message.data);
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

async function resolveBook(data: any) {
  try {
    console.log("resolveBook", data);
    const file = await readFile(data.path);
    console.log("file", file.length);
  } catch (error) {
    console.log("error", error);
  }
}
