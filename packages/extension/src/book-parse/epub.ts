import { BookConfig, BReaderContext } from "@b-reader/utils/dist";
import epub, { TocElement } from "epub";

export const useEpubParse = (path: string) => {
  const book = new epub(path);

  const parseChapter = (): Promise<TocElement[]> => {
    return new Promise((resolve) => {
      book.on("end", function () {
        resolve(book.flow);
      });
      book.parse();
    });
  };

  const parseContent = () => {};

  const getChapter = (id: string) => {
    return new Promise((resolve, reject) => {
      book.getChapter(id, function (error, text) {
        if (error) {
          reject(error);
        }
        resolve(text);
      });
    });
  };

  return {
    book,
    parseChapter,
    parseContent,
    getChapter,
  };
};

export async function parseEpub(
  bookConfig: BookConfig,
  config: BReaderContext
) {
  console.log("parseEpub: ", bookConfig);

  const { book, parseChapter, getChapter } = useEpubParse(bookConfig.path);
  const flow = await parseChapter();
  console.log("book: ", book);
  console.log("flow: ", flow);
  flow.forEach((item) => {
    const res = getChapter(item.id);
    console.log("res", res);
  });
}
