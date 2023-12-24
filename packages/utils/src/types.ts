import { Uri } from "vscode";

export type MessageType<T extends unknown> = {
  path: string;
  data: T;
};

export type BookConfig = {
  name: string;
  path: string;
  type: string;
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
}>;
