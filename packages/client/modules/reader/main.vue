<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue'
import { Layout, LayoutContent, LayoutSider, Tree, message } from 'ant-design-vue'
import type { DataNode, EventDataNode } from 'ant-design-vue/es/tree'
import { onBeforeMount, watchEffect } from 'vue'
import { locale, theme } from '../../src/theme'
import RenderItem from './render-item.vue'
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

watchEffect(() => {
  if (epub.contents.length)
    message.destroy()
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <Layout>
      <LayoutSider>
        <template v-if="epub.nva.length">
          <Tree :tree-data="epub.nva as unknown as DataNode[]" block-node default-expand-all selectable :field-names="filedName" @select="handleClickChapter" />
        </template>
      </LayoutSider>
      <LayoutContent>
        <template v-for="item in epub.contents" :key="item.id">
          <RenderItem :content="item.content" />
        </template>
      </LayoutContent>
    </Layout>
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
