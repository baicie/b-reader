import { ExtensionContext } from "vscode";
import { BReaderContext, useVscodeContext } from "./context";
import { DB_NAME, useExtensionPath } from "@b-reader/utils";

// export const TREEVIEW_ID = Symbol("b-reader.treeview");

export const resolveConfig = (context: ExtensionContext) => {
  const { undates } = useVscodeContext(context);
  const { resolvePath } = useExtensionPath(context.extensionPath);

  const config: BReaderContext = {
    dbPath: resolvePath(DB_NAME),
  };

  undates(config);

  return config;
};
