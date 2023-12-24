import { exec } from "node:child_process";

export function openUrl(folderPath: string) {
  try {
    switch (process.platform) {
      case "darwin": // macOS
        exec(`open "${folderPath}"`);
        break;
      case "win32": // Windows
        exec(`start "" "${folderPath}"`, { windowsHide: true });
        break;
      case "linux": // Linux
        exec(`xdg-open "${folderPath}"`);
        break;
      default:
        console.error("Unsupported platform");
        break;
    }
  } catch (error) {
    console.log("error", error);
  }
}
