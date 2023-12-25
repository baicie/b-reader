import { storeToRefs } from "pinia";
import { useAppStore } from "../store/app";

export const useLog = () => {
  const { config } = storeToRefs(useAppStore());

  const log = (...args: any[]) => {
    console.log(`${config.value.appid}`, ...args);
  };

  return {
    log,
  };
};
