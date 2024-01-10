import type { Nav } from '@b-reader/epub'
import type { Book, MessageType } from '@b-reader/utils'
import { message } from 'ant-design-vue'
import { reactive, ref, shallowReactive } from 'vue'
import { useAppStore } from '../../src/store/app'
import { getDataFromHtml, scrollToElement } from '../../src/utils'

interface RenderData {
  init: Partial<Book>
  navs: Nav[]
  contents: Record<string, {
    id: string
    content: any
  }>
  currentPath: string
}

export function useEpubRender() {
  const { initApp, sendMessage } = useAppStore()

  const scroller = ref()

  const state = reactive<RenderData>({
    init: {},
    navs: [],
    contents: {},
    currentPath: '',
  })

  const getContent = (src: string) => {
    const [href, idname] = src.split('#')
    state.currentPath = href
    if (!state.contents[href]) {
      sendMessage({
        path: 'getContent',
        data: {
          href,
          bookId: state.init.md5!,
        },
      })
    }

    if (idname)
      scrollToElement(idname)
  }

  const initListen = () => {
    window.addEventListener('message', (event) => {
      const data = event.data as MessageType
      switch (data.path) {
        case 'snedNav':
          state.navs = data.data
          getContent(state.navs[0].content)
          break
        case 'sendContent':
          message.destroy()
          for (const item of data.data)
            state.contents[item.id] = item
          // eslint-disable-next-line no-console
          console.log('epub.contents', state.contents)
          break
      }
    })
  }

  const initReader = () => {
    message.loading('正在加载书籍', 0)
    initApp()
    initListen()
    state.init = getDataFromHtml()
    sendMessage({
      path: 'getNav',
      bookId: state.init.md5!,
    })
  }

  return {
    initReader,
    state,
    scroller,
    getContent,
  }
}
