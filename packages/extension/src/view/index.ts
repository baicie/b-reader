import { ExtensionContext } from "vscode";
import { prepareSliderBarWebView } from "./sliderbar";
import { BReaderContext } from "../context";

export function regisiterWebView(
  context: ExtensionContext,
  config: BReaderContext
) {
  prepareSliderBarWebView(context, config);
}
