import { defineStore } from "pinia";
import { store } from "./index";
import { BReaderContext } from "@b-reader/utils";
import { MessageType } from "@b-reader/utils";
import { reactive } from "vue";
import { WebviewApi } from "../vite-env";
import { Router, useRouter } from "vue-router";
import { emitter } from "../utils/mitt";
import { AppState } from "./types";

const appStore = defineStore("app", () => {
  const config: BReaderContext = reactive({});
  const state = reactive<AppState>({
    goto: "",
  });
  let vscode: WebviewApi<unknown> | undefined;
  let router: Router | undefined;

  const initApp = (_router?: Router) => {
    router = _router;
    vscode = acquireVsCodeApi();

    window.addEventListener("message", (event) => {
      const message = event.data as MessageType;
      switch (message.path) {
        case "config":
          mergeObject(config, message.data);
          break;
        case "routerTo":
          break;
      }
    });

    // get config
    sendMessage({
      path: "config",
      data: {},
    });
  };

  const mergeObject = (source: BReaderContext, target: Object) => {
    for (const key of Object.keys(target)) {
      source[key] = target[key];
    }
  };

  const routerGoto = (path: string) => {
    console.log("routerGoto", path, router);

    if (!(path && router)) {
      return;
    }
    let _path = path;
    if (!path.startsWith("/")) {
      _path = "/" + path;
    }
    router?.push(_path);
  };

  const emmitMessage = (message: MessageType) => {
    emitter.emit(message.path, message.data);
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
