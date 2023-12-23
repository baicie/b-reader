import { Uri } from "vscode";

export type BReaderContext = Partial<{
  dbPath: Uri;
  bookPath: Uri;
  localResourceRoots: Uri;
  language: string;
  extensionPath: string;
}>;
