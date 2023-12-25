import { Uri } from "vscode";

export type MessageType =
  | MessageTypeConfig
  | MessageTypeBookShelf
  | MessageTypeBook
  | MessageTypeOpenLocal
  | MessageTypeRouterTo
  | MessageTypeBookInfor
  | MessageTypeOpenWebview;

export type MessageTypeConfig = {
  path: "config";
  data: BReaderContext;
};

export type MessageTypeBookShelf = {
  path: "bookshelf";
  data: string;
};

export type MessageTypeBook = {
  path: "book";
  data: BookConfig;
};

export type MessageTypeOpenLocal = {
  path: "openLocal";
  data: string;
};

export type MessageTypeRouterTo = {
  path: "routerTo";
  data: string;
};

export type MessageTypeBookInfor = {
  path: "bookInfor";
  data: Record<string, Book>;
};

export type MessageTypeOpenWebview = {
  path: "openWebview";
  data: string;
};

// message

export type BookConfig = {
  name: string;
  path: string;
  type?: string;
};

export type Book = {
  config: BookConfig;
  md5: string;
  img: string;
};

export type BReaderContext = Partial<{
  dbPath: Uri;
  bookPath: Uri;
  localResourceRoots: Uri;
  language: string;
  extensionPath: string;
  imgPath: Uri;
  globalStorageUri: Uri;
  appid: string;
}>;

export type BookType = "edup" | "txt" | "online";
