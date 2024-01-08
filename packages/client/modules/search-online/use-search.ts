import { reactive } from 'vue'
import type { MessageType, SearchOnlineResult } from '@b-reader/utils'
import { useAppStore } from '../../src/store/app'

interface OnlineState {
  res: SearchOnlineResult[]
}

export function useSearch() {
  const { initApp: init, sendMessage } = useAppStore()

  const state = reactive<OnlineState>({
    res: [],
  })

  const initListen = () => {
    window.addEventListener('message', (event) => {
      const data = event.data as MessageType
      switch (data.path) {
        case 'online:search:res':
          state.res = data.data
          break
      }
    })
  }

  const initApp = () => {
    init()
    initListen()
  }

  return {
    initApp,
    state,
    sendMessage,
  }
}
