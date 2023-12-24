import { Uri, window, workspace } from "vscode";
import path from "node:path";

export async function readFile(filePath: string) {
  console.log("readFile", Uri.file(path.resolve(filePath)));

  return await workspace.fs.readFile(Uri.file(path.resolve(filePath)));
}
