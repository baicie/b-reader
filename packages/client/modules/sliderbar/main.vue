<script lang="ts" setup>
import type { BookConfig } from '@b-reader/utils'
import type { UploadFile } from 'ant-design-vue'
import { Button, ButtonGroup, ConfigProvider, UploadDragger } from 'ant-design-vue'
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../src/store/app'
import { locale, theme } from '../../src/theme'

const { t } = useI18n()
const { initApp, sendMessage, config } = useAppStore()

function beforeUpload(file: UploadFile & { path: string }) {
  sendMessage({
    path: 'book',
    data: {
      name: file.name,
      path: file.path,
      type: file.type,
    } as BookConfig,
  })
  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject()
}

function handleOpenLocal(path?: string) {
  if (!path)
    return
  sendMessage({
    path: 'openLocal',
    data: path,
  })
}

function handleOpenWebview(path: string) {
  sendMessage({
    path: 'openWebview',
    data: path,
  })
}

onBeforeMount(() => {
  initApp()
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <ButtonGroup :style="{ display: 'flex', flexDirection: 'column' }">
      <UploadDragger
        :show-upload-list="false"
        :before-upload="(file:any) => beforeUpload(file)"
        accept=".epub"
        :style="{ width: '100%', display: 'block' }"
      >
        <Button type="ghost" :style="{ width: '100%' }">
          {{ t("menus.add_book") }}
        </Button>
      </UploadDragger>

      <Button type="ghost" @click="() => handleOpenLocal(config.bookPath?.path)">
        打开本地
      </Button>

      <Button
        v-dev
        type="ghost"
        @click="() => handleOpenLocal(config.globalStorageUri?.path)"
      >
        dev
      </Button>

      <!-- <div>
        <img class="logo" src="../../../extension/icon/icon.svg">
      </div> -->

      <Button type="ghost" @click="handleOpenWebview('openBookSelefWebView')">
        书架
      </Button>

      <Button type="ghost" @click="handleOpenWebview('openSearchOnline')">
        在线搜索
      </Button>

      <!-- <div>all books</div> -->

      <!-- <div v-if="classification.length">
        默认分类
      </div>

      <template v-for="item in classification" :key="item.id">
        <div>{{ item }}</div>
      </template>

      <div>新建分类</div>

      <div>云端?</div>

      <div>设置</div> -->
    </ButtonGroup>
  </ConfigProvider>
</template>

<style lang="scss" scoped>
.flex {
  display: flex;
  flex-direction: column;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
</style>
