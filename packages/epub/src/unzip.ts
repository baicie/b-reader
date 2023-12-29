/* eslint-disable n/prefer-global/buffer */
import unzipper from 'unzipper'

export async function useUnzip(bookPath: string) {
  const zip = await unzipper.Open.file(bookPath)

  const findFile = (path: string) => zip.files.find(file => file.path === (path.startsWith('/') ? path.slice(1) : path))

  const buffer2String = (buffer: Buffer) => buffer.toString('utf-8')

  const buffer2Base64 = (buffer: Buffer) => buffer.toString('base64')

  const fileFileContent = async (path: string) => {
    const file = findFile(path)
    return buffer2String(await file!.buffer())
  }

  const file2Base64 = async (path: string) => {
    const file = findFile(path)
    return buffer2Base64(await file!.buffer())
  }

  const getFile = async (path: string, options: {
    type: BufferEncoding
  } = { type: 'utf-8' }) => {
    return (await findFile(path)!.buffer()).toString(options.type)
  }

  const unzip = async (path: string) => {
    await zip.extract({ path })
  }

  return {
    unzip,
    findFile,
    getFile,
    fileFileContent,
    file2Base64,
  }
}
