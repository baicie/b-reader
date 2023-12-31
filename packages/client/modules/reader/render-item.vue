<script lang='ts' setup>
import { computed } from 'vue'
import { Builder } from 'xml2js'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})
const body = computed(() => {
  return props.content.html.body
})

console.log('body', props.content)
</script>

<template>
  {{ body }}
</template>
