import { ExtensionContext } from "vscode";
import OpenReader from "./open-reader";

export function regisiterCommands(context: ExtensionContext) {
  OpenReader(context);
}
