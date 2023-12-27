export function decoder<T>(res: Uint8Array, parse = true) {
  const de = new TextDecoder()
  const json = de.decode(res)
  return (parse ? JSON.parse(json) : json) as T
}
