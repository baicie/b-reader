# `@b-reader/epub`

EPUB 2 and EPUB 3 parser used by the b-reader extension.

```ts
import { Epub } from '@b-reader/epub'

const epub = new Epub('/books/example.epub')
const publication = await epub.parse()

console.log(publication.metadata.title)
console.log(publication.navigation)

await epub.getContent(publication.navigation[0]?.content)
await epub.getCover() // `undefined` when no cover is declared
```

## Public model

`parse()` atomically builds and returns an `EpubPublication` containing the
normalized package path, metadata, manifest, spine, navigation, cover item, and
recoverable `warnings`. The parser supports EPUB 2 NCX, EPUB 3 `nav.xhtml`,
spine-generated navigation, EPUB 3 `cover-image`, EPUB 2 metadata/guide covers,
URI fragments and percent-encoded archive paths.

Manifest and spine entries retain their original-compatible fields while also
exposing normalized `path`, `mediaType`, `index`, `linear`, and `item` values.
`Nav.content` is a package-relative path with an optional `#fragment`. The path
without the fragment is the same key returned as `EpubContent.id`.

```ts
interface EpubContent {
  id: string
  manifestId: string
  href: string
  path: string
  mediaType: string
  content: unknown // ordered xml2js AST for the current reader renderer
}

const _chapterKey = (chapter: EpubContent) => chapter.id
```

`getContent()` accepts a navigation target, manifest id, package-relative href,
or normalized archive path. Calling it before `parse()` throws `EpubError` with
code `NOT_PARSED`. Missing optional resources are reported in `warnings`; fatal
archive, container, package, path, and XML failures use the typed `EpubError`.

The legacy `nva` field and `getNva()` method remain as aliases for
`navigation` while the extension message protocol is migrated.

## Security and archive handling

Archive paths use POSIX semantics and reject encoded separators, NUL bytes,
absolute paths, drive paths, and traversal outside the ZIP root. Resource URLs
are resolved relative to the XHTML or SVG document that references them.
Dangerous document elements, event attributes, and `javascript:`/`vbscript:`
URLs are removed before the ordered AST is exposed to the reader.

## Development

```sh
pnpm --filter @b-reader/epub test
pnpm --filter @b-reader/epub typecheck
pnpm --filter @b-reader/epub build
```
