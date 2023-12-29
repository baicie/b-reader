export interface MetaData {

}

export interface Manifest {
  id: string
  href: string
  ['media-type']: string
}

export interface Spine {
  idref: string
}

export interface Guide {

}

export interface TocMeta {
  id: string
  href: string
  tocs?: Toc
}

export interface Toc {
  head: TocHead[]
  docTitle: TocDocTitle[]
  /**
   * nav core data
   */
  navMap: TocNavMap[]
  xmlns: string
  version: string
  'xml:lang': string
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
  navLabel: TocNavLabel[]
  content: TocContent[]
  class: string
  id: string
  playOrder: string
  navPoint?: TocNavPoint[]
}

export interface TocNavMap {
  navPoint: TocNavPoint[]
}

export interface RootFile {
  ['full-path']: string
  ['media-type']: string
}

//
export interface Nav {
  label: string
  content: string
  parentId?: string
  children?: Nav[]
}
