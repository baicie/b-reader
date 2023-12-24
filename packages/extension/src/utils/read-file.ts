import { BookConfig } from "@b-reader/utils";
import fs from "node:fs";
import path from "node:path";
import { Uri, workspace } from "vscode";
import { BReaderContext } from "@b-reader/utils";

export async function readFile(filePath: string) {
  return await workspace.fs.readFile(Uri.file(path.resolve(filePath)));
}

export async function writeFile(filePath: string, content: string) {
  return await workspace.fs.writeFile(
    Uri.file(path.resolve(filePath)),
    Buffer.from(content)
  );
}

export async function writeBook(book: BookConfig, config: BReaderContext) {
  try {
    const { name } = book;
    const bookNamePath = path.join(config.bookPath!.fsPath, name);

    if (!fs.existsSync(bookNamePath)) {
      // 书不在
      fs.copyFileSync(book.path, bookNamePath);
    }
  } catch (error) {
    console.log("writeBook error: ", error);
  }
}