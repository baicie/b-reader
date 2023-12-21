import { defineStore } from "pinia";
import { store } from "./index";

const appStore = defineStore("app", () => {});

export const useAppStore = () => {
  return appStore(store);
};
