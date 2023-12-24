import { Uri, workspace } from "vscode";
import { BReaderContext } from "@b-reader/utils";

export const useDatabase = (config: BReaderContext) => {
  async function getValue<T extends object>(path: string) {
    const res = await workspace.fs.readFile(
      Uri.joinPath(config.dbPath!, `${path}.json`)
    );
    const de = new TextDecoder();
    const json = de.decode(res);

    return JSON.parse(json) as T;
  }

  async function setValue<S extends object>(path: string, value: S = {} as S) {
    await workspace.fs.writeFile(
      Uri.joinPath(config.dbPath!, `${path}.json`),
      Buffer.from(JSON.stringify(value))
    );
  }

  async function initDatabase(config: BReaderContext) {
    if (config.dbPath) {
      await workspace.fs.createDirectory(config.dbPath);
    }
  }

  return {
    getValue,
    setValue,
    initDatabase,
  };
};
