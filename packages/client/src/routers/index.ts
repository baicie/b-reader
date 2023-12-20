// @ts-nocheck
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    path: "/welcome",
    component: () => import("@/views/Welcome.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
