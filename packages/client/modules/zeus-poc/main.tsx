/** @jsxImportSource @zeus-js/zeus */
/// <reference types="@zeus-js/zeus/jsx" />
import { For, Show, createSignal, render } from '@zeus-js/zeus'
import '@zeus-web/ui'
import '@zeus-web/ui/styles.css'
import type { Nav } from '@b-reader/epub'
import { flattenNavigation } from '../../src/utils/reader-navigation'
import type { WebviewApi } from '../../src/vite-env'
import './style.css'

const sampleNavigation: Nav[] = [
  {
    id: 'chapter-1',
    label: '第一章',
    content: 'chapter-1.xhtml',
    children: [
      { id: 'chapter-1-1', label: '开端', content: 'chapter-1.xhtml#start' },
      { id: 'chapter-1-2', label: '转折', content: 'chapter-1.xhtml#turn' },
    ],
  },
  { id: 'chapter-2', label: '第二章', content: 'chapter-2.xhtml' },
]

const [count, setCount] = createSignal(0)
const [selected, setSelected] = createSignal('chapter-1.xhtml')
const [connected, setConnected] = createSignal(false)

const chapters = flattenNavigation(sampleNavigation)
void chapters
const vscode: WebviewApi<unknown> | undefined = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined
const onMessage = (event: MessageEvent<unknown>) => {
  const message = event.data as { path?: string }
  if (message.path === 'config')
    setConnected(true)
}
window.addEventListener('message', onMessage)
vscode?.postMessage({ path: 'config', data: {} })

function App() {
  return (
    <section class="poc-shell">
      <header class="poc-header">
        <div>
          <p class="eyebrow">隔离验证</p>
          <h1>Zeus 阅读器 POC</h1>
          <p class="status">{connected() ? '消息边界已连接' : '等待消息边界'}</p>
        </div>
        <zw-button variant="primary" onClick={() => setCount(value => value + 1)}>触发状态更新 {count()}</zw-button>
      </header>
      <div class="poc-grid">
        <aside class="chapter-panel" aria-label="章节目录">
          <h2>章节目录</h2>
          <ul>
              <For each={sampleNavigation} children={(item: Nav) => (
                <li>
                  <button class={selected() === item.content ? 'selected' : ''} onClick={() => setSelected(item.content)}>
                    {item.label}
                  </button>
                  <Show when={Boolean(item.children?.length)} children={() => (
                    <ul class="nested-list">
                      <For each={item.children ?? []} children={(child: Nav) => (
                        <li><button class={selected() === child.content ? 'selected' : ''} onClick={() => setSelected(child.content)}>{child.label}</button></li>
                      )} />
                    </ul>
                  )} />
                </li>
              )} />
          </ul>
        </aside>
        <article class="chapter-preview">
          <p class="eyebrow">当前章节</p>
          <h2>{selected()}</h2>
          <p>这是非生产入口，用于验证 Zeus 响应式状态、嵌套目录、主题样式、Webview 消息和组件卸载。</p>
        </article>
      </div>
    </section>
  )
}

const root = document.querySelector('#root')
if (root) {
  const dispose = render(() => <App />, root)
  window.addEventListener('pagehide', dispose, { once: true })
}
