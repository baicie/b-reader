import { createApp } from "vue";
import SliderBar from "./SliderBar.vue";
import { store } from "./store";
import i18n from "./locales";

const app = createApp(SliderBar);
app.use(store);
app.use(i18n);
app.mount("#app");
