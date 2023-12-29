<script lang="ts" setup>
import {
  Button,
  Card,
  CardMeta,
  Col,
  ConfigProvider,
  Row,
} from 'ant-design-vue'
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBookselfStore } from '../../src/store/bookself'
import { locale, theme } from '../../src/theme'

const { t } = useI18n()
const books = useBookselfStore()
const { initBookself, clickBook, state } = books

onBeforeMount(() => {
  initBookself()
  // TOFIX 每次都会渲染？
  // console.log('initApp bookself')
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <Row :gutter="[8, 8]">
      <template v-for="(item, key) in state.books" :key="key">
        <Col :span="6">
          <Card hoverable style="width: 240px">
            <template #cover>
              <img
                alt="example"
                src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
              >
            </template>
            <CardMeta title="Europe Street beat">
              <template #description>
                <Button @click="clickBook(key)">
                  cbook
                </Button>
              </template>
            </CardMeta>
          </Card>
        </Col>
      </template>
    </Row>
  </ConfigProvider>
</template>

<style lang="scss" scoped></style>
