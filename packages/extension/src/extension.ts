import { ExtensionContext, commands, l10n, window, env } from "vscode";
import { Commands, TREEVIEW_ID, resolveConfig } from "./config";
import { menusProvider } from "./menus/tree-data-provider";
import { prepareWebView } from "./view/web-view";

export function activate(context: ExtensionContext) {
  const { config, database } = resolveConfig(context);
  console.log("l10n", l10n.t("Hello"), env.language);

  let kindDisposable = commands.registerCommand(
    Commands.openReaderWebView,
    async () => {
      prepareWebView(context);
    }
  );
  context.subscriptions.push(kindDisposable);

  window.createTreeView(TREEVIEW_ID, {
    treeDataProvider: menusProvider,
    showCollapseAll: true,
  });
}

export function deactivate() {}
