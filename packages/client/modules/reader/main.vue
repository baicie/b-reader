<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue'
import { Layout, LayoutContent, LayoutSider, Tree, message } from 'ant-design-vue'
import type { DataNode, EventDataNode } from 'ant-design-vue/es/tree'
import { onBeforeMount, watchEffect } from 'vue'
import { get } from 'lodash'
import { locale, theme } from '../../src/theme'
import { RenderItem, RenderItem2 } from './render-item'
import { useEpubRender } from './use-render'

const { initReader, epub } = useEpubRender()

const filedName: TreeProps['fieldNames'] = {
  children: 'children',
  title: 'label',
  key: 'content',
}

function handleClickChapter(selectedKeys: string[], e: { node: EventDataNode }) {
  if (selectedKeys.length) {
    const id = selectedKeys[0].split('#')[1]
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
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <Layout>
      <LayoutSider :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }">
        <template v-if="epub.nva.length">
          <Tree :tree-data="epub.nva as unknown as DataNode[]" block-node default-expand-all selectable :field-names="filedName" @select="handleClickChapter" />
        </template>
      </LayoutSider>
      <LayoutContent :style="{ margin: '24px 16px 0', overflow: 'initial' }">
        <div :style="{ padding: '24px', background: '#fff', textAlign: 'center' }">
          <template v-for="item in epub.contents" :key="item.id">
            <RenderItem2 :items="getBodyItem(item)" />
          </template>
        </div>
      </LayoutContent>
    </Layout>
  </ConfigProvider>
</template>

<style scoped>
#components-layout-demo-fixed-sider .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>
