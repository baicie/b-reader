import type { EpubContent, Nav } from '@b-reader/epub'
import type { Book, MessageType } from '@b-reader/utils'
import { message } from 'ant-design-vue'
import { nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { useAppStore } from '../../src/store/app'
import { getDataFromHtml, scrollToElement } from '../../src/utils'
import {
  createReaderState,
  flattenNavigation,
  selectNavigation,
  splitNavigationTarget,
} from '../../src/utils/reader-navigation'

export { flattenNavigation } from '../../src/utils/reader-navigation'

interface RenderData {
  init: Partial<Book>
  navs: Nav[]
  contents: Record<string, EpubContent>
  currentPath: string
  pendingFragment?: string
  reader: ReturnType<typeof createReaderState>
}

export function useEpubRender() {
  const { initApp, sendMessage, dispose: disposeApp } = useAppStore()
  const scroller = ref<HTMLElement>()
  const state = reactive<RenderData>({
    init: {},
    navs: [],
    contents: {},
    currentPath: '',
    reader: createReaderState(),
  })
  let removeListener: (() => void) | undefined

  const scrollAfterRender = (fragment?: string) => {
    void nextTick(() => {
      if (fragment)
        scrollToElement(fragment)
      else
        window.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  const getContent = (target: string) => {
    const { href, fragment } = splitNavigationTarget(target)
    if (!href)
      return
    selectNavigation(state.reader, target)
    state.currentPath = href
    state.pendingFragment = fragment
    if (!state.contents[href]) {
      sendMessage({
        path: 'getContent',
        data: {
          href,
          bookId: state.init.md5!,
        },
      })
      return
    }
    scrollAfterRender(fragment)
  }

  const initListen = () => {
    const listener = (event: MessageEvent<unknown>) => {
      const data = event.data as MessageType
      switch (data.path) {
        case 'sendNav':
        case 'snedNav': {
          state.navs = Array.isArray(data.data) ? data.data : []
          const firstChapter = flattenNavigation(state.navs)[0]
          if (firstChapter)
            getContent(firstChapter.content)
          break
        }
        case 'sendContent': {
          message.destroy()
          for (const item of data.data as EpubContent[])
            state.contents[item.id] = item
          const current = state.contents[state.currentPath]
          if (current)
            scrollAfterRender(state.pendingFragment)
          break
        }
        case 'epub:error':
          message.destroy()
          message.error(data.data.message)
          break
      }
    }
    window.addEventListener('message', listener)
    removeListener = () => window.removeEventListener('message', listener)
  }

  const initReader = () => {
    message.loading('正在加载书籍', 0)
    initApp()
    initListen()
    state.init = getDataFromHtml() ?? {}
    if (!state.init.md5) {
      message.destroy()
      message.error('Book data is missing')
      return
    }
    sendMessage({
      path: 'getNav',
      bookId: state.init.md5,
    })
  }

  onBeforeUnmount(() => {
    removeListener?.()
    disposeApp()
  })

  return {
    initReader,
    state,
    scroller,
    getContent,
  }
}
