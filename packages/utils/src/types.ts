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

// message

export interface BookConfig {
  name: string
  path: string
  type?: BookType
}

export interface Book {
  config: BookConfig
  md5: string
  img: string
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
}>

export type BookType = 'application/epub+zip' | 'application/pdf'

// user
export interface BReaderUser {
  welcome: boolean
}
