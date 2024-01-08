import { reactive } from 'vue'
import type { MessageType } from '@b-reader/utils'
import { useAppStore } from '../../src/store/app'

interface CommonReaderState {

}

export function useCommonReader() {
  const { initApp: init, sendMessage } = useAppStore()

  const state = reactive<CommonReaderState>({

  })

  const initListen = () => {
    window.addEventListener('message', (event) => {
      const data = event.data as MessageType
      // switch (data.path) {
      //   //
      // }
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
