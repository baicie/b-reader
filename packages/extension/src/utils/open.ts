import { exec } from 'node:child_process'
import process from 'node:process'

export function openUrl(folderPath: string) {
  // TOFIX  替换为包稳健
  try {
    switch (process.platform) {
      case 'darwin': // macOS
        exec(`open "${folderPath}"`)
        break
      case 'win32': // Windows
        exec(`start "" "${folderPath}"`, { windowsHide: true })
        break
      case 'linux': // Linux
        exec(`xdg-open "${folderPath}"`)
        break
      default:
        console.error('Unsupported platform')
        break
    }
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.log('error', error)
  }
}
