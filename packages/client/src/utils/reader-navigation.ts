import type { Nav } from '@b-reader/epub'

export function flattenNavigation(items: Nav[], result: Nav[] = []) {
  for (const item of items) {
    if (item.children?.length) {
      if (item.href || item.path)
        result.push(item)
      flattenNavigation(item.children, result)
    }
    else if (item.content && !item.external) {
      result.push(item)
    }
  }
  return result
}
