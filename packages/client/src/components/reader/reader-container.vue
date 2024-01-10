<script lang="ts" setup>
import {
  Affix,
  Button,
  ButtonGroup,
  Dropdown,
  InputNumber,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
} from 'ant-design-vue'
import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue'
import { useReaderContainer } from './use-reader-container'

const emits = defineEmits(['pre', 'next'])
const { state } = useReaderContainer()

const style = computed<CSSProperties>(() => ({
  fontFamily: state.fontFamily,
  fontSize: `${state.fontSize}px`,
  lineHeight: `${state.lineHeight}px`,
  letterSpacing: `${state.letterSpacing}px`,
  fontWeight: state.fontWeight,
  minHeight: '100vh',
  paddingLeft: `${state.paddingSlider}px`,
  paddingRight: `${state.paddingSlider}px`,
  paddingTop: `${state.paddingHeader}px`,
  paddingBottom: `${state.paddingHeader}px`,
}))

const headerStyle = computed<CSSProperties>(() => ({
  height: '40px',
  zIndex: '100',
  lineHeight: '0',
  padding: '5px 15px',
}))

function valueChange(value: any) {
  if (typeof value === 'number') {
    state.fontSize = value
    state.lineHeight = value + 10
  }
}

function valueChange2(value: any) {
  if (typeof value === 'number')
    state.paddingSlider = value
}
</script>

<template>
  <Layout>
    <Affix :offset-top="0" :style="{ zIndex: '100' }">
      <LayoutHeader v-show="state.showHeader" :style="headerStyle">
        <InputNumber v-model:value="state.fontSize" :bordered="false" :min="10" :max="42" :step="2" @change="valueChange">
          <template #upIcon>
            <ArrowUpOutlined />
          </template>
          <template #downIcon>
            <ArrowDownOutlined />
          </template>
        </InputNumber>

        <InputNumber v-model:value="state.paddingSlider" :bordered="false" :min="10" :max="200" :step="2" @change="valueChange2">
          <template #upIcon>
            <ArrowUpOutlined />
          </template>
          <template #downIcon>
            <ArrowDownOutlined />
          </template>
        </InputNumber>
      </LayoutHeader>
    </Affix>
    <Layout>
      <LayoutSider
        v-show="state.showSlider"
        :width="250"
        :style="{
          overflow: 'auto',
          height: 'calc(100vh-20px)',
          position: 'fixed',
          paddingTop: state.showHeader ? '40px' : '0',
          left: 0,
          bottom: 0,
        }"
      >
        <slot name="menus" />
      </LayoutSider>
      <LayoutContent :style="{ marginLeft: state.showSlider ? '250px' : '0', padding: '24px', paddingTop: state.showHeader ? '40px' : '0' }">
        <Dropdown trigger="contextmenu">
          <div :style="style">
            <slot name="default" />
          </div>

          <template #overlay>
            <ButtonGroup :style="{ display: 'flex', flexDirection: 'column' }">
              <Button type="ghost" @click="emits('pre')">
                上一章
              </Button>

              <Button type="ghost" @click="emits('next')">
                下一章
              </Button>

              <Button type="ghost" @click="state.showSlider = !state.showSlider">
                {{ state.showSlider ? '隐藏目录' : '显示目录' }}
              </Button>

              <Button type="ghost" @click="state.showHeader = !state.showHeader">
                {{ state.showHeader ? '隐藏头部' : '显示头部' }}
              </Button>
            </ButtonGroup>
          </template>
        </Dropdown>
      </LayoutContent>
    </Layout>
  </Layout>
</template>

<style lang="scss" scoped></style>
