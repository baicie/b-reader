import { ExtensionContext, window } from "vscode";
import { BReaderContext } from "@b-reader/utils";
import { MenusProvider } from "../menus/provider";
import { TREEVIEW_ID } from "../config";

export function prepareSliderBarWebView(
  context: ExtensionContext,
  config: BReaderContext
) {
  const menusProvider = new MenusProvider(config, context);

  context.subscriptions.push(
    window.registerWebviewViewProvider(TREEVIEW_ID, menusProvider)
  );
}
