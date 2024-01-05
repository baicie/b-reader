import type { Epub } from '@b-reader/epub'
import type {
  BReaderContext,
  BReaderUser,
  Book,
  BookConfig,
  MessageType,
  MessageTypeGetContent,
} from '@b-reader/utils'
import type { ExtensionContext, Webview } from 'vscode'
import { commands } from 'vscode'
import open from 'open'
import { search } from '@b-reader/online'
import { parseBook } from './book-parse'
import { Commands, StoreKeys } from './config'
import { useDatabase } from './db'
import { getCacheBook } from './utils/book'
import { writeBook, writeBookInfor } from './utils/read-file'
import { sendMessage, sendMessageToAll } from './utils/send-message'

export async function receiveMessage(
  webview: Webview,
  context: ExtensionContext,
  config: BReaderContext,
  data?: any,
) {
  webview.onDidReceiveMessage(
    async (message: MessageType) => {
      switch (message.path) {
        case 'book':
          await receiveBook(message.data, config)
          break
        case 'openLocal':
          if (!message.data)
            return
          await open(message.data, { wait: true })
          break
        case 'bookInfor':
          receiveBookInfor(config, webview)
          break
        case 'openWebview':
          openWebview(message.data)
          break
        case 'config':
          sendMessage(webview, 'config', config)
          break
        case 'openBook':
          receiveOpenBook(message.data, config)
          break
        case 'ready':
          sendMessage(webview, 'initData', data)
          break
        case 'getNav':
          receiveNav(message.bookId, config, webview)
          break
        case 'getContent':
          receiveContent(message.data, config, webview)
          break
        case 'online:search':
          receiveOnlieSearch(message.data, config, webview)
          break
      }
    },
    undefined,
    context.subscriptions,
  )
}

async function receiveNav(bookId: string, config: BReaderContext, webview: Webview) {
  const { getValue } = useDatabase(config)
  const cache = await getValue<Epub>(`${StoreKeys.cache}/${bookId}`)
  await sendMessage(webview, 'snedNav', cache.nva)
}

async function receiveBook(book: BookConfig, config: BReaderContext) {
  await writeBook(book, config)
  await writeBookInfor(book, config)
  const { getValue } = useDatabase(config)
  const res = await getValue<Record<string, Book>>(StoreKeys.book)
  await sendMessageToAll('bookself', 'bookInfor', res)
}

async function receiveBookInfor(config: BReaderContext, webview: Webview) {
  const { getValue } = useDatabase(config)
  const res = await getValue<Record<string, Book>>(StoreKeys.book)
  await sendMessage(webview, 'bookInfor', res)
}

async function openWebview(data: string) {
  await commands.executeCommand(`b-reader.local.${data}`, data)
}

async function receiveOpenBook(bookId: string, config: BReaderContext) {
  const bookinfo = await getCacheBook(bookId, config)
  await commands.executeCommand(Commands.openReader, bookinfo)
}

// 获取章节内容
async function receiveContent(data: MessageTypeGetContent['data'], config: BReaderContext, webview: Webview) {
  const bookinfo = await getCacheBook(data.bookId, config)
  const bookInstance = await parseBook(bookinfo, config)
  const chapter = await bookInstance.getContent()
  await sendMessage(webview, 'sendContent', chapter)
  // cache
}

async function receiveOnlieSearch(data: string, config: BReaderContext, webview: Webview) {

}
