import path from 'node:path'
import { get } from 'lodash'
import { useUnzip } from './unzip'
import { useParseXml } from './parse-xml'
import type { Guide, Manifest, MetaData, Nav, RootFile, Spine, Toc, TocMeta } from './types'
import { expandedData, resolveId, transformNavPoint } from './utils'

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

  public cover?: string

  // core functions
  private usezip: Awaited<ReturnType<typeof useUnzip>>
  private usexml: ReturnType<typeof useParseXml>

  // parsed data
  // TODO: s?
  private rootFile?: RootFile

  // main func
  async parse() {
    this.usezip = await useUnzip(this.bookPath)
    this.usexml = useParseXml()
    await this.parseMetadata()
    await this.parseToc()
    await this.parseGuide()
  }

  public getSpines() {
    return this.spine
  }

  public async getContent(refid: string) {
    const spine = this.spine?.find(item => item.idref === refid)
    if (!spine)
      return null

    const manifest = this.manifest?.find(item => item.id === spine.idref)
    if (!manifest)
      return null

    const contentPath = manifest.href
    const content = await this.usezip.fileFileContent(contentPath)
    const xml = await this.usexml.parse(content)
    return expandedData(xml)
  }

  public getToc() {
    return this.toc
  }

  public getNva() {
    return this.nva
  }

  public getCover() {
    return this.getFile(this.cover!, 'base64')
  }

  public async getFile(path: string, type: BufferEncoding = 'utf-8') {
    return await this.usezip.getFile(path, { type })
  }

  public async unzip(path: string) {
    await this.usezip.unzip(path)
  }

  private async parseGuide() {
    const guidPath = resolveId(this.fullPath, get(this.guide, '[0].href') as unknown as string)
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
