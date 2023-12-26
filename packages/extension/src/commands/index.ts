import { ExtensionContext } from "vscode";
import OpenReader from "./open-reader";
import OpenBookSelf from "./open-bookself";
import { BReaderContext } from "@b-reader/utils";

export function regisiterCommands(
  context: ExtensionContext,
  config: BReaderContext
) {
  OpenReader(context, config);
  OpenBookSelf(context, config);
}
