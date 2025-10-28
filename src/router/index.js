import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from '@/utils/auth';

const LoginPage = () => import('@/pages/log.vue');
const DashboardLayout = () => import('@/pages/home.vue');
const ResourcePage = () => import('@/pages/resource/ResourcePage.vue');

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { public: true },
  },
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard/TeamCard" },
      {
        path: ":resourceKey",
        name: "resource",
        component: ResourcePage,
        props: (route) => ({ resourceKey: route.params.resourceKey }),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard/TeamCard",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.public) {
    next();
    return;
  }

  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  next();
});

export default router;
