import { BOOKS, DB_NAME, clientPath, useExtensionPath } from "@b-reader/utils";
import { ExtensionContext, Uri, env } from "vscode";
import { BReaderContext } from "./context";
import { useDatabase } from "./db";
import path from "node:path";
import fs from "node:fs";

export const TREEVIEW_ID = "b-reader-menu";

export enum Commands {
  openReaderWebView = "b-reader.local.openReaderWebView",
  openReader = "b-reader.local.openReader",
}

export const resolveConfig = async (context: ExtensionContext) => {
  console.log("resolveConfig");

  const config: BReaderContext = {
    extensionPath: context.extensionPath,
    dbPath: Uri.joinPath(context.globalStorageUri, DB_NAME),
    bookPath: Uri.joinPath(context.globalStorageUri, BOOKS),
    localResourceRoots: Uri.file(path.join(clientPath)),
    language: env.language,
  };
  initDir(config);
  const database = useDatabase(config);

  await database.initDatabase(config);
  //

  return {
    config,
    database,
  };
};

function initDir(config: BReaderContext) {
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
