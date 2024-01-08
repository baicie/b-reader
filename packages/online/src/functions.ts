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

export async function getChapter(DOMAIN: string, pathStr: string): Promise<any[]> {
  const result: any[] = []
  const res = await request.send(DOMAIN + pathStr)
  const $ = load(res.body)
  $('#list dd').each((i: number, elem: any) => {
    const name = $(elem).find('a').text()
    const path = $(elem).find('a').attr()?.href
    result.push(
      {
        type: '.biquge',
        name,
        isDirectory: false,
        path: pathStr + path,
      },
    )
  })
  return result
}

export async function getChapterContent(DOMAIN: string, pathStr: string): Promise<string> {
  let result = ''
  const res = await request.send(DOMAIN + pathStr)
  const $ = load(res.body)
  const html = $('#content').html()
  result = html || ''
  return result
}

export async function getCover(DOMAIN: string, pathStr: string): Promise<any> {
  const res = await request.send(DOMAIN + pathStr)
  const $ = load(res.body)
  const src = $('#fmimg').find('img').attr()?.src
  return src
}
