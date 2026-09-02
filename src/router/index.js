import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/", redirect: "/sermons" },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/sermons",
    name: "sermons",
    component: () => import("../views/SermonListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sermons/:id",
    name: "sermon-editor",
    component: () => import("../views/SermonEditorView.vue"),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/sermons/:id/preach",
    name: "sermon-preach",
    component: () => import("../views/PreachView.vue"),
    meta: { requiresAuth: true },
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { next: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "sermons" };
  }
});

export default router;
