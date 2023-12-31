import { get } from 'lodash'
import type { Nav, TocNavPoint } from './types'

interface ItemWithDollar {
  $: Record<string, unknown> // $ 属性的值为任意对象
  [key: string]: unknown
}
type InputData = ItemWithDollar | ItemWithDollar[]
export function expandedData(data: InputData): any {
  if (Array.isArray(data)) {
    return data.map(expandedData) as InputData
  }
  else if (typeof data === 'object') {
    const newData: ItemWithDollar = { ...data }

    for (const key of Object.keys(newData)) {
      if (key === '$' && typeof newData[key] === 'object') {
        // 将 $ 中的属性展开到父级对象
        Object.assign(newData, newData[key])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        delete newData[key]
      }
      else if (typeof newData[key] === 'object') {
        // 递归处理子对象
        newData[key] = expandedData(newData[key] as InputData)
      }
    }

    return newData
  }
  else {
    // Base case: return non-object values unchanged
    return data
  }
}

//
export function transformNavPoint(nav: TocNavPoint[], parentId: string = 'root'): Nav[] {
  return nav.map((item) => {
    const res: Nav = {
      label: get(item, 'navLabel[0].text[0]'),
      content: get(item, 'content[0].src'),
      parentId,
    }

    if (item.navPoint)
      res.children = transformNavPoint(item.navPoint, item.id)

    return res
  })
}

function usePath() {
  function dirname(path: string) {
    return path.includes('/') ? path.split('/').slice(0, -1).join('/') : ''
  }

  function resolve(form: string, to: string) {
    const res: string[] = dirname(form).split('/')
    const args: string[] = to.split('/')

    for (const arg of args) {
      if (arg === '..')
        res.pop()
      else if (arg !== '.')
        res.push(arg)
    }

    return res.join('/')
  }

  return {
    dirname,
    resolve,
  }
}

/**
 *
 * @param importer 引用者得路径 guide
 * @param id 被引用的路径 图片
 * @returns
 */
export function resolveId(importer: string, id: string) {
  const path = usePath()
  let res = ''

  if (!importer || !id)
    return id || importer

  if (importer.startsWith('/'))
    res = path.resolve(importer, id)

  if (id.startsWith('.') || (importer.startsWith('/') && id.startsWith('.')))
    res = path.resolve(importer, id)

  const bareImportRE = /^(?![a-zA-Z]:)[\w@](?!.*:\/\/)/
  if (bareImportRE.test(id) && bareImportRE.test(importer))
    res = path.resolve(importer, id)

  return decodeURIComponent(res)
}
