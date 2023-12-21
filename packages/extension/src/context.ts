import { ExtensionContext, Uri } from "vscode";

export type BReaderContext = {
  dbPath?: Uri;
};

export type NonReadonlyBReaderContext = NonReadonlyProperties<BReaderContext>;

export type useVscodeContextUpdateArgs = Record<
  NonReadonlyBReaderContext,
  NonReadonlyBReaderContext[keyof NonReadonlyBReaderContext]
>;

export function useVscodeContext(_context: ExtensionContext) {
  const context: BReaderContext | undefined = {};
  const config: BReaderContext = {};

  function update(
    key: keyof NonReadonlyBReaderContext,
    value: NonReadonlyBReaderContext[keyof NonReadonlyBReaderContext]
  ) {
    if (context) {
      context[key] = value;
    }
  }

  function undates(values: BReaderContext) {
    if (context) {
      for (const key of Object.keys(values)) {
        context[key] = values[key];
      }
    }
  }

  function dispose() {}

  function get() {
    return context;
  }

  return {
    update,
    dispose,
    get,
    undates,
    context,
    config,
  };
}
