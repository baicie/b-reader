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
import type { Epub } from '@b-reader/epub'
import open from 'open'
import { Commands, StoreKeys } from './config'
import { useDatabase } from './db'
import { openUrl } from './utils/open'
import { writeBook, writeBookInfor } from './utils/read-file'
import { sendMessage, sendMessageToAll } from './utils/send-message'
import { parseBook } from './book-parse'
import { getCacheBook } from './utils/book'

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
          openUrl(message.data)
          break
        case 'bookInfor':
          receiveBookInfor(config, webview)
          break
        case 'openWebview':
          openWebview(message.data, config)
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

async function openWebview(data: string, config: BReaderContext) {
  const { setValue, getValue } = useDatabase(config)
  const bookStore = await getValue<BReaderUser>(StoreKeys.user)

  if (bookStore.welcome) {
    await commands.executeCommand(Commands.openBookSelefWebView, data)
  }
  else {
    await commands.executeCommand(Commands.openWelcome, data)
    await setValue(StoreKeys.user, {
      welcome: true,
    })
  }
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
