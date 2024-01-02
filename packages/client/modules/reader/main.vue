<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue'
import { ConfigProvider, Layout, LayoutContent, LayoutSider, Tree, message } from 'ant-design-vue'
import type { DataNode, EventDataNode } from 'ant-design-vue/es/tree'
import { get } from 'lodash'
import { onBeforeMount, watchEffect } from 'vue'
import { locale, theme } from '../../src/theme'
import { RenderItem2 } from './render-item'
import { useEpubRender } from './use-render'

const { initReader, epub } = useEpubRender()

const filedName: TreeProps['fieldNames'] = {
  children: 'children',
  title: 'label',
  key: 'content',
}

function handleClickChapter(selectedKeys: string[], e: { node: EventDataNode }) {
  if (selectedKeys.length) {
    // eslint-disable-next-line no-console
    console.log(selectedKeys, e)
    const id = selectedKeys[0].split('#').length > 1 ? selectedKeys[0].split('#')[1] : selectedKeys[0]
    scrollToElement(id)
  }
}

function scrollToElement(name: string) {
  // 获取目标元素的引用
  const targetElement = document.getElementById(name)
  // 使用 scrollIntoView 方法滚动到目标元素
  targetElement && targetElement.scrollIntoView({
    behavior: 'smooth', // 可选，滚动行为，可以是 'auto', 'smooth', 'instant'
  })
}

onBeforeMount(() => {
  initReader()
})

function getBodyItem(item: any) {
  return get(item, 'content.html.$$[1].$$', [])
}

watchEffect(() => {
  if (epub.contents.length)
    message.destroy()
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme">
    <Layout>
      <LayoutSider :width="250" :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }">
        <template v-if="epub.nva.length">
          <Tree :tree-data="epub.nva as unknown as DataNode[]" block-node default-expand-all selectable :field-names="filedName" @select="handleClickChapter" />
        </template>
      </LayoutSider>
      <LayoutContent :style="{ marginLeft: '250px', padding: '24px' }">
        <template v-for="item in epub.contents" :key="item.id">
          <RenderItem2 :items="getBodyItem(item)" :root-id="item.id" />
        </template>
      </LayoutContent>
    </Layout>
  </ConfigProvider>
</template>

<style scoped>

</style>
