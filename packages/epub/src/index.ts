import { get } from 'lodash'
import { useUnzip } from './unzip'
import { useParseXml } from './parse-xml'
import type { Guide, Manifest, MetaData, RootFile, Spine } from './types'
import { expandedData } from './utils'

export class Epub {
  constructor(bookPath: string) {
    this.bookPath = bookPath
  }

  // config
  private config = {

  }

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
    return xml
  }

  // mata data 简要信息
  // manifest 资源
  // spine 分区？
  // guide 首页
  async parseMetadata() {
    this.rootFile = await this.parseAndSave<RootFile>('META-INF/container.xml', 'container.rootfiles[0].rootfile[0].$')
    const rootFileContent = await this.parseXml(this.rootFile!['full-path'])
    this.metadata = expandedData(get(rootFileContent, 'package.metadata[0]'))
    this.manifest = expandedData(get(rootFileContent, 'package.manifest[0].item')) as Manifest[]
    this.spine = expandedData(get(rootFileContent, 'package.spine[0].itemref')) as Spine[]
    this.guide = expandedData(get(rootFileContent, 'package.guide[0].reference')) as Guide[]
  }

  private async parseAndSave<T>(
    path: string,
    getPath: string,
  ) {
    const text = await this.usezip.fileFileContent(path)
    const xml = await this.usexml.parse(text)
    return get(xml, getPath) as T
  }

  private async parseXml(
    path: string,
  ) {
    const text = await this.usezip.fileFileContent(path)
    return this.usexml.parse(text)
  }
}
