<script lang='ts' setup>
import { ConfigProvider, Layout, LayoutContent, LayoutSider, Tree } from 'ant-design-vue'
import type { DataNode, EventDataNode, TreeProps } from 'ant-design-vue/es/tree'
import { computed, onBeforeMount, ref, watchEffect } from 'vue'
import { locale, theme } from '../../src/theme'
import { useCommonReader } from './use-reader'

const { initApp, state, sendMessage, scroller } = useCommonReader()
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

function handleClickChapter(selectedKeys: string[], e: { node: EventDataNode }) {
  if (selectedKeys.length) {
    // eslint-disable-next-line no-console
    console.log(selectedKeys, e)
    const name = selectedKeys[0].split('#').length > 1 ? selectedKeys[0].split('#')[1] : selectedKeys[0]
    const targetElement = document.getElementById(name)
    // 使用 scrollIntoView 方法滚动到目标元素
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth', // 可选，滚动行为，可以是 'auto', 'smooth', 'instant'
      })
    }
    else {
      const item = state.navs.find(item => item.path === selectedKeys[0])
      if (item) {
        sendMessage({
          path: 'reader:common:content:req',
          data: {
            md5: state.init.md5!,
            path: item.path,
            scroll: true,
            title: item.name,
          },
        })
      }
    }
  }
}

function onListUpdate() {
  const lastItem = _content.value[_content.value.length - 1]
  const nextIndex = state.navs.findIndex(item => item.path === lastItem.id)
  const next = state.navs[nextIndex + 1]
  if (next) {
    sendMessage({
      path: 'reader:common:content:req',
      data: {
        md5: state.init.md5!,
        path: next.path,
        scroll: false,
        title: next.name,
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
          <Tree :tree-data="state.navs as unknown as DataNode[]" block-node default-expand-all selectable :field-names="filedName" @select="handleClickChapter" />
        </template>
      </LayoutSider>
      <LayoutContent :style="{ marginLeft: '250px', padding: '24px' }">
        <DynamicScroller
          ref="scroller"
          class="scroller"
          :items="_content"
          :min-item-size="50"
          page-mode
          :update-interval="100"
          @scroll-end="onListUpdate"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[
                item.id,
              ]"
              :data-index="index"
            >
              <h1 :id="item.id">
                {{ item.title }}
              </h1>
              <div v-html="item.content" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </LayoutContent>
    </Layout>
  </ConfigProvider>
</template>

<style lang='scss' scoped>
.scroller {
  height: 100%;
}
</style>
