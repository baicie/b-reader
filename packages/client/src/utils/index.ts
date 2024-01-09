import type { EventDataNode } from 'ant-design-vue/es/tree'

export function getDataFromHtml() {
  const data = document.querySelector('comment')?.innerHTML
  return data ? JSON.parse(data) : null
}

export function handleClickChapter(selectedKeys: string[], e: { node: EventDataNode }) {
  if (selectedKeys.length) {
    // eslint-disable-next-line no-console
    console.log(selectedKeys, e)
    const id = selectedKeys[0].split('#').length > 1 ? selectedKeys[0].split('#')[1] : selectedKeys[0]
    scrollToElement(id)
  }
}

export function scrollToElement(name: string) {
  // 获取目标元素的引用
  const targetElement = document.getElementById(name)
  // 使用 scrollIntoView 方法滚动到目标元素
  targetElement && targetElement.scrollIntoView({
    behavior: 'smooth', // 可选，滚动行为，可以是 'auto', 'smooth', 'instant'
  })
}
