
import { createRouter, createWebHistory } from 'vue-router'
import log from '../pages/log.vue'
import home from '../pages/home.vue'
import settings from '../pages/settings.vue'
import card from '../pages/card.vue'
import token from '../pages/token.vue'
import submit from '../pages/submit.vue'


const routes = [
  {path: '/log',name: 'log',component: log,},
  { path: '/home', name: 'home',component:home},
  { path: '/settings', name: 'settings',component:settings},
  { path: '/card', name: 'card',component:card},
  { path: '/token', name: 'token',component:token},
  { path: '/submit', name: 'submit',component:submit},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
