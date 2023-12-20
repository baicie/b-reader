import vscode from "vscode";
import path from "node:path";
import {
  scanClientDist,
  clientPath,
  getWebViewContent,
  useExtensionPath,
} from "@b-reader/utils";
import { useVscodeContent } from "./content";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "b-reader" is now active!');
  const { update, content: readerContent } = useVscodeContent(context);
  const { resolvePath } = useExtensionPath(context.extensionPath);

  let kindDisposable = vscode.commands.registerCommand(
    `b-reader.helloWorld`,
    () => {
      vscode.window.showInformationMessage(
        "Opening vue generated webview inside extension!"
      );
      const panel = prepareWebView(context);

      panel.webview.onDidReceiveMessage(
        async ({ message }) => {
          vscode.window.showInformationMessage(message);
        },
        undefined,
        context.subscriptions
      );
    }
  );
  context.subscriptions.push(kindDisposable);
}

export function prepareWebView(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "vueWebview",
    "vue webview",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          path.join(
            context.extensionPath,
            path.relative(context.extensionPath, clientPath)
          )
        ),
      ],
    }
  );

  const html = getWebViewContent(
    context,
    path.relative(context.extensionPath, clientPath),
    panel
  );
  console.log(html);

  panel.webview.html = html;
  return panel;
}
// this method is called when your extension is deactivated
export function deactivate() {}
