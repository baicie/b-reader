type NonReadonlyProperties<T> = {
  [K in keyof T]-?: T extends Record<K, infer V>
    ? Readonly<V> extends V
      ? never
      : K
    : K;
}[keyof T];
