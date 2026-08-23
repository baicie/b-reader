import path from 'node:path'
import mime from 'mime-types'
import type { ParserOptions } from 'xml2js'
import { EpubError } from './errors'
import { useParseXml } from './parse-xml'
import type {
  EpubContent,
  EpubMeta,
  EpubPublication,
  EpubText,
  EpubWarning,
  Guide,
  Manifest,
  MetaData,
  Nav,
  RootFile,
  Spine,
  Toc,
  TocMeta,
} from './types'
import { useUnzip } from './unzip'
import {
  attribute,
  children,
  expandedData,
  findDescendant,
  findDescendants,
  firstChild,
  firstNavigationContent,
  isRecord,
  localName,
  relativeToPackage,
  resolveArchivePath,
  resolveId,
  splitHref,
  textContent,
} from './utils'

export { EpubError } from './errors'
export type { EpubErrorCode } from './errors'
export type {
  EpubContent,
  EpubPublication,
  EpubText,
  EpubWarning,
  EpubWarningCode,
  Guide,
  Manifest,
  MetaData,
  Nav,
  Spine,
  TocMeta,
} from './types'
export { resolveArchivePath, resolveId } from './utils'

const PACKAGE_MEDIA_TYPE = 'application/oebps-package+xml'
const NCX_MEDIA_TYPE = 'application/x-dtbncx+xml'
const XHTML_MEDIA_TYPES = new Set(['application/xhtml+xml', 'text/html', 'application/xml', 'text/xml'])
const dangerousElements = new Set(['script', 'iframe', 'frame', 'frameset', 'object', 'embed'])
const dangerousUrl = /^\s*(?:javascript|vbscript):/i

interface ParsedPackage {
  version: string
  packagePath: string
  metadata: MetaData
  metadataMeta: EpubMeta[]
  manifest: Manifest[]
  spine: Spine[]
  guide: Guide[]
  tocId: string
}

interface CoverResource {
  path: string
  mediaType: string
  manifest?: Manifest
}

function tokens(value?: string) {
  return value?.trim().split(/\s+/).filter(Boolean) ?? []
}

function firstValue(node: unknown, name: string) {
  return children(node, name).map(textContent).find(Boolean)
}

function xmlRoot(document: unknown, name: string) {
  return findDescendant(document, childName => childName === name)
}

function makeText(node: unknown): EpubText {
  return {
    value: textContent(node),
    id: attribute(node, 'id'),
    language: attribute(node, 'lang'),
    direction: attribute(node, 'dir') as EpubText['direction'],
    role: attribute(node, 'role'),
    fileAs: attribute(node, 'file-as'),
  }
}

function compactText(value: EpubText) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as unknown as EpubText
}

function warning(code: EpubWarning['code'], message: string, resourcePath?: string): EpubWarning {
  return { code, message, path: resourcePath }
}

export class Epub {
  public readonly bookPath: string

  public metadata?: MetaData
  public manifest?: Manifest[]
  public spine?: Spine[]
  public guide?: Guide[]
  public content: EpubContent[] = []
  public cover?: string
  public warnings: EpubWarning[] = []
  public publication?: EpubPublication

  /** @deprecated Use `navigation` or `getNavigation()`. */
  public nva: Nav[] = []
  public navigation: Nav[] = []

  private fullPath = ''
  private toc: TocMeta = { id: '', href: '', navigation: [] }
  private usezip?: Awaited<ReturnType<typeof useUnzip>>
  private readonly usexml = useParseXml()
  private coverResource?: CoverResource

  constructor(bookPath: string) {
    this.bookPath = bookPath
  }

  async parse(): Promise<EpubPublication> {
    const archive = await useUnzip(this.bookPath)
    const localWarnings: EpubWarning[] = []
    const rootFile = await this.parseContainer(archive)
    const parsedPackage = await this.parsePackage(archive, rootFile, localWarnings)
    const { navigation, toc } = await this.parseNavigation(archive, parsedPackage, localWarnings)
    const coverResource = await this.resolveCover(archive, parsedPackage, localWarnings)
    const contents = await this.parseContents(archive, parsedPackage, localWarnings)

    if (parsedPackage.spine.length > 0 && contents.length === 0) {
      throw new EpubError('EMPTY_SPINE', 'No readable documents were found in the EPUB spine', {
        phase: 'content',
        path: parsedPackage.packagePath,
      })
    }

    const publication: EpubPublication = {
      version: parsedPackage.version,
      packagePath: parsedPackage.packagePath,
      metadata: parsedPackage.metadata,
      manifest: parsedPackage.manifest,
      spine: parsedPackage.spine,
      navigation,
      cover: coverResource?.manifest,
      warnings: localWarnings,
    }

    // Commit only after every fatal parsing phase has succeeded.
    this.usezip = archive
    this.fullPath = parsedPackage.packagePath
    this.metadata = parsedPackage.metadata
    this.manifest = parsedPackage.manifest
    this.spine = parsedPackage.spine
    this.guide = parsedPackage.guide
    this.navigation = navigation
    this.nva = navigation
    this.toc = toc
    this.content = contents
    this.coverResource = coverResource
    this.cover = coverResource?.path
    this.warnings = localWarnings
    this.publication = publication

    return publication
  }

  getSpines() {
    return this.spine
  }

  getToc() {
    return this.toc
  }

  /** @deprecated Use `getNavigation()`. */
  getNva() {
    return this.navigation
  }

  getNavigation() {
    return this.navigation
  }

  async getCover(): Promise<string | undefined> {
    if (!this.coverResource)
      return undefined
    const archive = this.requireArchive()
    const buffer = await archive.getBuffer(this.coverResource.path)
    return `data:${this.coverResource.mediaType};base64,${buffer.toString('base64')}`
  }

  async getContent(id?: string): Promise<EpubContent[]> {
    this.requireArchive()
    if (!id)
      return this.content

    const contentId = this.resolveContentId(id)
    const found = this.content.find(item => item.id === contentId || item.manifestId === id)
    return found ? [found] : []
  }

  async getFile(filePath: string, type: BufferEncoding = 'utf-8') {
    return await this.requireArchive().getFile(filePath, { type })
  }

  async unzip(destination: string) {
    await this.requireArchive().unzip(destination)
  }

  private requireArchive() {
    if (!this.usezip)
      throw new EpubError('NOT_PARSED', 'Call parse() before reading EPUB resources', { phase: 'access' })
    return this.usezip
  }

  private resolveContentId(input: string) {
    const { pathname } = splitHref(input)
    const direct = this.content.find(item => item.id === pathname || item.href === pathname || item.path === pathname)
    if (direct)
      return direct.id

    const byManifest = this.manifest?.find(item => item.id === pathname || item.path === pathname)
    if (byManifest)
      return byManifest.href

    try {
      const archivePath = resolveArchivePath(this.fullPath, pathname)
      if (archivePath) {
        const matched = this.content.find(item => item.path === archivePath)
        if (matched)
          return matched.id
      }
    }
    catch {
      // Unknown user input is represented by an empty result for compatibility.
    }
    return pathname
  }

  private async parseContainer(archive: Awaited<ReturnType<typeof useUnzip>>): Promise<RootFile> {
    const containerPath = 'META-INF/container.xml'
    const source = await archive.fileFileContent(containerPath)
    const document = await this.usexml.parse(source, undefined, containerPath)
    const rootFiles = findDescendants(document, name => name === 'rootfile')
      .map(node => ({
        'full-path': attribute(node, 'full-path') ?? '',
        'media-type': attribute(node, 'media-type'),
      }))
      .filter(rootFile => rootFile['full-path'])

    const rootFile = rootFiles.find(item => item['media-type'] === PACKAGE_MEDIA_TYPE) ?? rootFiles[0]
    if (!rootFile) {
      throw new EpubError('INVALID_CONTAINER', 'EPUB container does not declare a package document', {
        phase: 'container',
        path: containerPath,
      })
    }

    const packagePath = resolveArchivePath('', rootFile['full-path'])
    if (!packagePath || !archive.hasFile(packagePath)) {
      throw new EpubError('INVALID_CONTAINER', `EPUB package document is missing: ${rootFile['full-path']}`, {
        phase: 'container',
        path: rootFile['full-path'],
      })
    }
    return { ...rootFile, 'full-path': packagePath }
  }

  private async parsePackage(
    archive: Awaited<ReturnType<typeof useUnzip>>,
    rootFile: RootFile,
    localWarnings: EpubWarning[],
  ): Promise<ParsedPackage> {
    const packagePath = rootFile['full-path']
    const source = await archive.fileFileContent(packagePath)
    const document = await this.usexml.parse(source, undefined, packagePath)
    const packageNode = xmlRoot(document, 'package')
    if (!packageNode) {
      throw new EpubError('INVALID_PACKAGE', 'EPUB package document has no package element', {
        phase: 'package',
        path: packagePath,
      })
    }

    const metadataNode = firstChild(packageNode, 'metadata')
    const manifestNode = firstChild(packageNode, 'manifest')
    const spineNode = firstChild(packageNode, 'spine')
    if (!manifestNode || !spineNode) {
      throw new EpubError('INVALID_PACKAGE', 'EPUB package document must contain manifest and spine elements', {
        phase: 'package',
        path: packagePath,
      })
    }

    const metadataMeta = children(metadataNode, 'meta').map((node): EpubMeta => ({
      property: attribute(node, 'property'),
      name: attribute(node, 'name'),
      content: attribute(node, 'content'),
      refines: attribute(node, 'refines'),
      scheme: attribute(node, 'scheme'),
      value: textContent(node) || undefined,
    }))
    const metadata = this.parseMetadata(packageNode, metadataNode, metadataMeta, localWarnings)

    const seenIds = new Set<string>()
    const manifest: Manifest[] = []
    for (const node of children(manifestNode, 'item')) {
      const id = attribute(node, 'id') ?? ''
      const sourceHref = attribute(node, 'href') ?? ''
      const mediaType = attribute(node, 'media-type') ?? 'application/octet-stream'
      if (!id || !sourceHref) {
        throw new EpubError('INVALID_PACKAGE', 'Every manifest item must have id and href attributes', {
          phase: 'manifest',
          path: packagePath,
        })
      }
      if (seenIds.has(id)) {
        throw new EpubError('INVALID_PACKAGE', `Duplicate manifest id: ${id}`, {
          phase: 'manifest',
          path: packagePath,
        })
      }
      seenIds.add(id)
      const itemPath = resolveArchivePath(packagePath, sourceHref)
      if (!itemPath) {
        localWarnings.push(warning('MISSING_RESOURCE', `External manifest resource is not loaded: ${sourceHref}`, sourceHref))
        continue
      }
      manifest.push({
        id,
        href: relativeToPackage(packagePath, itemPath),
        sourceHref,
        path: itemPath,
        mediaType,
        'media-type': mediaType,
        properties: tokens(attribute(node, 'properties')),
        fallback: attribute(node, 'fallback'),
        'media-overlay': attribute(node, 'media-overlay'),
      })
    }

    const manifestById = new Map(manifest.map(item => [item.id, item]))
    const spine: Spine[] = children(spineNode, 'itemref').map((node, index) => {
      const idref = attribute(node, 'idref') ?? ''
      const item = manifestById.get(idref)
      if (!item) {
        localWarnings.push(warning('MISSING_SPINE_ITEM', `Spine references missing manifest item: ${idref}`, packagePath))
      }
      return {
        idref,
        index,
        linear: attribute(node, 'linear') !== 'no',
        properties: tokens(attribute(node, 'properties')),
        href: item?.href,
        path: item?.path,
        item,
      }
    })

    if (!spine.length) {
      throw new EpubError('INVALID_PACKAGE', 'EPUB package spine is empty', {
        phase: 'spine',
        path: packagePath,
      })
    }

    const guideNode = firstChild(packageNode, 'guide')
    const guide: Guide[] = children(guideNode, 'reference').flatMap((node) => {
      const href = attribute(node, 'href')
      const type = attribute(node, 'type')
      return href && type ? [{ href, type, title: attribute(node, 'title') }] : []
    })

    return {
      version: attribute(packageNode, 'version') ?? '2',
      packagePath,
      metadata,
      metadataMeta,
      manifest,
      spine,
      guide,
      tocId: attribute(spineNode, 'toc') ?? '',
    }
  }

  private parseMetadata(
    packageNode: unknown,
    metadataNode: unknown,
    meta: EpubMeta[],
    localWarnings: EpubWarning[],
  ): MetaData {
    const refinements = new Map<string, Map<string, string>>()
    for (const item of meta) {
      if (!item.refines || !item.property)
        continue
      const id = item.refines.replace(/^#/, '')
      const values = refinements.get(id) ?? new Map<string, string>()
      values.set(item.property, item.value ?? item.content ?? '')
      refinements.set(id, values)
    }

    const applyRefinements = (node: unknown) => {
      const value = makeText(node)
      const refined = value.id ? refinements.get(value.id) : undefined
      value.role ??= refined?.get('role')
      value.fileAs ??= refined?.get('file-as')
      return compactText(value)
    }

    const titles = children(metadataNode, 'title').map(applyRefinements).filter(item => item.value)
    const mainTitle = titles.find((item) => {
      const titleType = item.id ? refinements.get(item.id)?.get('title-type') : undefined
      return titleType === 'main'
    }) ?? titles[0]
    const creators = children(metadataNode, 'creator').map(applyRefinements).filter(item => item.value)
    const contributors = children(metadataNode, 'contributor').map(applyRefinements).filter(item => item.value)
    const languages = children(metadataNode, 'language').map(textContent).filter(Boolean)
    const uniqueIdentifier = attribute(packageNode, 'unique-identifier')
    const identifiers = children(metadataNode, 'identifier').map(node => ({
      value: textContent(node),
      id: attribute(node, 'id'),
      scheme: attribute(node, 'scheme'),
    })).filter(item => item.value)
    const primaryIdentifier = identifiers.find(item => uniqueIdentifier && item.id === uniqueIdentifier) ?? identifiers[0]
    const subjects = children(metadataNode, 'subject').map(textContent).filter(Boolean)
    const dates = children(metadataNode, 'date').map(textContent).filter(Boolean)

    if (!mainTitle?.value)
      localWarnings.push(warning('INVALID_CONTENT', 'EPUB metadata does not contain a title'))

    return {
      title: mainTitle?.value ?? path.basename(this.bookPath, path.extname(this.bookPath)),
      titles,
      creator: creators[0]?.value,
      creators,
      language: languages[0],
      languages,
      identifier: primaryIdentifier?.value,
      identifiers,
      publisher: firstValue(metadataNode, 'publisher'),
      description: firstValue(metadataNode, 'description'),
      date: dates[0],
      rights: firstValue(metadataNode, 'rights'),
      source: firstValue(metadataNode, 'source'),
      type: firstValue(metadataNode, 'type'),
      format: firstValue(metadataNode, 'format'),
      coverage: firstValue(metadataNode, 'coverage'),
      relation: firstValue(metadataNode, 'relation'),
      subjects,
      contributors,
      modified: meta.find(item => localName(item.property ?? '') === 'modified')?.value
        ?? meta.find(item => localName(item.property ?? '') === 'modified')?.content,
      meta,
    }
  }

  private async parseNavigation(
    archive: Awaited<ReturnType<typeof useUnzip>>,
    parsedPackage: ParsedPackage,
    localWarnings: EpubWarning[],
  ): Promise<{ navigation: Nav[], toc: TocMeta }> {
    const navItem = parsedPackage.manifest.find(item => item.properties.includes('nav'))
    if (navItem) {
      try {
        const navigation = await this.parseNavDocument(archive, parsedPackage.packagePath, navItem)
        if (navigation.length) {
          return {
            navigation,
            toc: { id: navItem.id, href: navItem.href, type: 'nav', navigation },
          }
        }
        localWarnings.push(warning('INVALID_TOC', `EPUB navigation document is empty: ${navItem.href}`, navItem.path))
      }
      catch (error) {
        localWarnings.push(warning('INVALID_TOC', `Unable to parse EPUB navigation document: ${String(error)}`, navItem.path))
      }
    }

    const ncxItem = parsedPackage.manifest.find(item => item.id === parsedPackage.tocId)
      ?? parsedPackage.manifest.find(item => item.mediaType === NCX_MEDIA_TYPE)
    if (ncxItem) {
      try {
        const { navigation, raw } = await this.parseNcxDocument(archive, parsedPackage.packagePath, ncxItem)
        if (navigation.length) {
          return {
            navigation,
            toc: { id: ncxItem.id, href: ncxItem.href, type: 'ncx', navigation, tocs: raw },
          }
        }
        localWarnings.push(warning('INVALID_TOC', `EPUB NCX document is empty: ${ncxItem.href}`, ncxItem.path))
      }
      catch (error) {
        localWarnings.push(warning('INVALID_TOC', `Unable to parse EPUB NCX document: ${String(error)}`, ncxItem.path))
      }
    }

    const navigation = parsedPackage.spine
      .filter(item => item.linear && item.item)
      .map((item, index): Nav => ({
        id: `spine-${index + 1}`,
        label: item.item?.id || `Chapter ${index + 1}`,
        href: item.item?.href,
        path: item.item?.path,
        content: item.item?.href ?? '',
        parentId: 'root',
      }))
    localWarnings.push(warning('MISSING_TOC', 'EPUB has no usable nav or NCX document; navigation was generated from the spine'))
    return { navigation, toc: { id: '', href: '', type: 'spine', navigation } }
  }

  private async parseNavDocument(
    archive: Awaited<ReturnType<typeof useUnzip>>,
    packagePath: string,
    navItem: Manifest,
  ) {
    const source = await archive.fileFileContent(navItem.path)
    const document = await this.usexml.parse(source, undefined, navItem.path)
    const navElements = findDescendants(document, name => name === 'nav')
    const tocNav = navElements.find((node) => {
      const typeTokens = tokens(attribute(node, 'type'))
      return typeTokens.includes('toc') || attribute(node, 'role') === 'doc-toc'
    }) ?? navElements[0]
    const list = firstChild(tocNav, 'ol')
    return this.parseNavigationList(list, navItem.path, packagePath, 'root')
  }

  private parseNavigationList(list: unknown, sourcePath: string, packagePath: string, parentId: string): Nav[] {
    return children(list, 'li').map((item, index) => {
      const link = firstChild(item, 'a')
      const labelNode = link ?? firstChild(item, 'span')
      const rawHref = link ? attribute(link, 'href') : undefined
      const id = attribute(item, 'id') ?? `${parentId}-${index + 1}`
      const nested = firstChild(item, 'ol')
      const childItems = this.parseNavigationList(nested, sourcePath, packagePath, id)
      const target = rawHref ? this.navigationTarget(sourcePath, packagePath, rawHref) : undefined
      const nav: Nav = {
        id,
        label: textContent(labelNode) || target?.content || `Chapter ${index + 1}`,
        href: rawHref,
        path: target?.path,
        fragment: target?.fragment,
        external: target?.external,
        content: target?.content ?? firstNavigationContent(childItems),
        parentId,
      }
      if (childItems.length)
        nav.children = childItems
      return nav
    })
  }

  private async parseNcxDocument(
    archive: Awaited<ReturnType<typeof useUnzip>>,
    packagePath: string,
    ncxItem: Manifest,
  ) {
    const source = await archive.fileFileContent(ncxItem.path)
    const document = await this.usexml.parse(source, undefined, ncxItem.path)
    const navMap = findDescendant(document, name => name === 'navMap')
    const parsePoints = (points: unknown[], parentId: string): Nav[] => points.map((point, index) => {
      const id = attribute(point, 'id') ?? `${parentId}-${index + 1}`
      const rawHref = attribute(firstChild(point, 'content'), 'src') ?? ''
      const target = rawHref ? this.navigationTarget(ncxItem.path, packagePath, rawHref) : undefined
      const nested = parsePoints(children(point, 'navPoint'), id)
      const nav: Nav = {
        id,
        label: textContent(firstChild(point, 'navLabel')) || target?.content || `Chapter ${index + 1}`,
        href: rawHref || undefined,
        path: target?.path,
        fragment: target?.fragment,
        external: target?.external,
        content: target?.content ?? firstNavigationContent(nested),
        parentId,
      }
      if (nested.length)
        nav.children = nested
      return nav
    })
    const navigation = parsePoints(children(navMap, 'navPoint'), 'root')
    return { navigation, raw: expandedData(xmlRoot(document, 'ncx')) as Toc }
  }

  private navigationTarget(sourcePath: string, packagePath: string, rawHref: string) {
    const resolvedWithFragment = resolveId(sourcePath, rawHref)
    if (/^[a-z][a-z\d+.-]*:/i.test(resolvedWithFragment) || resolvedWithFragment.startsWith('//')) {
      return { content: resolvedWithFragment, external: true }
    }
    const { pathname, fragment } = splitHref(resolvedWithFragment)
    return {
      content: relativeToPackage(packagePath, pathname, fragment),
      path: pathname,
      fragment,
      external: false,
    }
  }

  private async resolveCover(
    archive: Awaited<ReturnType<typeof useUnzip>>,
    parsedPackage: ParsedPackage,
    localWarnings: EpubWarning[],
  ): Promise<CoverResource | undefined> {
    const fromManifest = (item: Manifest | undefined) => {
      if (!item)
        return undefined
      if (!archive.hasFile(item.path)) {
        localWarnings.push(warning('INVALID_COVER', `Cover resource is missing: ${item.path}`, item.path))
        return undefined
      }
      return { path: item.path, mediaType: item.mediaType, manifest: item }
    }

    const direct = parsedPackage.manifest.find(item => item.properties.includes('cover-image'))
    const directResource = fromManifest(direct)
    if (directResource)
      return directResource

    const coverId = parsedPackage.metadataMeta.find(item => item.name?.toLowerCase() === 'cover')?.content
    const metadataCover = coverId ? parsedPackage.manifest.find(item => item.id === coverId) : undefined
    const metadataResource = fromManifest(metadataCover)
    if (metadataResource)
      return metadataResource

    const guideCover = parsedPackage.guide.find(item => tokens(item.type.toLowerCase()).includes('cover'))
    if (guideCover) {
      try {
        const coverPath = resolveArchivePath(parsedPackage.packagePath, guideCover.href)
        if (coverPath) {
          const directItem = parsedPackage.manifest.find(item => item.path === coverPath)
          if (directItem && directItem.mediaType.startsWith('image/'))
            return fromManifest(directItem)

          const source = await archive.fileFileContent(coverPath)
          const document = await this.usexml.parse(source, undefined, coverPath)
          const image = findDescendant(document, name => name === 'img' || name === 'image')
          const imageHref = attribute(image, 'src') ?? attribute(image, 'href') ?? attribute(image, 'xlink:href')
          const imagePath = imageHref ? resolveArchivePath(coverPath, imageHref) : undefined
          if (imagePath && archive.hasFile(imagePath)) {
            const item = parsedPackage.manifest.find(manifest => manifest.path === imagePath)
            return {
              path: imagePath,
              mediaType: item?.mediaType || mime.lookup(imagePath) || 'application/octet-stream',
              manifest: item,
            }
          }
        }
      }
      catch (error) {
        localWarnings.push(warning('INVALID_COVER', `Unable to resolve guide cover: ${String(error)}`, guideCover.href))
      }
    }

    const heuristic = parsedPackage.manifest.find(item => item.mediaType.startsWith('image/') && /cover/i.test(`${item.id} ${item.href}`))
    const heuristicResource = fromManifest(heuristic)
    if (heuristicResource)
      return heuristicResource
    return undefined
  }

  private async parseContents(
    archive: Awaited<ReturnType<typeof useUnzip>>,
    parsedPackage: ParsedPackage,
    localWarnings: EpubWarning[],
    options?: ParserOptions,
  ): Promise<EpubContent[]> {
    const contents: EpubContent[] = []
    for (const spine of parsedPackage.spine) {
      const item = spine.item
      if (!item)
        continue
      if (!XHTML_MEDIA_TYPES.has(item.mediaType))
        continue
      try {
        const source = await archive.fileFileContent(item.path)
        const document = await this.usexml.parse(source, {
          preserveChildrenOrder: true,
          explicitChildren: true,
          ...options,
        }, item.path)
        await this.prepareContentDocument(document, item.path, archive, parsedPackage.manifest, localWarnings)
        contents.push({
          id: item.href,
          manifestId: item.id,
          href: item.href,
          path: item.path,
          mediaType: item.mediaType,
          content: expandedData(document),
        })
      }
      catch (error) {
        localWarnings.push(warning('INVALID_CONTENT', `Unable to parse spine document ${item.href}: ${String(error)}`, item.path))
      }
    }
    return contents
  }

  private async prepareContentDocument(
    document: unknown,
    documentPath: string,
    archive: Awaited<ReturnType<typeof useUnzip>>,
    manifest: Manifest[],
    localWarnings: EpubWarning[],
  ) {
    const visited = new WeakSet<object>()
    const walk = async (node: unknown, elementName = ''): Promise<void> => {
      if (Array.isArray(node)) {
        for (const child of node)
          await walk(child, elementName)
        return
      }
      if (!isRecord(node) || visited.has(node))
        return
      visited.add(node)
      const currentElementName = typeof node['#name'] === 'string'
        ? localName(node['#name'])
        : elementName

      if (isRecord(node.$)) {
        const nodeAttributes = node.$
        for (const [name, rawValue] of Object.entries(nodeAttributes)) {
          const value = String(rawValue)
          if (/^on/i.test(name) || dangerousUrl.test(value)) {
            delete nodeAttributes[name]
            continue
          }
        }

        const resourceAttributes = currentElementName === 'img'
          ? ['src']
          : currentElementName === 'image'
            ? ['href', 'xlink:href']
            : ['source', 'audio', 'video', 'track', 'input'].includes(currentElementName)
                ? ['src', 'poster']
                : []
        for (const name of resourceAttributes) {
          if (typeof nodeAttributes[name] === 'string')
            nodeAttributes[name] = await this.inlineResource(nodeAttributes[name], documentPath, archive, manifest, localWarnings)
        }
        if (['img', 'source'].includes(currentElementName) && typeof nodeAttributes.srcset === 'string') {
          const candidates = nodeAttributes.srcset.split(',')
          const rewritten: string[] = []
          for (const candidate of candidates) {
            const [source, ...descriptor] = candidate.trim().split(/\s+/)
            if (!source)
              continue
            rewritten.push([await this.inlineResource(source, documentPath, archive, manifest, localWarnings), ...descriptor].join(' '))
          }
          nodeAttributes.srcset = rewritten.join(', ')
        }
      }

      if (Array.isArray(node.$$)) {
        node.$$ = node.$$.filter((child) => {
          if (!isRecord(child))
            return true
          const name = typeof child['#name'] === 'string' ? localName(child['#name']) : ''
          return !dangerousElements.has(name)
        })
      }

      for (const [key, value] of Object.entries(node)) {
        if (key === '$')
          continue
        const name = key === '$$' ? '' : localName(key)
        if (dangerousElements.has(name)) {
          delete node[key]
          continue
        }
        await walk(value, name || currentElementName)
      }
    }

    await walk(document)
  }

  private async inlineResource(
    reference: string,
    documentPath: string,
    archive: Awaited<ReturnType<typeof useUnzip>>,
    manifest: Manifest[],
    localWarnings: EpubWarning[],
  ) {
    if (!reference || reference.startsWith('#') || reference.startsWith('data:'))
      return reference
    let resourcePath: string | undefined
    try {
      resourcePath = resolveArchivePath(documentPath, reference)
    }
    catch (error) {
      localWarnings.push(warning('MISSING_RESOURCE', `Invalid content resource path ${reference}: ${String(error)}`, reference))
      return reference
    }
    if (!resourcePath)
      return reference
    if (!archive.hasFile(resourcePath)) {
      localWarnings.push(warning('MISSING_RESOURCE', `Missing content resource: ${resourcePath}`, resourcePath))
      return reference
    }

    const buffer = await archive.getBuffer(resourcePath)
    const manifestItem = manifest.find(item => item.path === resourcePath)
    const mediaType = manifestItem?.mediaType || mime.lookup(resourcePath) || 'application/octet-stream'
    return `data:${mediaType};base64,${buffer.toString('base64')}`
  }
}
