import { useAppStore } from '../store/app'

export function useLog() {
  const { config } = useAppStore()

  const log = (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.log(`${config.appid}`, ...args)
  }

  return {
    log,
  }
}
