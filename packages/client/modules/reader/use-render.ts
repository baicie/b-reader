import type { Book, MessageType } from '@b-reader/utils'
import { reactive, ref } from 'vue'

// import type { Epub } from '@b-reader/epub'
import { useAppStore } from '../../src/store/app'

export function useEpubRender() {
  const { initApp, sendMessage } = useAppStore()
  const book = reactive<Partial<Book>>({
  })

  const epub = ref({
    nva: [],
  })

  const initListen = () => {
    window.addEventListener('message', (event) => {
      const message = event.data as MessageType
      switch (message.path) {
        case 'initData':
          Object.assign(book, message.data)
          sendMessage({
            path: 'getNav',
            bookId: book.md5!,
          })
          break
        case 'snedNav':
          epub.value.nva = message.data
          break
      }
    })
  }

  const initReader = () => {
    initApp()
    initListen()

    sendMessage({
      path: 'ready',
    })
  }
  return {
    initReader,
    epub,
  }
}
