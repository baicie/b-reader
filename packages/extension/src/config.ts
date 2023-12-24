import { BOOKS, DB_NAME, clientPath } from "@b-reader/utils";
import { ExtensionContext, Uri, env } from "vscode";
import { BReaderContext } from "@b-reader/utils";
import { useDatabase } from "./db";
import path from "node:path";
import fs from "node:fs";

export const TREEVIEW_ID = "b-reader-menu";

export enum Commands {
  openReaderWebView = "b-reader.local.openReaderWebView",
  openReader = "b-reader.local.openReader",
}

export enum StoreKeys {
  book = "book",
}

export const resolveConfig = async (context: ExtensionContext) => {
  console.log("resolveConfig");

  const config: BReaderContext = {
    extensionPath: context.extensionPath,
    globalStorageUri: context.globalStorageUri,
    dbPath: Uri.joinPath(context.globalStorageUri, DB_NAME),
    bookPath: Uri.joinPath(context.globalStorageUri, BOOKS),
    imgPath: Uri.joinPath(context.globalStorageUri, "img"),
    localResourceRoots: Uri.file(path.join(clientPath)),
    language: env.language,
  };
  // initDir(config);
  const database = useDatabase(config);

  await database.initDatabase(config);
  //

  return {
    config,
    database,
  };
};

/**
 * @deprecated
 * @param config
 */
export function initDir(config: BReaderContext) {
  const { dbPath, bookPath } = config;

  const paths = {
    dbPath,
    bookPath,
  };

  for (const key of Object.keys(paths)) {
    const uri: Uri = paths[key];
    const _path = path.resolve(uri.fsPath);

    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path, { recursive: true });
    }
  }
}
