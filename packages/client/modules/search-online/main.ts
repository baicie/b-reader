import { createApp } from 'vue'
import directives from '../../src/directives'
import i18n from '../../src/locales'
import main from './main.vue'

const app = createApp(main)
app.use(directives)
app.use(i18n)
app.mount('#app')
