import type { Epub } from '@b-reader/epub'
import { getChapter, getChapterContent, search } from '@b-reader/online'
import type {
  BReaderContext,
  Book,
  BookConfig,
  MessageType,
  MessageTypeGetContent,
  MessageTypeOnlineContentReq,
  SearchOnlineResult,
} from '@b-reader/utils'
import open from 'open'
import type { ExtensionContext, Webview } from 'vscode'
import { commands } from 'vscode'
import { isEmpty } from 'lodash'
import { parseBook } from './book-parse'
import { Commands, StoreKeys } from './config'
import { useDatabase } from './db'
import { useMessage, useProgress } from './message'
import { getCacheBook } from './utils/book'
import { writeBook, writeBookInfor } from './utils/read-file'
import { sendMessage, sendMessageToAll } from './utils/send-message'

const { berror } = useMessage()
const { start, stop } = useProgress()

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
        case 'online:read:req':
          receiveOnlineReadReq(message.data, config)
          break
        case 'online:add_bookshelf:req':
          receiveOnlineAddBookshelfReq(message.data, config)
          break
        case 'reader:common:get_nav:req':
          receiveCommonReaderNav(message.data, config, webview)
          break
        case 'reader:common:content:req':
          receiveCommonReaderContent(message.data, config, webview)
          break
      }
    },
    undefined,
    context.subscriptions,
  )
}

async function receiveCommonReaderContent(book: MessageTypeOnlineContentReq['data'], config: BReaderContext, webview: Webview) {
  try {
    start(`获取章节内容${book.title}`)
    const { getValue, setValue } = useDatabase(config)
    const cachePath = `${StoreKeys.cache}/${book.md5}`
    const cache = await getValue<any>(cachePath)
    let content = cache?.contents?.[book.path]
    // use cache
    if (isEmpty(content) || !content) {
      content = await getChapterContent(config.biquge!, book.path)
      await setValue(cachePath, {
        ...cache,
        contents: {
          ...cache?.contents,
          [book.path]: content,
        },
      })
    }

    await sendMessage(webview, 'reader:common:content:res', {
      path: book.path,
      content,
      scroll: book.scroll,
      title: book.title,
    })
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveCommonReaderNav(book: Book, config: BReaderContext, webview: Webview) {
  try {
    start(`获取目录${book.config.name}`)
    const { getValue, setValue } = useDatabase(config)
    const cachePath = `${StoreKeys.cache}/${book.md5}`
    const cache = await getValue<any>(cachePath)
    let navs = cache?.navs
    if (isEmpty(navs) || !navs) {
      navs = await getChapter(config.biquge!, book.config.path)
      await setValue(cachePath, {
        ...cache,
        navs,
      })
    }

    await sendMessage(webview, 'reader:common:get_nav:res', navs)
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveNav(bookId: string, config: BReaderContext, webview: Webview) {
  try {
    start('获取目录')
    const { getValue } = useDatabase(config)
    const cache = await getValue<Epub>(`${StoreKeys.cache}/${bookId}`)
    await sendMessage(webview, 'snedNav', cache.nva)
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveBook(book: BookConfig, config: BReaderContext) {
  try {
    start('下载中...')
    await writeBook(book, config)
    await writeBookInfor(book, config)
    const { getValue } = useDatabase(config)
    const res = await getValue<Record<string, Book>>(StoreKeys.book)
    await sendMessageToAll('bookself', 'bookInfor', res)
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveBookInfor(config: BReaderContext, webview: Webview) {
  try {
    start('获取书架中...')
    const { getValue } = useDatabase(config)
    const res = await getValue<Record<string, Book>>(StoreKeys.book)
    await sendMessage(webview, 'bookInfor', res)
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function openWebview(data: string) {
  try {
    start('打开中...')
    await commands.executeCommand(`b-reader.local.${data}`, data)
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveOpenBook(bookId: string, config: BReaderContext) {
  try {
    start('打开中...')
    const bookinfo = await getCacheBook(bookId, config)
    switch (bookinfo.config.type) {
      case 'application/epub+zip':
        await commands.executeCommand(Commands.openReader, bookinfo)
        break
      default:
        await commands.executeCommand(Commands.openCommonReader, bookinfo)
        break
    }
    stop()
  }
  catch (error) {
    berror(error)
  }
}

// 获取章节内容
async function receiveContent(data: MessageTypeGetContent['data'], config: BReaderContext, webview: Webview) {
  try {
    start('获取章节内容')
    const bookinfo = await getCacheBook(data.bookId, config)
    const bookInstance = await parseBook(bookinfo, config)
    const chapter = await bookInstance.getContent()
    await sendMessage(webview, 'sendContent', chapter)
    // cache
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveOnlieSearch(data: string, config: BReaderContext, webview: Webview) {
  try {
    start('搜索中...')
    const res = await search(config.biquge!, data)
    await sendMessage(webview, 'online:search:res', res)
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveOnlineReadReq(data: SearchOnlineResult, config: BReaderContext) {
  try {
    start('打开中...')
    const book: BookConfig = {
      ...data,
      name: data.title,
      path: data.path,
      type: 'online/biquge',
    }

    const _book = await writeBookInfor(book, config, false)
    await commands.executeCommand(Commands.openCommonReader, _book)
    stop()
  }
  catch (error) {
    berror(error)
  }
}

async function receiveOnlineAddBookshelfReq(data: SearchOnlineResult, config: BReaderContext) {
  try {
    start('添加中...')
    const book: BookConfig = {
      ...data,
      name: data.title,
      path: data.path,
      type: 'online/biquge',
    }

    await writeBookInfor(book, config)
    const { getValue } = useDatabase(config)
    const res = await getValue<Record<string, Book>>(StoreKeys.book)
    await sendMessageToAll('bookself', 'bookInfor', res)
    stop()
  }
  catch (error) {
    berror(error)
  }
}
