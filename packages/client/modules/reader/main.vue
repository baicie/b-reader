<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue'
import { ConfigProvider, Layout, LayoutContent, LayoutSider, Tree } from 'ant-design-vue'
import { get } from 'lodash'
import { computed, onBeforeMount } from 'vue'
import { locale, theme } from '../../src/theme'
import ReaderContainer from '../../src/components/reader/reader-container.vue'
import { RenderItem2 } from './render-item'
import { useEpubRender } from './use-render'

const { initReader, state, getContent } = useEpubRender()

const filedName: TreeProps['fieldNames'] = {
  children: 'children',
  title: 'label',
  key: 'content',
}

const _content = computed(() => {
  return Object.entries(state.contents).map(([, value]) => ({
    id: value.id,
    content: value.content,
  }))
})

const item = computed(() => {
  return _content.value.find(item => item.id === state.currentPath) || {
    id: '',
    content: '',
  }
})

const height = computed(() => window.innerHeight)

const navs = computed<any>(() => state.navs)

function handleClickChapter(selectedKeys: string[]) {
  if (selectedKeys.length)
    getContent(selectedKeys[0])
}

function handleNext() {
  const index = navs.value.findIndex(item => item.content === state.currentPath)
  if (index === navs.value.length - 1)
    return
  handleClickChapter([navs.value[index + 1].content])
}

function handlePre() {
  const index = navs.value.findIndex(item => item.content === state.currentPath)
  if (index === 0)
    return
  handleClickChapter([navs.value[index - 1].content])
}

onBeforeMount(() => {
  initReader()
})

function getBodyItem(item: any) {
  return get(item, 'content.html.$$[1].$$', [])
}
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme">
    <ReaderContainer @next="handleNext" @pre="handlePre">
      <template #menus>
        <template v-if="navs?.length">
          <Tree :tree-data="navs" block-node default-expand-all selectable :field-names="filedName" :height="height"
            @select="handleClickChapter" />
        </template>
      </template>

      <template #default>
        <RenderItem2 :items="getBodyItem(item)" :root-id="item.id" />
      </template>
    </ReaderContainer>
  </ConfigProvider>
</template>
