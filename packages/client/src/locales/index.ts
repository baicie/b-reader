/* eslint-disable @typescript-eslint/naming-convention */
import { createI18n } from "vue-i18n";
import zh_CN from "./zh_CN";
import en_US from "./en_US";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "zh-cn",
  messages: {
    "zh-cn": zh_CN,
    "en-us": en_US,
  },
});

export default i18n;
