import unzipper from 'unzipper'

export async function useUnzip(bookPath: string) {
  const zip = await unzipper.Open.file(bookPath)

  const findFile = (path: string) => zip.files.find(file => file.path.includes(path))

  // eslint-disable-next-line n/prefer-global/buffer
  const buffer2String = (buffer: Buffer) => buffer.toString('utf-8')

  const fileFileContent = async (path: string) => {
    const file = findFile(path)
    return buffer2String(await file!.buffer())
  }

  return {
    findFile,
    buffer2String,
    fileFileContent,
  }
}
