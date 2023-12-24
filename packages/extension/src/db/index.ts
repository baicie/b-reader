import { BReaderContext } from "@b-reader/utils";
import path from "node:path";
import { Uri, workspace } from "vscode";
import { decoder } from "../utils/decoder";
import { existsOrCreate } from "../utils/file";

export const useDatabase = (config: BReaderContext) => {
  async function getValue<T extends object>(_path: string) {
    const _uri = resolvePath(_path);
    const res = await workspace.fs.readFile(_uri);
    return decoder<T>(res);
  }

  async function setValue<S extends object>(_path: string, value: S = {} as S) {
    const _uri = resolvePath(_path);
    await workspace.fs.writeFile(_uri, Buffer.from(JSON.stringify(value)));
  }

  function resolvePath(_path: string) {
    const resultPath = path.resolve(config.dbPath!.path, `${_path}.json`);
    existsOrCreate(resultPath);
    return Uri.file(resultPath);
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
