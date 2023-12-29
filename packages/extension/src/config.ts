import path from 'node:path'
import fs from 'node:fs'
import type { BReaderContext, BReaderContextInFile } from '@b-reader/utils'
import { BOOKS, DB_NAME, clientPath } from '@b-reader/utils'
import type { ExtensionContext } from 'vscode'
import { Uri, env, workspace } from 'vscode'
import pkg from '../package.json'
import { useDatabase } from './db'

export const TREEVIEW_ID = 'b-reader-slider'

export enum Commands {
  openReaderWebView = 'b-reader.local.openReaderWebView',
  openBookSelefWebView = 'b-reader.local.openBookSelefWebView',
  openReader = 'b-reader.local.openReader',
  openWelcome = 'b-reader.local.openWelcome',
}

export enum StoreKeys {
  book = 'book',
  user = 'user',
  cache = 'cache',
}

export async function resolveConfig(context: ExtensionContext) {
  const extensionConfig = workspace.getConfiguration(pkg.displayName)

  const config: BReaderContext = {
    extensionPath: context.extensionPath,
    globalStorageUri: context.globalStorageUri,
    dbPath: Uri.joinPath(context.globalStorageUri, DB_NAME),
    bookPath: Uri.joinPath(context.globalStorageUri, BOOKS),
    imgPath: Uri.joinPath(context.globalStorageUri, 'img'),
    localResourceRoots: Uri.file(path.join(clientPath)),
    language: env.language,
    ...extensionConfig,
  }

  const database = useDatabase(config)

  await database.initDatabase(config)

  return {
    extensionConfig,
    config,
    database,
  }
}

/**
 * @deprecated
 * @param config
 */
export function initDir(config: BReaderContext) {
  const { dbPath, bookPath } = config

  const paths = {
    dbPath,
    bookPath,
  }

  for (const key of Object.keys(paths)) {
    const uri: Uri = paths[key]
    const _path = path.resolve(uri.fsPath)

    if (!fs.existsSync(_path))
      fs.mkdirSync(_path, { recursive: true })
  }
}
