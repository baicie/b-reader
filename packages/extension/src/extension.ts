import vscode, { ExtensionContext, commands, window } from "vscode";
import path from "node:path";
import fs from "node:fs";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "b-reader" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand("b-reader.helloWorld", async () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    window.showInformationMessage("Hello World from b-reader!");

    const panel = window.createWebviewPanel(
      "catCoding",
      "Cat Coding",
      vscode.ViewColumn.One,
      {}
    );

    panel.webview.html = await getWebviewContent();
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function getWebviewContent() {
  const htmlPath = path.join(__dirname, "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  return html;
}
