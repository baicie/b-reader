import crypto from 'node:crypto'
import path from 'node:path'
import type { Book, BookConfig } from '@b-reader/utils'

const EPUB_MEDIA_TYPE = 'application/epub+zip' as const

export function getEpubFileName(uriPath: string): string {
  if (!uriPath.trim())
    throw new Error('The selected EPUB path is empty')

  const fileName = path.posix.basename(uriPath)
  if (!fileName || path.posix.extname(fileName).toLowerCase() !== '.epub')
    throw new Error('Please select a valid EPUB file')

  return fileName
}

export function requireBookPath(bookPath: unknown): string {
  if (typeof bookPath !== 'string' || !bookPath.trim())
    throw new TypeError('Book path must be a non-empty string')

  return bookPath
}

export function createLocalBookConfig(name: string, destinationPath: string): BookConfig {
  return {
    name,
    path: requireBookPath(destinationPath),
    type: EPUB_MEDIA_TYPE,
  }
}

export function createBookRecord(config: BookConfig): Book {
  const bookPath = requireBookPath(config.path)
  const md5 = crypto.createHash('md5').update(bookPath, 'utf8').digest('hex')

  return {
    config: {
      ...config,
      path: bookPath,
    },
    md5,
    img: '',
  }
}

export function mergeBookStore(
  store: Record<string, Book> | undefined,
  book: Book,
): Record<string, Book> {
  return {
    ...store,
    [book.md5]: book,
  }
}

export async function runBookImportTransaction<TStage extends { created: boolean }, TResult>(
  stage: () => Promise<TStage>,
  commit: (staged: TStage) => Promise<TResult>,
  rollback: (staged: TStage) => Promise<void>,
  onRollbackError?: (error: unknown) => void,
): Promise<TResult> {
  let staged: TStage | undefined

  try {
    staged = await stage()
    return await commit(staged)
  }
  catch (error) {
    if (staged?.created) {
      try {
        await rollback(staged)
      }
      catch (rollbackError) {
        onRollbackError?.(rollbackError)
      }
    }

    throw error
  }
}
