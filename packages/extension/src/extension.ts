import { clientPath, getWebViewContent } from "@b-reader/utils";
import path from "node:path";
import { window, commands, ExtensionContext, ViewColumn, Uri } from "vscode";
import { TREEVIEW_ID, resolveConfig } from "./config";
import { menusProvider } from "./menus/tree-data-provider";
import { prepareWebView } from "./view/web-view";

export function activate(context: ExtensionContext) {
  const config = resolveConfig(context);

  let kindDisposable = commands.registerCommand(`b-reader.helloWorld`, () => {
    prepareWebView(context);
  });
  context.subscriptions.push(kindDisposable);

  window.createTreeView(TREEVIEW_ID, {
    treeDataProvider: menusProvider,
    showCollapseAll: true,
  });
}

export function deactivate() {}
