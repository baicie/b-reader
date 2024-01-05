import path from 'node:path'
import fs from 'node:fs'
import type { BReaderContext } from '@b-reader/utils'
import { BOOKS, DB_NAME } from '@b-reader/utils'
import type { ExtensionContext } from 'vscode'
import { Uri, env, workspace } from 'vscode'

// import pkg from '../package.json'
import { useDatabase } from './db'
import { clientPath } from './path'

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
  const extensionConfig = workspace.getConfiguration('b-reader')

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

  await initDir(config)

  return {
    extensionConfig,
    config,
    database,
  }
}

/**
 * @param config
 */
export async function initDir(config: BReaderContext) {
  const { dbPath, bookPath, imgPath } = config

  const paths = {
    dbPath,
    bookPath,
    imgPath,
  }

  for (const key of Object.keys(paths))
    await workspace.fs.createDirectory(paths[key])
}
