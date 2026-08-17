import type { PropType, VNodeChild } from 'vue'
import { Fragment, defineComponent, h } from 'vue'

interface EpubNode {
  '#name'?: string
  '$$'?: EpubNode[]
  '_'?: string
  'id'?: string
  [key: string]: unknown
}

function renderNodes(nodes: EpubNode[], rootId?: string): VNodeChild[] {
  return nodes.map((element) => {
    const { '#name': tagName, '$$': children, 'id': childId, ...attributes } = element
    if (!tagName)
      return null

    if ('_' in attributes) {
      const { _, ...elementAttributes } = attributes
      return h(tagName, elementAttributes, String(_ ?? ''))
    }

    return h(
      tagName,
      { ...attributes, id: childId || rootId },
      children ? renderNodes(children) : undefined,
    )
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
