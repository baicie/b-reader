import { ExtensionContext } from "vscode";
import { prepareSliderBarWebView } from "./sliderbar";
import {} from "./bookself";
import { BReaderContext } from "@b-reader/utils";

export function regisiterWebView(
  context: ExtensionContext,
  config: BReaderContext
) {
  prepareSliderBarWebView(context, config);
}
