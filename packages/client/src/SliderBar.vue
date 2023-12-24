<script lang="ts" setup>
import { useAppStore } from "@/store/app";
import { Button, ConfigProvider, Upload, UploadFile } from "ant-design-vue";
import enUS from "ant-design-vue/es/locale/en_US";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { theme } from "./theme";

const { t } = useI18n();
const app = useAppStore();
const { config } = storeToRefs(app);
const { initApp, sendMessage } = app;

const beforeUpload = (file: UploadFile & { path: string }) => {
  sendMessage({
    path: "book",
    data: {
      name: file.name,
      path: file.path,
      type: file.type,
    },
  });
  return Promise.reject();
};

const classification = ref([]);

const locale = computed(() => {
  switch (config.value.language) {
    case "zh-cn":
      return zhCN;
    case "en-us":
      return enUS;
    default:
      return zhCN;
  }
});

const handleOpenLocal = () => {
  sendMessage({
    path: "openLocal",
    data: {},
  });
};

onBeforeMount(() => {
  initApp();
  // TOFIX 每次都会渲染？
  console.log("initApp");
});
</script>
<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <Button @click="handleOpenLocal" type="primary">打开本地</Button>

    <div>
      <img class="logo" src="../../extension/icon/icon.svg" />
    </div>

    <div>
      <Upload
        :beforeUpload="(file:any)=>beforeUpload(file)"
        accept=".epub,.txt"
      >
        <Button type="ghost"> {{ t("menus.add_book") }} </Button>
      </Upload>
    </div>

    <div>书架</div>

    <div>all books</div>

    <div v-if="classification.length">默认分类</div>

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
