import fs from "node:fs";
import { Uri } from "vscode";

export function existsOrCreate(target: string | Uri) {
  let _path = "";
  if (typeof target === "string") {
    _path = target;
  } else {
    _path = target.path;
  }

  if (!fs.existsSync(_path)) {
    fs.writeFileSync(_path, JSON.stringify({}), { encoding: "utf-8" });
  }
}
