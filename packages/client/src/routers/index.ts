// @ts-nocheck
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import Welcome from "../views/welcome.vue";
import Book from "../views/books.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    path: "/welcome",
    component: Welcome,
  },
  {
    path: "/bookshelf",
    component: Book,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
