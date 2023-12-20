import { ExtensionContext } from "vscode";

export type BReaderContext = ExtensionContext & {
  dbPath?: string;
};

type NonReadonlyBReaderContext = NonReadonlyProperties<BReaderContext>;

export function useVscodeContent(_content: ExtensionContext) {
  const content: BReaderContext | undefined = _content;

  function update(
    key: keyof NonReadonlyBReaderContext,
    value: NonReadonlyBReaderContext[keyof NonReadonlyBReaderContext]
  ) {
    if (content) {
      content[key] = value;
    }
  }

  function undates(
    values: Record<
      keyof NonReadonlyBReaderContext,
      NonReadonlyBReaderContext[keyof NonReadonlyBReaderContext]
    >
  ) {
    if (content) {
      for (const key of Object.keys(values)) {
        content[key] = values[key];
      }
    }
  }

  function dispose() {}

  function get() {
    return content;
  }

  return {
    update,
    dispose,
    get,
    undates,
    content,
  };
}
