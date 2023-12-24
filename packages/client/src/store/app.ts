import { defineStore } from "pinia";
import { store } from "./index";
import { BReaderContext } from "@b-reader/utils";
import { MessageType } from "@b-reader/utils";
import { reactive } from "vue";
import { WebviewApi } from "../vite-env";

const appStore = defineStore("app", () => {
  const config: BReaderContext = reactive({});
  let vscode: WebviewApi<unknown> | undefined;

  function initApp() {
    vscode = acquireVsCodeApi();

    window.addEventListener("message", (event) => {
      const message = event.data as MessageType<any>;
      switch (message.path) {
        case "config":
          mergeObject(config, message.data);
          break;
      }
    });
  }

  function mergeObject(source: BReaderContext, target: Object) {
    for (const key of Object.keys(target)) {
      source[key] = target[key];
    }
  }

  function sendMessage(message: MessageType<any>) {
    console.log("sendMessage", message);

    vscode?.postMessage(message);
  }

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
