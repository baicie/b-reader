<script lang='ts' setup>
import { ConfigProvider, Layout, LayoutContent, LayoutSider, List, ListItem, Skeleton, Tree } from 'ant-design-vue'
import type { DataNode, EventDataNode, TreeProps } from 'ant-design-vue/es/tree'
import { computed, onBeforeMount } from 'vue'
import { locale, theme } from '../../src/theme'
import { scrollToElement } from '../../src/utils'
import { useCommonReader } from './use-reader'

const { initApp, state, sendMessage } = useCommonReader()

const filedName: TreeProps['fieldNames'] = {
  children: 'children',
  title: 'name',
  key: 'path',
}

const _content = computed(() => {
  return Object.entries(state.contents).map(([key, value]) => ({
    id: key,
    content: value,
  }))
})

function handleClickChapter(selectedKeys: string[], e: { node: EventDataNode }) {
  if (selectedKeys.length) {
    // eslint-disable-next-line no-console
    console.log(selectedKeys, e)
    const id = selectedKeys[0].split('#').length > 1 ? selectedKeys[0].split('#')[1] : selectedKeys[0]
    scrollToElement(id)
  }
}

function onListUpdate(startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) {
  console.log('onListUpdate', startIndex, endIndex, visibleStartIndex, visibleEndIndex)
  const lastItem = _content.value[_content.value.length - 1]
  const nextIndex = state.navs.findIndex(item => item.path === lastItem.id)
  const next = state.navs[nextIndex + 1]
  if (next) {
    console.log('next', next)
    sendMessage({
      path: 'reader:common:content:req',
      data: {
        md5: state.init.md5!,
        path: next.path,
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
          class="scroller"
          :items="_content"
          :min-item-size="2"
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
              <div :id="item.id" v-html="item.content" />
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
