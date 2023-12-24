import { ExtensionContext, window } from "vscode";
import { BReaderContext } from "../context";
import { MenusProvider } from "../menus/provider";

export function prepareSliderBarWebView(
  context: ExtensionContext,
  config: BReaderContext
) {
  const menusProvider = new MenusProvider(config, context);

  context.subscriptions.push(
    window.registerWebviewViewProvider("b-reader-slider", menusProvider)
  );
}
