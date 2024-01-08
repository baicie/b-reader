<script lang="ts" setup>
import { Button, ConfigProvider, InputSearch, Table } from 'ant-design-vue'
import { onBeforeMount, ref, toRaw } from 'vue'
import type { SearchOnlineResult } from '@b-reader/utils'
import { locale, theme } from '../../src/theme'
import { useSearch } from './use-search'

const value = ref<string>('斗罗大陆')
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
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
  },
]

function onSearch(searchValue: string) {
  sendMessage({
    path: 'online:search',
    data: searchValue,
  })
}

function onRead(data: SearchOnlineResult) {
  sendMessage({
    path: 'online:read:req',
    data: toRaw(data),
  })
}

function onAddToShelf(data: SearchOnlineResult) {
  sendMessage({
    path: 'online:add_bookshelf:req',
    data,
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

    <Table :columns="columns" :data-source="state.res">
      <template #bodyCell="{ record, column }">
        <template v-if="column.key === 'operation'">
          <a @click="onRead(record as any)">
            阅读
          </a>
          <a @click="onAddToShelf(record as any)">
            加入书架
          </a>
        </template>
      </template>
    </Table>
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
