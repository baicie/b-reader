import { I18n } from "i18n";

export const i18n = new I18n({
  locales: ["en", "zh"],
  directory: `${__dirname}/locales`,
  defaultLocale: "zh",
});

export const useI18n = () => {
  function t(key: string, ...args: any[]) {
    return i18n.__(key, ...args);
  }

  return {
    t,
  };
};
