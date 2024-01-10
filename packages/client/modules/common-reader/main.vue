<script lang='ts' setup>
import type { SearchOnlineResult } from '@b-reader/utils'
import { ConfigProvider, Layout, LayoutContent, LayoutSider, Tree } from 'ant-design-vue'
import type { DataNode, EventDataNode, TreeProps } from 'ant-design-vue/es/tree'
import { computed, onBeforeMount } from 'vue'
import { locale, theme } from '../../src/theme'
import { useCommonReader } from './use-reader'

const { initApp, state, sendMessage } = useCommonReader()

const filedName: TreeProps['fieldNames'] = {
  children: 'children',
  title: 'name',
  key: 'path',
}

const _content = computed(() => {
  return Object.entries(state.contents).map(([, value]) => ({
    id: value.path,
    content: value.content,
    title: value.title,
  }))
})

const item = computed(() => {
  return _content.value.find(item => item.id === state.currentPath) || {
    id: '',
    content: '',
    title: '',
  }
})

const height = computed(() => window.innerHeight)

function handleClickChapter(selectedKeys: string[], e: { node: EventDataNode }) {
  if (selectedKeys.length) {
    // eslint-disable-next-line no-console
    console.log(selectedKeys, e)
    const name = selectedKeys[0].split('#').length > 1 ? selectedKeys[0].split('#')[1] : selectedKeys[0]
    state.currentPath = name
    const targetElement = document.getElementById(name)
    const target = _content.value.find(item => item.id === name)
    // 使用 scrollIntoView 方法滚动到目标元素
    if (targetElement && target?.content) {
      targetElement.scrollIntoView({
        behavior: 'smooth', // 可选，滚动行为，可以是 'auto', 'smooth', 'instant'
      })
    }
    else {
      const item = state.navs.find(item => item.path === name)
      getContent(item, true)
    }
  }
}

// function onScrollend() {
//   const lastItem = _content.value[_content.value.length - 1]
//   const nextIndex = state.navs.findIndex(item => item.path === lastItem.id)
//   const next = state.navs[nextIndex + 1]
//   if (next) {
//     sendMessage({
//       path: 'reader:common:content:req',
//       data: {
//         md5: state.init.md5!,
//         path: next.path,
//         scroll: false,
//         title: next.name,
//       },
//     })
//   }
// }

// const onListUpdate = useThrottleFn((startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => {
//   if (visibleEndIndex > visibleStartIndex) {
//     const item = state.navs[visibleStartIndex + 1]
//     getContent(item)
//   }
// }, 1000)

function getContent(item?: SearchOnlineResult, scroll = false) {
  // eslint-disable-next-line no-console
  console.log('getContent', item)
  if (item) {
    sendMessage({
      path: 'reader:common:content:req',
      data: {
        md5: state.init.md5!,
        path: item.path,
        scroll,
        title: item.name,
      },
    })
  }
}

onBeforeMount(() => {
  initApp()
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <Layout>
      <LayoutSider :width="250" :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }">
        <template v-if="state.navs.length">
          <Tree
            :tree-data="state.navs as unknown as DataNode[]"
            block-node
            default-expand-all
            selectable
            :field-names="filedName"
            :height="height"
            @select="handleClickChapter"
          />
        </template>
      </LayoutSider>
      <LayoutContent :style="{ marginLeft: '250px', padding: '24px' }">
        <h1 :id="item.id">
          {{ item.title }}
        </h1>
        <div v-html="item.content" />
      </LayoutContent>
    </Layout>
  </ConfigProvider>
</template>

<style lang='scss' scoped>
.scroller {
  height: 100%;
}
</style>
