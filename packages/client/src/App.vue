<script setup lang="ts">
import { ConfigProvider } from "ant-design-vue";
import { locale, theme } from "./theme";
import { onBeforeMount } from "vue";
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const router = useRouter();

const app = useAppStore();
const { config } = storeToRefs(app);
const { initApp } = app;

onBeforeMount(() => {
  initApp(router);
  console.log("app2", config.value);
});
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <RouterView />
  </ConfigProvider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
