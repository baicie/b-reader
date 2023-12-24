export type MessageType<T extends unknown> = {
  path: string;
  data: T;
};
