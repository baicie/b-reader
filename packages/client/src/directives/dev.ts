import type { Directive } from "vue";

export const dev: Directive = {
  mounted(el) {
    if (import.meta.env.MODE === "development") {
      return;
    }

    if (el.parentElement?.children.length === 1) {
      el.parentElement.style = "display: none";
    }

    el.parentElement.removeChild(el);
  },
};
