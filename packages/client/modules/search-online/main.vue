<script lang="ts" setup>
import { ConfigProvider, InputSearch, Table } from 'ant-design-vue'
import { onBeforeMount, ref } from 'vue'
import { locale, theme } from '../../src/theme'
import { useSearch } from './use-search'

const value = ref<string>('')
const { initApp, sendMessage, state } = useSearch()

const columns = [
  {
    title: '文章名称',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '最新章节',
    dataIndex: 'latestChapter',
    key: 'latestChapter',
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'author',
  },
  {
    title: '字数',
    dataIndex: 'size',
    key: 'size',
  },
  {
    title: '更新',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
]

function onSearch(searchValue: string) {
  sendMessage({
    path: 'online:search',
    data: searchValue,
  })
}

onBeforeMount(() => {
  initApp()
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <InputSearch
      v-model:value="value"
      placeholder="input search text"
      enter-button
      @search="onSearch"
    />

    <Table :columns="columns" :data-source="state.res" />
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
