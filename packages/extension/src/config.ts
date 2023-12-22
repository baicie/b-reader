import { BOOKS, DB_NAME, useExtensionPath } from "@b-reader/utils";
import { ExtensionContext, Uri } from "vscode";
import { BReaderContext } from "./context";
import { useDatabase } from "./db";

export const TREEVIEW_ID = "b-reader-menu";

export enum Commands {
  openReaderWebView = "b-reader.local.openReaderWebView",
  openReader = "b-reader.local.openReader",
}

export const resolveConfig = (context: ExtensionContext) => {
  const {} = useExtensionPath(context.extensionPath);

  const config: BReaderContext = {
    dbPath: Uri.joinPath(context.globalStorageUri, DB_NAME),
    bookPath: Uri.joinPath(context.globalStorageUri, BOOKS),
  };

  const database = useDatabase(config);

  database.initDatabase(config);
  //
  // const { locale, localize } = useI18n();

  return {
    config,
    database,
  };
};
