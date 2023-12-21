<script lang="ts" setup>
const vscode = acquireVsCodeApi();

const handleClick = () => {
  vscode.postMessage("heooll");
};
</script>
<template>
  <div>Welcome</div>
  <vscode-button @click="handleClick" id="button-1">Button</vscode-button>
</template>
<style lang="scss" scoped></style>
