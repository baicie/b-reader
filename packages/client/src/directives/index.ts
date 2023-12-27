import type { App, Directive } from 'vue'
import { dev } from './dev'

const directives = {
  dev,
} as { [key: string]: Directive }

export default {
  install(app: App) {
    Object.keys(directives).forEach((key) => {
      app.directive(key, directives[key])
    })
  },
}
