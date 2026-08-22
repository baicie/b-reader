export type EpubVersion = '2' | '3' | string

export interface EpubText {
  value: string
  id?: string
  language?: string
  direction?: 'ltr' | 'rtl' | 'auto'
  role?: string
  fileAs?: string
}

export interface EpubIdentifier {
  value: string
  id?: string
  scheme?: string
}

export interface EpubMeta {
  property?: string
  name?: string
  content?: string
  refines?: string
  scheme?: string
  value?: string
}

export interface MetaData {
  title: string
  titles: EpubText[]
  creator?: string
  creators: EpubText[]
  language?: string
  languages: string[]
  identifier?: string
  identifiers: EpubIdentifier[]
  publisher?: string
  description?: string
  date?: string
  rights?: string
  source?: string
  type?: string
  format?: string
  coverage?: string
  relation?: string
  subjects: string[]
  contributors: EpubText[]
  modified?: string
  meta: EpubMeta[]
}

export interface Manifest {
  id: string
  /** Original href exactly as declared in the OPF manifest. */
  sourceHref?: string
  href: string
  ['media-type']: string
  mediaType: string
  properties: string[]
  fallback?: string
  ['media-overlay']?: string
  /** Normalized archive path. */
  path: string
}

export interface Spine {
  idref: string
  index: number
  linear: boolean
  properties: string[]
  href?: string
  path?: string
  item?: Manifest
}

export interface Guide {
  type: string
  href: string
  title?: string
}

export type TocType = 'nav' | 'ncx' | 'spine'

export interface TocMeta {
  id: string
  href: string
  type?: TocType
  navigation: Nav[]
  /** Retained for consumers that inspect the original EPUB 2 NCX object. */
  tocs?: Toc
}

export interface Toc {
  head?: TocHead[]
  docTitle?: TocDocTitle[]
  navMap?: TocNavMap[]
  xmlns?: string
  version?: string
  'xml:lang'?: string
}

export interface Meta {
  content: string
  name: string
}

export interface TocHead {
  meta: Meta[]
}

export interface TocDocTitle {
  text: string[]
}

export interface TocNavLabel {
  text: string[]
}

export interface TocContent {
  src: string
}

export interface TocNavPoint {
  navLabel?: TocNavLabel[]
  content?: TocContent[]
  class?: string
  id?: string
  playOrder?: string
  navPoint?: TocNavPoint[]
}

export interface TocNavMap {
  navPoint?: TocNavPoint[]
}

export interface RootFile {
  ['full-path']: string
  ['media-type']?: string
}

export interface Nav {
  id?: string
  label: string
  /** Path relative to the OPF document, optionally followed by a fragment. */
  content: string
  href?: string
  path?: string
  fragment?: string
  external?: boolean
  parentId?: string
  children?: Nav[]
}

export interface EpubContent {
  /** Path relative to the OPF document. */
  id: string
  manifestId: string
  href: string
  /** Normalized archive path. */
  path: string
  mediaType: string
  content: unknown
}

export interface EpubPublication {
  version: EpubVersion
  packagePath: string
  metadata: MetaData
  manifest: Manifest[]
  spine: Spine[]
  navigation: Nav[]
  cover?: Manifest
  warnings: EpubWarning[]
}

export type EpubWarningCode
  = | 'MISSING_TOC'
    | 'INVALID_TOC'
    | 'MISSING_SPINE_ITEM'
    | 'MISSING_RESOURCE'
    | 'INVALID_CONTENT'
    | 'INVALID_COVER'

export interface EpubWarning {
  code: EpubWarningCode
  message: string
  path?: string
}
