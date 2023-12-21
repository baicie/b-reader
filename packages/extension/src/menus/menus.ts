import { ReaderSlider } from "./tree-data-provider";

class MenusManager implements Disposable {
  private treeNode: ReaderSlider[] = [
    {
      name: "Open Reader",
      type: "command",
      path: "openReader",
    },
  ];

  public getChildren(): ReaderSlider[] {
    return this.treeNode;
  }

  [Symbol.dispose](): void {
    this.treeNode = [];
  }
}

export const menus = new MenusManager();
