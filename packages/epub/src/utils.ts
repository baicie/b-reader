import path from 'node:path'
import fs from 'node:fs'
import { get } from 'lodash'
import mime from 'mime-types'
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

/**
 *
 * @param importer 引用者得路径 guide
 * @param id 被引用的路径 图片
 * @returns
 */
export function resolveId(importer: string, id: string) {
  let res = ''
  const bareImportRE = /^(?![a-zA-Z]:)[\w@](?!.*:\/\/)/
  if (!(importer && id))
    res = id || importer
  else if (importer.startsWith('/'))
    res = path.resolve(path.dirname(importer), id)
  else if (importer.startsWith('/') && id.startsWith('.'))
    res = path.resolve(path.dirname(importer), id)
  else if (id.startsWith('.'))
    res = path.resolve(importer, id)
  else if (bareImportRE.test(id) && bareImportRE.test(importer))
    res = path.resolve(path.dirname(importer), id)
  else res = id
  return decodeURIComponent(res)
}