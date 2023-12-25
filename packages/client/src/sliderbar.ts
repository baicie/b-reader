import { createApp } from "vue";
import SliderBar from "./SliderBar.vue";
import directives from "./directives";
import i18n from "./locales";
import { store } from "./store";

const app = createApp(SliderBar);
app.use(directives);
app.use(store);
app.use(i18n);
app.mount("#app");
