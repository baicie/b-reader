import type { Nav } from '@b-reader/epub'
import type { Book, MessageType } from '@b-reader/utils'
import { message } from 'ant-design-vue'
import { reactive, shallowReactive } from 'vue'
import { useAppStore } from '../../src/store/app'

interface RenderData {
  nva: Nav[]
  contents: {
    id: string
    content: any
  }[]
}

export function useEpubRender() {
  const { initApp, sendMessage } = useAppStore()
  const book = reactive<Partial<Book>>({
  })

  const epub = shallowReactive<RenderData>({
    nva: [],
    contents: [],
  })

  const initListen = () => {
    window.addEventListener('message', (event) => {
      const data = event.data as MessageType
      switch (data.path) {
        case 'initData':
          // message.loading('正在加载书籍', 0)
          Object.assign(book, data.data)
          sendMessage({
            path: 'getNav',
            bookId: book.md5!,
          })
          sendMessage({
            path: 'getContent',
            data: {
              // href,
              bookId: book.md5!,
            },
          })
          break
        case 'snedNav':
          epub.nva = data.data
          message.destroy()
          break
        case 'sendContent':
          message.destroy()
          epub.contents = data.data
          break
      }
    })
  }

  const initReader = () => {
    message.loading('正在加载书籍', 0)
    initApp()
    initListen()

    sendMessage({
      path: 'ready',
    })
  }

  return {
    initReader,
    epub,
    // getContent,
  }
}
