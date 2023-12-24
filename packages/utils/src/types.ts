export type MessageType<T extends unknown> = {
  path: string;
  data: T;
};

export type BookConfig = {
  name: string;
  path: string;
  type: string;
};
