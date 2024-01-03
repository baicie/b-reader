/* eslint-disable vue/one-component-per-file */
/* eslint-disable array-callback-return */
import { Fragment, computed, defineComponent, h } from 'vue'

const renderKey = ['div', 'svg', 'image', 'br', 'b', 'a', 'p', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'strong', 'em', 'i', 'u', 's', 'sub', 'sup', 'small', 'big', 'code', 'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'caption', 'colgroup', 'col', 'del', 'ins', 'mark', 'q', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'wbr', 'details', 'summary', 'figure', 'figcaption', 'picture', 'source', 'audio', 'video', 'track', 'iframe', 'embed', 'object', 'param', 'map', 'area', 'canvas', 'noscript', 'script', 'del', 'ins', 'mark', 'q', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'wbr', 'details', 'summary', 'figure', 'figcaption', 'picture', 'source', 'audio', 'video', 'track', 'iframe', 'embed', 'object', 'param', 'map', 'area', 'canvas', 'noscript', 'script']
export const RenderItem = defineComponent({
  name: 'RenderItem',
  props: {
    items: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const items = computed(() => Object.entries(props.items))
    const getArrtibute = (nodes) => {
      const attributes: Record<string, any> = {}
      const render = {}
      for (const key of Object.keys(nodes[0] ?? {})) {
        if (!renderKey.includes(key))
          attributes[key] = nodes[0][key]
        else render[key] = nodes[0][key]
      }

      return {
        attributes,
        render,
      }
    }

    return () => (
      <Fragment>
        {items.value.map(([key, value]) => {
          const { attributes } = getArrtibute(value)

          if (Object.keys(attributes).includes('_') && Array.isArray(value)) {
            return (
              <Fragment>
                {
                  value.map((item) => {
                    const { _, ...arts } = item
                    return <key {...arts}>
                      {item._}
                     </key>
                  })
                }
              </Fragment>
            )
          }
          else if (renderKey.includes(key) && Array.isArray(value)) {
            return <key {...attributes}>
              {value.map(item => (
                <RenderItem items={item} />
              ))}
            </key>
          }
          else {
            // console.log('attributes1', key, attributes)

            // return <key {...attributes} />
          }
        })}
      </Fragment>
    )
  },
})

export const RenderItem2 = defineComponent({
  name: 'RenderItem2',
  props: {
    items: {
      type: Object,
      required: true,
    },
    rootId: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const items = computed(() => props.items)
    const id = computed(() => props.rootId)
    return () => (
      <Fragment>
        {
          items.value?.map((element) => {
            const { '#name': tagName, $$: children, ...attributes } = element

            if (Object.keys(attributes).includes('_')) {
              const { _, ...arts } = attributes
              return <tagName {...arts}>
                {_}
              </tagName>
            }
            else {
              const childElements = children
                ? <RenderItem2 items={children}></RenderItem2>
                : null
              return h(tagName, { ...attributes, id: id.value }, childElements as any)
            }
          })
        }
      </Fragment>
    )
  },
})
