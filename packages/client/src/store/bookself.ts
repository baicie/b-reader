import { defineStore } from "pinia";
import { store } from "./index";
import { useAppStore } from "./app";
import { Book, MessageType } from "@b-reader/utils";
import { reactive } from "vue";

const bookselfStore = defineStore("bookself", () => {
  const { initApp, config, sendMessage } = useAppStore();
  const state = reactive({
    books: {} as Record<string, Book>,
  });

  const listen = () => {
    window.addEventListener("message", (event) => {
      const message = event.data as MessageType;
      switch (message.path) {
        case "bookInfor":
          console.log("bookInfor", message.data);
          state.books = message.data;
          break;
      }
    });
  };

  const initBookself = () => {
    initApp();
    listen();

    sendMessage({
      path: "bookInfor",
      data: {},
    });
  };

  const clickBook = (bookId: string) => {
    console.log("clickBook", bookId);
    sendMessage({
      path: "openBook",
      data: bookId,
    });
  };

  return {
    initBookself,
    config,
    state,
    clickBook,
  };
});

export const useBookselfStore = () => {
  return bookselfStore(store);
};
