import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "@bendera/vscode-webview-elements";
import "@vscode/webview-ui-toolkit";
import { store } from "./store";
import { router } from "./routers";
import "@types/vscode-webview";

const app = createApp(App);
app.use(router);
app.use(store);
app.mount("#app");
