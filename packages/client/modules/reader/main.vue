<script lang="ts" setup>
import { Layout } from 'ant-design-vue'
import { computed, onBeforeMount, watchEffect } from 'vue'
import { locale, theme } from '../../src/theme'
import { useEpubRender } from './use-render'

const { Slider, Content } = Layout

const { initReader, epub } = useEpubRender()

const nav = computed(() => epub.value.nva)

watchEffect(() => {
  console.log('epub.nva', epub.value.nva?.length)
})

onBeforeMount(() => {
  initReader()
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    {{ nav }}
    <Layout>
      <Slider>
        {{ nav }}
        <!--  -->
      </Slider>
      <Content>reader</Content>
    </Layout>
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
