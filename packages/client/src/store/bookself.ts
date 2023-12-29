import type { Book, MessageType } from '@b-reader/utils'
import { reactive } from 'vue'
import { useAppStore } from './app'

export function useBookselfStore() {
  const { initApp, config, sendMessage } = useAppStore()
  const state = reactive({
    books: {} as Record<string, Book>,
  })

  const listen = () => {
    window.addEventListener('message', (event) => {
      const message = event.data as MessageType
      switch (message.path) {
        case 'bookInfor':
          state.books = message.data
          break
      }
    })
  }

  const initBookself = () => {
    initApp()
    listen()

    sendMessage({
      path: 'bookInfor',
      data: {},
    })
  }

  const clickBook = (bookId: string) => {
    sendMessage({
      path: 'openBook',
      data: bookId,
    })
  }

  return {
    initBookself,
    config,
    state,
    clickBook,
  }
}
