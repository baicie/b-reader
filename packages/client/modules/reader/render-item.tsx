import type { PropType, VNodeChild } from 'vue'
import { Fragment, defineComponent, h } from 'vue'

interface EpubNode {
  '#name'?: string
  '$$'?: EpubNode[]
  '_'?: string
  id?: string
  [key: string]: unknown
}

const allowedTags = new Set([
  'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'body', 'br', 'caption',
  'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt',
  'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head',
  'header', 'hr', 'html', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'mark',
  'ol', 'p', 'pre', 'q', 'section', 'small', 'source', 'span', 'strong',
  'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'time', 'tr', 'u', 'ul', 'video', 'audio', 'svg', 'path', 'g', 'line',
  'polyline', 'polygon', 'rect', 'circle', 'ellipse', 'text', 'image',
])

const allowedAttributes = new Set([
  'alt', 'aria-label', 'aria-hidden', 'class', 'colspan', 'dir', 'height', 'href',
  'id', 'lang', 'loading', 'name', 'poster', 'role', 'rowspan', 'src', 'srcset',
  'start', 'style', 'summary', 'target', 'title', 'type', 'viewbox', 'width',
  'xmlns', 'xmlns:xlink', 'x', 'x1', 'x2', 'xlink:href', 'y', 'y1', 'y2',
  'fill', 'stroke', 'd', 'points', 'transform',
])

const dangerousUrl = /^\s*(?:javascript|vbscript):/i

function safeAttributeName(name: string) {
  return allowedAttributes.has(name) || name.startsWith('data-') || name.startsWith('aria-')
}

function safeAttributes(node: EpubNode, rootId?: string) {
  const output: Record<string, string> = {}
  for (const [name, rawValue] of Object.entries(node)) {
    if (name === '#name' || name === '$$' || name === '_' || name === '$' || name === 'id')
      continue
    if (!safeAttributeName(name) || /^on/i.test(name) || rawValue == null)
      continue
    const value = String(rawValue)
    if (dangerousUrl.test(value) || (name === 'style' && dangerousUrl.test(value)))
      continue
    output[name] = value
  }
  if (node.id || rootId)
    output.id = node.id || rootId!
  return output
}

function renderNodes(nodes: EpubNode[], rootId?: string): VNodeChild[] {
  return nodes.flatMap((element) => {
    const tagName = typeof element['#name'] === 'string' ? element['#name'].split(':').pop()!.toLowerCase() : undefined
    const children = element.$$ ?? []
    const text = typeof element._ === 'string' ? element._ : undefined
    if (!tagName) {
      return text ? [text] : renderNodes(children)
    }
    if (!allowedTags.has(tagName))
      return [...(text ? [text] : []), ...renderNodes(children)]

    const renderedChildren: VNodeChild[] = []
    if (text)
      renderedChildren.push(text)
    renderedChildren.push(...renderNodes(children))
    return [h(tagName, safeAttributes(element, rootId), renderedChildren.length ? renderedChildren : undefined)]
  })
}

export const RenderItem2 = defineComponent({
  name: 'RenderItem2',
  props: {
    items: {
      type: Array as PropType<EpubNode[]>,
      required: true,
    },
    rootId: {
      type: String,
      required: false,
    },
  },
  setup: props => () => h(Fragment, null, renderNodes(props.items, props.rootId)),
})
