import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { store } from "./store";
import { router } from "./routers";
import i18n from "./locales";

const app = createApp(App);
app.use(router);
app.use(store);
app.use(i18n);
app.mount("#app");
