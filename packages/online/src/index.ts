import type { Agents } from 'got'
import got from 'got'
import tough from 'tough-cookie'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'
import { search } from './search'

interface cookiesConfig {
  url: string
  cookie: string
}

class Requset {
  cookieJar: tough.CookieJar
  agent: Agents | undefined
  cookies: cookiesConfig[] = []

  constructor(cookies: cookiesConfig[] = []) {
    this.cookies = cookies
    this.cookieJar = new tough.CookieJar()
    this.reLoadCookie()
  }

  setAgent(proxy: string) {
    this.agent = {
      http: new HttpProxyAgent({
        proxy,
      }),
      https: new HttpsProxyAgent({
        proxy,
      }),
    }
  }

  reLoadCookie() {
    this.cookieJar.removeAllCookiesSync()
    const cookies: cookiesConfig[] = this.cookies
    if (typeof cookies === 'object') {
      cookies.forEach((cookie) => {
        cookie.cookie
          .split(';')
          .map(e => tough.Cookie.parse(e))
          .forEach((e) => {
            e && this.cookieJar.setCookieSync(e, cookie.url)
          })
      })
    }
  }

  async send(options: any) {
    const requestOptions
      = typeof options === 'string'
        ? {
            url: options,
          }
        : options
    const res = await got({
      ...requestOptions,
      cookieJar: this.cookieJar,
      agent: this.agent,
    }).catch((e) => {
      throw e
    })
    return res
  }
}

export const request = new Requset()
export { search }
