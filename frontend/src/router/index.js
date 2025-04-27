import { createRouter, createWebHistory } from 'vue-router'
import StaffLogin from '../components/StaffLogin.vue'
import StaffDashboard from '../components/StaffDashboard.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: StaffLogin },
  { path: '/staff-dashboard', component: StaffDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
