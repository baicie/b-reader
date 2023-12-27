import { storeToRefs } from 'pinia'
import { useAppStore } from '../store/app'

export function useLog() {
  const { config } = storeToRefs(useAppStore())

  const log = (...args: any[]) => {
    console.log(`${config.value.appid}`, ...args)
  }

  return {
    log,
  }
}
