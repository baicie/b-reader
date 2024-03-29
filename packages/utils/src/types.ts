import type { Uri } from 'vscode'

export type MessageType =
  | MessageTypeConfig
  | MessageTypeBookShelf
  | MessageTypeBook
  | MessageTypeOpenLocal
  | MessageTypeRouterTo
  | MessageTypeBookInfor
  | MessageTypeOpenWebview
  | MessageTyoeOpenBook
  | MessageTyoeGetNav
  | MessageTypeReady
  | MessageTypeInitData
  | MessageTypeSendNav
  | MessageTypeGetContent
  | MessageTypeSendContent
  | MessageTypeSearchOnline
  | MessageTypeSearchOnlineResult
  | MessageTypeOnlineReadReq
  | MessageTypeOnlineAddToBookshelfReq
  | MessageTypeCommonReaderGetNavReq
  | MessageTypeOnlineAddToBookshelfRes
  | MessageTypeOnlineContentReq
  | MessageTypeOnlineContentRes

export interface MessageTypeConfig {
  path: 'config'
  data: BReaderContext
}

export interface MessageTypeBookShelf {
  path: 'bookshelf'
  data: string
}

export interface MessageTypeBook {
  path: 'book'
  data: BookConfig
}

export interface MessageTypeOpenLocal {
  path: 'openLocal'
  data: string
}

export interface MessageTypeRouterTo {
  path: 'routerTo'
  data: string
}

export interface MessageTypeBookInfor {
  path: 'bookInfor'
  data: Record<string, Book>
}

export interface MessageTypeOpenWebview {
  path: 'openWebview'
  data: string
}

export interface MessageTyoeOpenBook {
  path: 'openBook'
  data: string
}

export interface MessageTyoeGetNav {
  path: 'getNav'
  bookId: string
}

export interface MessageTypeReady {
  path: 'ready'
}

export interface MessageTypeInitData {
  path: 'initData'
  data: any
}

export interface MessageTypeSendNav {
  path: 'snedNav'
  data: any
}

export interface MessageTypeGetContent {
  path: 'getContent'
  data: {
    href: string
    bookId: string
    preHref?: string
    nextHref?: string
  }
}

export interface MessageTypeSendContent {
  path: 'sendContent'
  data: any[]
}

export interface MessageTypeSearchOnline {
  path: 'online:search'
  data: string
}

export interface MessageTypeSearchOnlineResult {
  path: 'online:search:res'
  data: SearchOnlineResult[]
}

export interface MessageTypeOnlineReadReq {
  path: 'online:read:req'
  data: SearchOnlineResult
}

export interface MessageTypeOnlineAddToBookshelfReq {
  path: 'online:add_bookshelf:req'
  data: SearchOnlineResult
}

export interface MessageTypeCommonReaderGetNavReq {
  path: 'reader:common:get_nav:req'
  data: Book
}

export interface MessageTypeOnlineAddToBookshelfRes {
  path: 'reader:common:get_nav:res'
  data: SearchOnlineResult[]
}

export interface MessageTypeOnlineContentReq {
  path: 'reader:common:content:req'
  data: {
    md5: string
    path: string
    scroll: boolean
    title: string
  }
}

export interface MessageTypeOnlineContentRes {
  path: 'reader:common:content:res'
  data: {
    path: string
    content: string
    scroll?: boolean
    title: string
  }
}

// message

export interface BookConfig {
  name: string
  path: string
  type?: BookType
  [key: string]: any
}

export interface Book {
  config: BookConfig
  md5: string
  img: string
  [key: string]: any
}

export type BReaderContext = Partial<{
  dbPath: Uri
  bookPath: Uri
  localResourceRoots: Uri
  language: string
  extensionPath: string
  imgPath: Uri
  globalStorageUri: Uri
  appid: string
} & BReaderContextInFile>

export interface BReaderContextInFile {
  unzip: boolean
  biquge: string
}

export type BookType = 'application/epub+zip' | 'application/pdf' | 'online/biquge'

// user
export interface BReaderUser {
  welcome: boolean
}

// sreach result
export interface SearchOnlineResult {
  title: string
  author: string
  path: string
  latestChapter: string
  size: string
  updateTime: string
  status: string
  name: string
}
