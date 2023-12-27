<script lang="ts" setup>
import type { UploadFile } from 'ant-design-vue'
import { Button, ConfigProvider, Upload } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BookConfig } from '@b-reader/utils'
import { locale, theme } from '../../src/theme'
import { useAppStore } from '../../src/store/app'

const { t } = useI18n()
const app = useAppStore()
const { config } = storeToRefs(app)
const { initApp, sendMessage } = app

function beforeUpload(file: UploadFile & { path: string }) {
  sendMessage({
    path: 'book',
    data: {
      name: file.name,
      path: file.path,
      type: file.type,
    } as BookConfig,
  })
  return Promise.reject()
}

const classification = ref([])

function handleOpenLocal(path?: string) {
  if (!path)
    return
  sendMessage({
    path: 'openLocal',
    data: path,
  })
}

function handleOpenWebview(path: string) {
  // emitter.emit("openWebview", path);
  sendMessage({
    path: 'openWebview',
    data: path,
  })
}

onBeforeMount(() => {
  initApp()
  // TOFIX 每次都会渲染？
  console.log('initApp')
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <Button type="primary" @click="() => handleOpenLocal(config.bookPath?.path)">
      打开本地
    </Button>

    <Button
      v-dev
      type="primary"
      @click="() => handleOpenLocal(config.globalStorageUri?.path)"
    >
      dev
    </Button>

    <div>
      <img class="logo" src="../../../extension/icon/icon.svg">
    </div>

    <div>
      <Upload
        :before-upload="(file:any) => beforeUpload(file)"
        accept=".epub,.txt,.pdf"
      >
        <Button type="primary">
          {{ t("menus.add_book") }}
        </Button>
      </Upload>
    </div>

    <Button @click="handleOpenWebview('bookshelf')">
      书架
    </Button>

    <div>all books</div>

    <div v-if="classification.length">
      默认分类
    </div>

    <template v-for="item in classification" :key="item.id">
      <div>{{ item }}</div>
    </template>

    <div>新建分类</div>

    <div>云端?</div>

    <div>设置</div>
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
