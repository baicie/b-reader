<script lang="ts" setup>
import { ConfigProvider, InputSearch } from 'ant-design-vue'
import { onBeforeMount, ref } from 'vue'
import { locale, theme } from '../../src/theme'
import { useAppStore } from '../../src/store/app'

const value = ref<string>('')
const { initApp, sendMessage, config } = useAppStore()

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
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
