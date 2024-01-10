<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue'
import { ConfigProvider, Layout, LayoutContent, LayoutSider, Tree, message } from 'ant-design-vue'
import type { DataNode, EventDataNode } from 'ant-design-vue/es/tree'
import { get } from 'lodash'
import { computed, onBeforeMount, watchEffect } from 'vue'
import { locale, theme } from '../../src/theme'
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

function handleClickChapter(selectedKeys: string[]) {
  if (selectedKeys.length)
    getContent(selectedKeys[0])
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
    <Layout>
      <LayoutSider :width="250" :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }">
        <template v-if="state.nva.length">
          <Tree :tree-data="state.nva as any" block-node default-expand-all selectable :field-names="filedName" @select="handleClickChapter" />
        </template>
      </LayoutSider>
      <LayoutContent :style="{ marginLeft: '250px', padding: '24px' }">
        <RenderItem2 :items="getBodyItem(item)" :root-id="item.id" />
      </LayoutContent>
    </Layout>
  </ConfigProvider>
</template>
