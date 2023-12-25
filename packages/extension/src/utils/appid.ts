import { BReaderContext } from "@b-reader/utils";
import { v4 as uuid } from "uuid";

export const mixinAppid = (config: BReaderContext) => {
  const appid = uuid();
  config.appid = appid;
};
