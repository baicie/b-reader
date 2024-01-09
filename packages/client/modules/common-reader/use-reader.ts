import { reactive, ref, toRaw } from 'vue'
import type { Book, MessageType, SearchOnlineResult } from '@b-reader/utils'
import { useAppStore } from '../../src/store/app'
import { getDataFromHtml } from '../../src/utils'

interface CommonReaderState {
  init: Partial<Book>
  navs: SearchOnlineResult[]
  contents: Record<string, {
    path: string
    content: string
    title: string
  }>
  loading: boolean
}

export function useCommonReader() {
  const { initApp: init, sendMessage } = useAppStore()
  const scroller = ref()
  const state = reactive<CommonReaderState>({
    init: {},
    navs: [],
    contents: {},
    loading: false,
  })

  const initListen = () => {
    window.addEventListener('message', (event) => {
      const data = event.data as MessageType
      switch (data.path) {
        case 'reader:common:get_nav:res':
          state.navs = data.data
          sendMessage({
            path: 'reader:common:content:req',
            data: {
              md5: state.init.md5!,
              path: state.navs[0].path,
              scroll: false,
              title: state.navs[0].name,
            },
          })
          break
        case 'reader:common:content:res': {
          const { path, content, scroll, title } = data.data
          state.contents[path] = {
            path,
            content,
            title,
          }
          state.loading = false
          if (scroll)
            scroller.value?.scrollToItem(path)

          break
        }
      }
    })
  }

  const initApp = () => {
    init()
    initListen()
    state.init = getDataFromHtml()
    sendMessage({
      path: 'reader:common:get_nav:req',
      data: toRaw(state.init) as Book,
    })
  }

  return {
    initApp,
    state,
    sendMessage,
    scroller,
  }
}
