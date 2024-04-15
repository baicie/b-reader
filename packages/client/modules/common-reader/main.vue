<script lang='ts' setup>
import type { SearchOnlineResult } from '@b-reader/utils'
import { ConfigProvider, Tree } from 'ant-design-vue'
import type { TreeProps } from 'ant-design-vue/es/tree'
import { computed, onBeforeMount } from 'vue'
import ReaderContainer from '../../src/components/reader/reader-container.vue'
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

const navs = computed<any>(() => state.navs)

const height = computed(() => window.innerHeight)

function handleClickChapter(selectedKeys: string[]) {
  if (selectedKeys.length) {
    // eslint-disable-next-line no-console
    console.log(selectedKeys)
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

function handleNext() {
  const index = navs.value.findIndex(item => item.path === state.currentPath)
  if (index === navs.value.length - 1)
    return
  handleClickChapter([navs.value[index + 1].path])
}

function handlePre() {
  const index = navs.value.findIndex(item => item.path === state.currentPath)
  if (index === 0)
    return
  handleClickChapter([navs.value[index - 1].path])
}

onBeforeMount(() => {
  initApp()
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <ReaderContainer @next="handleNext" @pre="handlePre">
      <template #menus>
        <Tree :tree-data="navs" block-node default-expand-all selectable :field-names="filedName" :height="height"
          @select="handleClickChapter" />
      </template>

      <template #default>
        <div>
          <h1 :id="item.id">
            {{ item.title }}
          </h1>
          <div v-html="item.content" />
        </div>
      </template>
    </ReaderContainer>
  </ConfigProvider>
</template>

<style lang='scss' scoped>
.scroller {
  height: 100%;
}
</style>
