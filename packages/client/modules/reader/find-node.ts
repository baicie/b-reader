import type { Nav } from '@b-reader/epub'
import type { EventDataNode } from 'ant-design-vue/es/tree'

function findNode(nav: Nav[], content?: string): Nav | undefined {
  if (!content)
    return
  for (const node of nav) {
    const result = findNodeHelper(node, content)
    if (result)
      return result
  }
}

function findNodeHelper(nav: Nav, key: string): Nav | undefined {
  if (nav.content === key)
    return nav

  if (nav.children && nav.children.length > 0) {
    for (const child of nav.children) {
      const result = findNodeHelper(child, key)
      if (result)
        return result
    }
  }
}

export function flattenNavArray(navs: Nav[], key: string) {
  const result: Nav[] = []
  const pre2next: string[] = []

  function flatten(nav: Nav) {
    result.push(nav)

    if (nav.children && nav.children.length > 0) {
      for (const child of nav.children)
        flatten(child)
    }
  }

  for (const nav of navs)
    flatten(nav)

  const getPrenode = (key: string) => {

  }

  const getNextNode = (key: string) => {
    const index = result.findIndex(nav => nav.content === key)
    if (index === -1)
      return
    const nextNode = result[index + 1]
    // return nextNode.children?.length
  }

  return {
    result,
    pre: getPrenode(key),
    next: getNextNode(key),
  }
}
