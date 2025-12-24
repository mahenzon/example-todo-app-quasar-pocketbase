import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // All lists (both public and private) - accessible to everyone
  // Authentication is checked within the component
  {
    path: '/lists/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/SingleListPage.vue') }],
    meta: { requiresAuth: false },
  },
  // Auth-protected routes - main dashboard (list overview)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    meta: { requiresAuth: true },
  },
  // Auth pages (login/register)
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
