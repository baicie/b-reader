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
const { initBookself, clickBook, state } = useBookselfStore()

onBeforeMount(() => {
  initBookself()
  // TOFIX 每次都会渲染？
  // console.log('initApp bookself')
})
</script>

<template>
  <ConfigProvider :locale="locale" :theme="theme" class="flex">
    <Row :gutter="[8, 16]">
      <template v-for="(item, key) in state.books" :key="key">
        <Col :span="6">
          <Card style="width: 240px">
            <template #cover>
              <img
                style="width: 240px; height: 300px"
                :src="item.img"
              >
            </template>
            <CardMeta :title="item.config.name">
              <template #description>
                <Button @click="clickBook(key)">
                  {{ t('bookself.read') }}
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
