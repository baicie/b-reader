import { load } from 'cheerio'
import { request } from './index.js'

export async function search(DOMAIN: string, keyword: string): Promise<any> {
  const result: any[] = []
  const url = `${DOMAIN}/modules/article/search.php?searchkey=${encodeURI(keyword)}`
  const res = await request.send(url)
  const $ = load(res.body)
  $('.grid tbody > tr').each((i: number, elem: any) => {
    const title = $(elem).find('td:nth-child(1)').text()
    const latestChapter = $(elem).find('td:nth-child(2)').text()
    const author = $(elem).find('td:nth-child(3)').text()
    const size = $(elem).find('td:nth-child(4)').text()
    const updateTime = $(elem).find('td:nth-child(5)').text()
    const status = $(elem).find('td:nth-child(6)').text()
    const path = $(elem).find('td:nth-child(1)').find('a').attr('href')
    if (title && author) {
      result.push(
        Object.assign({}, {
          title,
          author,
          path,
          latestChapter,
          size,
          updateTime,
          status,
        }),
      )
    }
  })
  return result
}
