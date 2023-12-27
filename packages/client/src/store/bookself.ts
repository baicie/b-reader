import { defineStore } from 'pinia'
import type { Book, MessageType } from '@b-reader/utils'
import { reactive } from 'vue'
import { useAppStore } from './app'
import { store } from './index'

const bookselfStore = defineStore('bookself', () => {
  const { initApp, config, sendMessage } = useAppStore()
  const state = reactive({
    books: {} as Record<string, Book>,
  })

  const listen = () => {
    window.addEventListener('message', (event) => {
      const message = event.data as MessageType
      switch (message.path) {
        case 'bookInfor':
          console.log('bookInfor', message.data)
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
    console.log('clickBook', bookId)
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
})

export function useBookselfStore() {
  return bookselfStore(store)
}
