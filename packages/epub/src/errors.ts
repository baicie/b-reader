export type EpubErrorCode
  = | 'ARCHIVE_OPEN_FAILED'
    | 'MISSING_FILE'
    | 'INVALID_XML'
    | 'INVALID_CONTAINER'
    | 'INVALID_PACKAGE'
    | 'INVALID_PATH'
    | 'EMPTY_SPINE'
    | 'NOT_PARSED'

export class EpubError extends Error {
  readonly code: EpubErrorCode
  readonly phase?: string
  readonly path?: string

  constructor(code: EpubErrorCode, message: string, options: {
    cause?: unknown
    phase?: string
    path?: string
  } = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'EpubError'
    this.code = code
    this.phase = options.phase
    this.path = options.path
  }
}
