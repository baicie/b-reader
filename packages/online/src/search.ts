import { load } from 'cheerio'
import { request } from './index.js'

export async function search(DOMAIN: string, keyword: string): Promise<any> {
  const result: any[] = []
  try {
    const res = await request.send(`${DOMAIN}/modules/article/search.php?searchkey=${encodeURI(keyword)}`)
    const $ = load(res.body)
    $('.grid tbody > tr').each((i: number, elem: any) => {
      const title = $(elem).find('td:nth-child(1)').text()
      const author = $(elem).find('td:nth-child(3)').text()
      const path = $(elem).find('td:nth-child(1)').find('a').attr('href')
      if (title && author) {
        result.push(
          Object.assign({}, {
            type: '.biquge',
            name: `${title} - ${author}`,
            isDirectory: true,
            path,
          }),
        )
      }
    })
  }
  catch (error) {
    console.warn(error)
  }
  return result
}
