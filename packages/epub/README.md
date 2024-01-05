epubjs
# how to use
pnpm i @b-reader/epub

```ts
import { Epub } from '@b-reader/epub'

const epub = new Epub(bookConfig.path)

declare class Epub {
  constructor(bookPath: string)
  private config
  private fullPath
  bookPath: string
  /**
     * 元数据
     */
  metadata?: MetaData
  /**
     * 资源
     */
  manifest?: Manifest[]
  /**
     * 书脊
     */
  spine?: Spine[]
  /**
     * 首页
     */
  guide?: Guide[]
  /**
     * 目录
     */
  private toc
  nva: Nav[]
  content: any[]
  cover?: string
  private usezip
  private usexml
  private rootFile?
  parse(): Promise<void>
  getSpines(): Spine[]
  getToc(): TocMeta
  getNva(): Nav[]
  getCover(): Promise<string>
  getContent(id?: string): Promise<any[]>
  getFile(path: string, type?: BufferEncoding): Promise<string>
  unzip(path: string): Promise<void>
  private parseConent
  private traverseImages
  private updateImageToBase64
  private parseGuide
  private parseToc
  private parseMetadata
  private getContentAndParse
  private parseXml
}
```