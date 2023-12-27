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

export interface RootFile {
  ['full-path']: string
  ['media-type']: string
}

// tslib
// type Awaited<T extends PromiseLike<any>> = T extends PromiseLike<infer U>
//   ? U extends PromiseLike<any>
//     ? Awaited<U>
//     : U
//   : never
