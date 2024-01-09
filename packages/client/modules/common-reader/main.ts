import { createApp } from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import directives from '../../src/directives'
import i18n from '../../src/locales'
import main from './main.vue'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(main)
app.use(directives)
app.use(i18n)
app.use(VueVirtualScroller)
app.mount('#app')
