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
