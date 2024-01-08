<script lang='ts' setup>
import { onBeforeMount } from 'vue'
import { useCommonReader } from './use-reader'

const { initApp, state } = useCommonReader()

onBeforeMount(() => {
  initApp()
})
</script>

<template>
  <div>common-reader</div>
</template>

<style lang='scss' scoped></style>
