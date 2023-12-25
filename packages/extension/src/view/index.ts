import { ExtensionContext } from "vscode";
import { prepareSliderBarWebView } from "./sliderbar";
import { BReaderContext } from "@b-reader/utils";

export function regisiterWebView(
  context: ExtensionContext,
  config: BReaderContext
) {
  prepareSliderBarWebView(context, config);
}
