import { ExtensionContext } from "vscode";
import OpenReader from "./open-reader";
import { BReaderContext } from "../context";

export function regisiterCommands(
  context: ExtensionContext,
  config: BReaderContext
) {
  OpenReader(context, config);
}
