import { ExtensionContext, Uri } from "vscode";
import { BReaderContext, useVscodeContext } from "./context";
import { DB_NAME, useExtensionPath } from "@b-reader/utils";
import { useDatabase } from "./db";

export const TREEVIEW_ID = "b-reader-menu";

export enum Commands {
  openReaderWebView = "b-reader.local.openReaderWebView",
  openReader = "b-reader.local.openReader",
}

export const resolveConfig = (context: ExtensionContext) => {
  const { undates } = useVscodeContext(context);
  const {} = useExtensionPath(context.extensionPath);
  const {} = useDatabase(context);

  const config: BReaderContext = {
    dbPath: Uri.joinPath(context.globalStorageUri, DB_NAME),
  };

  undates(config);

  return { config };
};
