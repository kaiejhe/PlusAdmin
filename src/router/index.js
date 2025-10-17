
import { createRouter, createWebHistory } from 'vue-router'
import log from '../pages/log.vue'
import home from '../pages/home.vue'
import TeamOrder from '../pages/TeamOrder.vue'
import card from '../pages/card.vue'
import token from '../pages/token.vue'
import Team from '../pages/Team.vue'


const routes = [
  { path: '/',name: 'log',component: log,},
  { path: '/home', name: 'home',component:home},
  { path: '/TeamOrder', name: 'TeamOrder',component:TeamOrder},
  { path: '/card', name: 'card',component:card},
  { path: '/token', name: 'token',component:token},
  { path: '/Team', name: 'Team',component:Team},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
