import { BookConfig, BReaderContext, BookType } from "@b-reader/utils";
import { parseEpub } from "./epub";

export async function parseBook(book: BookConfig, config: BReaderContext) {
  switch (book.type) {
    case "application/epub+zip":
      await parseEpub(book, config);
      break;
  }
}
