import fs from "node:fs";
import crypto from "node:crypto";

export function calculateMD5(filePath: string) {
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash("md5").update(data).digest("hex");
  return hash;
}
