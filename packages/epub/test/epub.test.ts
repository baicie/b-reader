import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { describe, it } from 'node:test'
import { Epub, EpubError, resolveArchivePath } from '../src/index'

interface ZipEntry {
  name: string
  data: string | Uint8Array
}

function crc32(input: Uint8Array) {
  let crc = 0xFFFFFFFF
  for (const byte of input) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function u16(value: number) {
  const output = Buffer.allocUnsafe(2)
  output.writeUInt16LE(value)
  return output
}

function u32(value: number) {
  const output = Buffer.allocUnsafe(4)
  output.writeUInt32LE(value)
  return output
}

function zip(entries: ZipEntry[]) {
  const local: Buffer[] = []
  const central: Buffer[] = []
  let offset = 0
  for (const entry of entries) {
    const name = Buffer.from(entry.name)
    const data = Buffer.from(entry.data)
    const compressed = deflateRawSync(data)
    const checksum = crc32(data)
    const header = Buffer.concat([
      u32(0x04034B50), u16(20), u16(0), u16(8), u16(0), u16(0), u32(checksum),
      u32(compressed.length), u32(data.length), u16(name.length), u16(0), name, compressed,
    ])
    local.push(header)
    central.push(Buffer.concat([
      u32(0x02014B50), u16(20), u16(20), u16(0), u16(8), u16(0), u16(0), u32(checksum),
      u32(compressed.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0),
      u16(0), u32(0), u32(offset), name,
    ]))
    offset += header.length
  }
  const centralData = Buffer.concat(central)
  return Buffer.concat([
    ...local,
    centralData,
    u32(0x06054B50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralData.length), u32(offset), u16(0),
  ])
}

async function withEpub(entries: ZipEntry[], callback: (filePath: string) => Promise<void>) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'b-reader-epub-'))
  const filePath = path.join(directory, 'fixture.epub')
  await writeFile(filePath, zip(entries))
  try {
    await callback(filePath)
  }
  finally {
    await rm(directory, { recursive: true, force: true })
  }
}

const container = (packagePath: string) => `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="${packagePath}" media-type="application/oebps-package+xml"/></rootfiles>
</container>`

const xhtml = (title: string, body: string) => `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body>${body}</body></html>`

describe('EPUB 3 parsing', () => {
  it('parses nav, metadata, spine, resources, and cover-image with canonical keys', async () => {
    await withEpub([
      { name: 'mimetype', data: 'application/epub+zip' },
      { name: 'META-INF/container.xml', data: container('OPS/package.opf') },
      { name: 'OPS/package.opf', data: `<?xml version="1.0"?>
        <package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title id="title">A Test Book</dc:title><meta refines="#title" property="title-type">main</meta>
            <dc:creator id="author">Alice</dc:creator><meta refines="#author" property="role">aut</meta>
            <dc:language>en</dc:language><dc:identifier id="uid">urn:test:book</dc:identifier>
            <meta property="dcterms:modified">2026-08-19T00:00:00Z</meta>
          </metadata>
          <manifest>
            <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
            <item id="cover" href="images/cover.png" media-type="image/png" properties="cover-image"/>
            <item id="one" href="text/chapter%201.xhtml" media-type="application/xhtml+xml"/>
            <item id="two" href="text/chapter2.xhtml" media-type="application/xhtml+xml"/>
            <item id="encoded" href="text/encoded%20entry.xhtml" media-type="application/xhtml+xml"/>
          </manifest>
          <spine><itemref idref="one"/><itemref idref="two" linear="no"/><itemref idref="encoded" linear="no"/></spine>
        </package>` },
      { name: 'OPS/nav.xhtml', data: xhtml('Navigation', `<nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops"><ol>
        <li><a href="text/chapter%201.xhtml#intro">Intro</a><ol><li><a href="text/chapter2.xhtml">Second</a></li></ol></li>
        <li><span>Group only</span><ol><li><a href="text/chapter2.xhtml#part">Part</a></li></ol></li>
      </ol></nav>`) },
      { name: 'OPS/images/cover.png', data: new Uint8Array([137, 80, 78, 71]) },
      { name: 'OPS/text/chapter 1.xhtml', data: xhtml('Intro', `<h1 id="intro">Hello</h1><p>World <b>!</b></p>
        <img src="../images/cover.png" srcset="../images/cover.png 1x" onload="bad()"/>
        <a href="javascript:bad()">unsafe</a><script>bad()</script>`) },
      { name: 'OPS/text/chapter2.xhtml', data: xhtml('Second', '<h1 id="part">Second</h1>') },
      { name: 'OPS/text/encoded%20entry.xhtml', data: xhtml('Encoded', '<p>Encoded ZIP entry</p>') },
    ], async (filePath) => {
      const epub = new Epub(filePath)
      const publication = await epub.parse()
      assert.equal(publication.version, '3.0')
      assert.equal(publication.metadata.title, 'A Test Book')
      assert.equal(publication.metadata.identifier, 'urn:test:book')
      assert.equal(publication.metadata.creators[0].role, 'aut')
      assert.equal(publication.manifest.find(item => item.id === 'one')?.path, 'OPS/text/chapter 1.xhtml')
      assert.equal(publication.spine[1].linear, false)
      assert.equal(publication.navigation[0].content, 'text/chapter 1.xhtml#intro')
      assert.equal(publication.navigation[0].children?.[0].content, 'text/chapter2.xhtml')
      assert.equal(publication.navigation[1].content, 'text/chapter2.xhtml#part')
      const chapter = (await epub.getContent('text/chapter 1.xhtml#intro'))[0]
      assert.equal(chapter.id, 'text/chapter 1.xhtml')
      const serialized = JSON.stringify(chapter.content)
      assert.match(serialized, /data:image\/png;base64,/)
      assert.doesNotMatch(serialized, /onload|javascript:|<script>|"#name":"script"/)
      assert.equal((await epub.getContent('text/encoded entry.xhtml'))[0].id, 'text/encoded entry.xhtml')
      assert.match(await epub.getCover() as string, /^data:image\/png;base64,/)
      const firstCount = epub.content.length
      await epub.parse()
      assert.equal(epub.content.length, firstCount)
    })
  })
})

describe('EPUB 2 parsing and fallback behavior', () => {
  it('uses NCX when nav is absent and resolves guide XHTML covers', async () => {
    await withEpub([
      { name: 'META-INF/container.xml', data: container('OEBPS/content.opf') },
      { name: 'OEBPS/content.opf', data: `<?xml version="1.0"?>
        <package xmlns="http://www.idpf.org/2007/opf" version="2.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Legacy</dc:title><dc:creator>Bob</dc:creator><meta name="cover" content="cover-image"/></metadata>
        <manifest><item id="ncx" href="toc/toc.ncx" media-type="application/x-dtbncx+xml"/><item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml"/><item id="cover-image" href="img/cover.jpg" media-type="image/jpeg"/><item id="chapter" href="text/one.xhtml" media-type="application/xhtml+xml"/></manifest>
        <spine toc="ncx"><itemref idref="chapter"/></spine><guide><reference type="cover" href="cover.xhtml"/></guide></package>` },
      { name: 'OEBPS/toc/toc.ncx', data: `<?xml version="1.0"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/"><navMap><navPoint id="p1"><navLabel><text>One</text></navLabel><content src="../text/one.xhtml#top"/></navPoint></navMap></ncx>` },
      { name: 'OEBPS/cover.xhtml', data: xhtml('Cover', '<div><img src="img/cover.jpg"/></div>') },
      { name: 'OEBPS/img/cover.jpg', data: new Uint8Array([255, 216, 255]) },
      { name: 'OEBPS/text/one.xhtml', data: xhtml('One', '<h1 id="top">One</h1>') },
    ], async (filePath) => {
      const epub = new Epub(filePath)
      const publication = await epub.parse()
      assert.equal(publication.metadata.title, 'Legacy')
      assert.equal(publication.navigation[0].content, 'text/one.xhtml#top')
      assert.match(await epub.getCover() as string, /^data:image\/jpeg;base64,/)
    })
  })

  it('falls back to linear spine when both navigation formats are absent', async () => {
    await withEpub([
      { name: 'META-INF/container.xml', data: container('package.opf') },
      { name: 'package.opf', data: `<package version="2.0"><metadata><dc:title xmlns:dc="x">No TOC</dc:title></metadata><manifest><item id="a" href="a.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="a"/></spine></package>` },
      { name: 'a.xhtml', data: xhtml('A', '<p>A</p>') },
    ], async (filePath) => {
      const epub = new Epub(filePath)
      const publication = await epub.parse()
      assert.equal(publication.navigation.length, 1)
      assert.equal(publication.navigation[0].content, 'a.xhtml')
      assert.ok(publication.warnings.some(item => item.code === 'MISSING_TOC'))
    })
  })
})

describe('EPUB paths and errors', () => {
  it('normalizes safe references and rejects archive escape', () => {
    assert.equal(resolveArchivePath('OPS/text/chapter.xhtml', '../img/cover%20a.png?x=1#top'), 'OPS/img/cover a.png')
    assert.equal(resolveArchivePath('OPS/nav.xhtml', 'https://example.com/book.xhtml'), undefined)
    assert.throws(() => resolveArchivePath('OPS/nav.xhtml', '../../outside.xhtml'), (error: unknown) => {
      return error instanceof EpubError && error.code === 'INVALID_PATH'
    })
    assert.throws(() => resolveArchivePath('OPS/nav.xhtml', 'text%2Foutside.xhtml'), (error: unknown) => {
      return error instanceof EpubError && error.code === 'INVALID_PATH'
    })
    assert.throws(() => resolveArchivePath('OPS/nav.xhtml', 'broken%.xhtml'), (error: unknown) => {
      return error instanceof EpubError && error.code === 'INVALID_PATH'
    })
    assert.throws(() => resolveArchivePath('OPS/nav.xhtml', 'C:/outside.xhtml'), (error: unknown) => {
      return error instanceof EpubError && error.code === 'INVALID_PATH'
    })
  })

  it('rejects unsafe ZIP entries before extraction', async () => {
    await withEpub([
      { name: 'META-INF/container.xml', data: container('package.opf') },
      { name: 'package.opf', data: `<package><metadata><title>Safe read</title></metadata><manifest><item id="a" href="a.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="a"/></spine></package>` },
      { name: 'a.xhtml', data: xhtml('A', '<p>A</p>') },
      { name: '../outside.txt', data: 'must not be extracted' },
    ], async (filePath) => {
      const epub = new Epub(filePath)
      await epub.parse()
      await assert.rejects(epub.unzip(path.join(path.dirname(filePath), 'out')), (error: unknown) => {
        return error instanceof EpubError && error.code === 'INVALID_PATH'
      })
    })
  })

  it('reports malformed container as a typed fatal error', async () => {
    await withEpub([{ name: 'META-INF/container.xml', data: '<container><broken>' }], async (filePath) => {
      await assert.rejects(new Epub(filePath).parse(), (error: unknown) => {
        return error instanceof EpubError && error.code === 'INVALID_XML'
      })
    })
  })

  it('rejects resource access before parse', async () => {
    const epub = new Epub('not-opened.epub')
    await assert.rejects(epub.getContent('chapter.xhtml'), (error: unknown) => {
      return error instanceof EpubError && error.code === 'NOT_PARSED'
    })
  })
})
