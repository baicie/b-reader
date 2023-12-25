import { defineStore } from "pinia";
import { store } from "./index";
import { BReaderContext } from "@b-reader/utils";
import { MessageType } from "@b-reader/utils";
import { reactive } from "vue";
import { WebviewApi } from "../vite-env";
import { useRouter } from "vue-router";

const appStore = defineStore("app", () => {
  const config: BReaderContext = reactive({});
  let vscode: WebviewApi<unknown> | undefined;
  const router = useRouter();

  function initApp() {
    vscode = acquireVsCodeApi();

    window.addEventListener("message", (event) => {
      const message = event.data as MessageType;
      switch (message.path) {
        case "config":
          mergeObject(config, message.data);
          break;
        case "bookshelf":
          routerGoto(message.data);
          break;
      }
    });
  }

  const mergeObject = (source: BReaderContext, target: Object) => {
    for (const key of Object.keys(target)) {
      source[key] = target[key];
    }
  };

  const routerGoto = (path: string) => {
    router.push(path);
  };

  const sendMessage = (message: MessageType) => {
    vscode?.postMessage(message);
  };

  return {
    config,
    vscode,
    initApp,
    sendMessage,
  };
});

export const useAppStore = () => {
  return appStore(store);
};
