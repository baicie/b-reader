import { useVscodeContext } from "../context";
import { ExtensionContext, Uri, workspace } from "vscode";
import { DB_NAME } from "@b-reader/utils";

interface DataBase {}

export const useDatabase = (context: ExtensionContext) => {
  const { config } = useVscodeContext(context);
  if (config.dbPath) {
    workspace.fs.createDirectory(config.dbPath);
  }

  function getConfig(path: string) {
    try {
      return workspace.fs.readFile(Uri.joinPath(config.dbPath!, path));
    } catch (error) {}
  }

  return {
    getConfig,
  };
};
