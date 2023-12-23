import { ProviderResult, TreeDataProvider, TreeItem } from "vscode";
import { menus } from "./menus";
import { Commands } from "../config";

export type ReaderSlider = {
  name: string;
  type: string;
  path: string;
};

class SliderProvider implements TreeDataProvider<ReaderSlider>, Disposable {
  getTreeItem(element: ReaderSlider): TreeItem | Thenable<TreeItem> {
    return {
      label: element.name,
      command: {
        command: Commands.openReaderWebView,
        title: element.name,
        arguments: [element],
      },
    };
  }
  getChildren(): ProviderResult<ReaderSlider[]> {
    return menus.getChildren();
  }

  [Symbol.dispose](): void {
    throw new Error("Method not implemented.");
  }
}

export const menusProvider = new SliderProvider();