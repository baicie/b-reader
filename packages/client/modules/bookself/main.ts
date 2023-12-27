import { createApp } from 'vue'
import directives from '../../src/directives'
import i18n from '../../src/locales'
import { store } from '../../src/store'
import SliderBar from './main.vue'

const app = createApp(SliderBar)
app.use(directives)
app.use(store)
app.use(i18n)
app.mount('#app')
