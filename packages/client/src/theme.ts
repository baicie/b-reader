import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import { computed } from 'vue'
import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useAppStore } from './store/app'

const { config } = useAppStore()

export const theme: ThemeConfig = {
  token: {
    colorPrimary: 'var(--vscode-button-background)',
  },
}

export const locale = computed(() => {
  switch (config.language) {
    case 'zh-cn':
      return zhCN
    case 'en-us':
      return enUS
    default:
      return zhCN
  }
})
