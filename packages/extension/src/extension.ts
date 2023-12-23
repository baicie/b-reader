import { ExtensionContext } from "vscode";
import { regisiterCommands } from "./commands";
import { resolveConfig } from "./config";
import { regisiterWebView } from "./view";

export async function activate(context: ExtensionContext) {
  const { config } = await resolveConfig(context);

  regisiterCommands(context);
  regisiterWebView(context, config);
}

export function deactivate() {}
