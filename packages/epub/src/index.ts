import { get } from 'lodash'
import mime from 'mime-types'
import type { ParserOptions } from 'xml2js'
import { useParseXml } from './parse-xml'
import type { Guide, Manifest, MetaData, Nav, RootFile, Spine, TocMeta } from './types'
import { useUnzip } from './unzip'
import { expandedData, resolveId, transformNavPoint } from './utils'

export type {
  Nav,
}

export class Epub {
  constructor(bookPath: string) {
    this.bookPath = bookPath
  }

  // config
  private config = {

  }

  private fullPath: string

  // export data
  public bookPath: string

  // core data
  /**
   * 元数据
   */
  public metadata?: MetaData
  /**
   * 资源
   */
  public manifest?: Manifest[]
  /**
   * 书脊
   */
  public spine?: Spine[]
  /**
   * 首页
   */
  public guide?: Guide[]
  /**
   * 目录
   */
  private toc: TocMeta = {
    id: '',
    href: '',
  }

  public nva: Nav[] = []
  public content: any[] = []

  public cover?: string

  // core functions
  private usezip: Awaited<ReturnType<typeof useUnzip>>
  private usexml: ReturnType<typeof useParseXml>

  // parsed data
  // TODO: s?
  private rootFile?: RootFile

  // main func
  async parse() {
    // eslint-disable-next-line no-console
    console.time('epub parse')
    this.usezip = await useUnzip(this.bookPath)
    this.usexml = useParseXml()
    await this.parseMetadata()
    await this.parseToc()
    await this.parseGuide()
    await this.parseConent()
    // eslint-disable-next-line no-console
    console.timeEnd('epub parse')
  }

  public getSpines() {
    return this.spine
  }

  public getToc() {
    return this.toc
  }

  public getNva() {
    return this.nva
  }

  public async getCover() {
    const base64Image = await this.getFile(this.cover!, 'base64')
    const mimeType = mime.lookup(base64Image)
    const res = `data:${mimeType};base64,${base64Image}`
    return res
  }

  public async getContent(id?: string) {
    if (id) {
      const find = this.content.find(item => item.id === id)
      if (find)
        return [find]
    }
    return this.content
  }

  public async getFile(path: string, type: BufferEncoding = 'utf-8') {
    return await this.usezip.getFile(path, { type })
  }

  public async unzip(path: string) {
    await this.usezip.unzip(path)
  }

  private async parseConent(options?: ParserOptions) {
    try {
      for (const item of this.spine ?? []) {
        const manifest = this.manifest?.find(manifest => manifest.id === item.idref)
        if (manifest && manifest.href) {
          const filePath = resolveId(this.fullPath, manifest?.href)
          const content = await this.usezip.fileFileContent(filePath)
          const xml = await this.usexml.parse(content, {
            preserveChildrenOrder: true,
            explicitChildren: true,
            ...options,
          })
          if (!xml)
            continue
          this.traverseImages(xml, filePath).then(() => {
            const temp = expandedData(xml)
            const result = {
              id: manifest.href,
              content: temp,
            }
            this.content.push(result)
          }).catch((error) => {
            console.error('traverseImages error', error)
          })
        }
      }
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log('parseConent error', error)
    }
  }

  private async traverseImages(node: any, importer = this.fullPath) {
    if (node && typeof node === 'object') {
      if (Array.isArray(node)) {
        // 处理数组
        for (const item of node)
          await this.traverseImages(item, importer)
      }
      else {
        // 处理对象
        for (const key in node) {
          if (key === 'img' || key === 'image') {
            await this.updateImageToBase64(node[key], importer)
          }
          else {
            // 递归处理其他标签
            await this.traverseImages(node[key], importer)
          }
        }
      }
    }
  }

  // 将 img 标签中的图片转换为 base64
  private async updateImageToBase64(imgNode, importer: string = this.fullPath) {
    if (imgNode && imgNode[0] && imgNode[0].$ && (imgNode[0].$.src || imgNode[0].$['xlink:href']) && !imgNode[0].$.base64) {
      const imageFilePath = resolveId(importer, imgNode[0].$.src || imgNode[0].$['xlink:href'])
      try {
        const base64Image = await this.usezip.file2Base64(imageFilePath)
        const mimeType = mime.lookup(base64Image)
        const res = `data:${mimeType};base64,${base64Image}`
        // 更新 img 标签中的属性
        if (imgNode[0].$.src)
          imgNode[0].$.src = res
        if (imgNode[0].$['xlink:href'])
          imgNode[0].$['xlink:href'] = res
        imgNode[0].$.base64 = true
      }
      catch (error) {
        console.error(`Error reading image file: ${imageFilePath}`)
      }
    }
  }

  private async parseGuide() {
    const coverGuide = this.guide?.find(item => item.type === 'cover')
    if (!coverGuide)
      return
    const guidPath = resolveId(this.fullPath, get(coverGuide, 'href'))
    const coverXml = expandedData(await this.parseXml(guidPath))

    let imgPath = get(coverXml, 'html.body[0].div[0].img[0].src')
    if (!imgPath)
      imgPath = get(coverXml, 'html.body[0].div[0].svg[0].image[0].xlink:href')
    this.cover = resolveId(guidPath, imgPath)
  }

  private async parseToc() {
    this.toc.href = this.manifest?.find(item => item.id === this.toc.id)?.href ?? ''
    this.toc.tocs = await this.getContentAndParse(resolveId(this.fullPath, this.toc.href), 'ncx')
    this.nva = this.toc.tocs.navMap.map(item => transformNavPoint(item.navPoint)).flat()
  }

  // mata data 简要信息
  // manifest 资源
  // spine 分区？
  // guide 首页
  private async parseMetadata() {
    this.rootFile = await this.getContentAndParse<RootFile>('META-INF/container.xml', 'container.rootfiles[0].rootfile[0].$')
    const rootFileContent = await this.parseXml(this.rootFile!['full-path'])
    if (!rootFileContent)
      return
    this.fullPath = this.rootFile!['full-path']
    this.metadata = expandedData(get(rootFileContent, 'package.metadata[0]'))
    this.manifest = expandedData(get(rootFileContent, 'package.manifest[0].item')) as Manifest[]
    this.spine = expandedData(get(rootFileContent, 'package.spine[0].itemref')) as Spine[]
    this.guide = expandedData(get(rootFileContent, 'package.guide[0].reference')) as Guide[]
    this.toc.id = expandedData(get(rootFileContent, 'package.spine[0].$.toc'))
  }

  private async getContentAndParse<T>(
    path: string,
    getPath: string,
  ) {
    const text = await this.usezip.fileFileContent(path)
    const xml = await this.usexml.parse(text)
    return expandedData(get(xml, getPath)) as T
  }

  private async parseXml(
    path: string,
  ) {
    const text = await this.usezip.fileFileContent(path)
    return this.usexml.parse(text)
  }
}
