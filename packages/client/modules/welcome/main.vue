<script lang="ts" setup>
import { Button, ConfigProvider } from 'ant-design-vue'
import { locale, theme } from '../../src/theme'
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <div>Welcome</div>
    <Button type="primary">
      Primary Button
    </Button>
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
