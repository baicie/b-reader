import unzipper from 'unzipper'
import { EpubError } from './errors'

function canonicalEntryPath(input: string): string | undefined {
  const normalized = input.replaceAll('\\', '/')
  if (!normalized || normalized.startsWith('/') || /^[a-z]:/i.test(normalized))
    return undefined

  const segments: string[] = []
  for (const segment of normalized.split('/')) {
    if (!segment || segment === '.')
      continue
    if (segment === '..' || segment.includes('\0'))
      return undefined
    segments.push(segment)
  }
  return segments.join('/') || undefined
}

function safelyDecodeEntryPath(input: string): string | undefined {
  try {
    const decoded = input.split('/').map((segment) => {
      const value = decodeURIComponent(segment)
      if (value.includes('/') || value.includes('\\') || value.includes('\0'))
        throw new Error('Unsafe encoded separator')
      return value
    }).join('/')
    return canonicalEntryPath(decoded)
  }
  catch {
    return undefined
  }
}

export async function useUnzip(bookPath: string) {
  let zip: Awaited<ReturnType<typeof unzipper.Open.file>>
  try {
    zip = await unzipper.Open.file(bookPath)
  }
  catch (cause) {
    throw new EpubError('ARCHIVE_OPEN_FAILED', `Unable to open EPUB archive: ${bookPath}`, {
      cause,
      phase: 'archive',
      path: bookPath,
    })
  }

  const entries = new Map<string, (typeof zip.files)[number]>()
  const unsafeEntries: string[] = []
  for (const file of zip.files) {
    const rawPath = canonicalEntryPath(file.path)
    if (!rawPath) {
      unsafeEntries.push(file.path)
      continue
    }
    entries.set(rawPath, file)
    entries.set(rawPath.normalize('NFC'), file)
    const decodedPath = safelyDecodeEntryPath(rawPath)
    if (decodedPath) {
      entries.set(decodedPath, file)
      entries.set(decodedPath.normalize('NFC'), file)
    }
  }

  const lookupPath = (input: string) => {
    const normalized = canonicalEntryPath(input)
    if (!normalized)
      throw new EpubError('INVALID_PATH', `Unsafe EPUB archive path: ${input}`, { phase: 'archive', path: input })
    return normalized
  }

  const findFile = (filePath: string) => {
    try {
      const normalized = lookupPath(filePath)
      return entries.get(normalized) ?? entries.get(normalized.normalize('NFC'))
    }
    catch {
      return undefined
    }
  }

  const getBuffer = async (filePath: string) => {
    const normalized = lookupPath(filePath)
    const file = entries.get(normalized) ?? entries.get(normalized.normalize('NFC'))
    if (!file || file.type === 'Directory')
      throw new EpubError('MISSING_FILE', `Missing EPUB file: ${normalized}`, { phase: 'resource', path: normalized })
    return await file.buffer()
  }

  const fileFileContent = async (filePath: string) => (await getBuffer(filePath)).toString('utf-8')
  const file2Base64 = async (filePath: string) => (await getBuffer(filePath)).toString('base64')

  const getFile = async (filePath: string, options: { type: BufferEncoding } = { type: 'utf-8' }) =>
    (await getBuffer(filePath)).toString(options.type)

  const unzip = async (destination: string) => {
    if (unsafeEntries.length) {
      throw new EpubError('INVALID_PATH', `EPUB contains unsafe ZIP entries: ${unsafeEntries.join(', ')}`, {
        phase: 'extract',
        path: unsafeEntries[0],
      })
    }
    await zip.extract({ path: destination })
  }

  return {
    unzip,
    findFile,
    hasFile: (filePath: string) => Boolean(findFile(filePath)),
    getBuffer,
    getFile,
    fileFileContent,
    file2Base64,
  }
}
