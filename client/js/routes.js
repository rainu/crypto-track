import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Dashboard from '../components/Dashboard.vue'

export const routes = [
  {
    path: '/', redirect: '/login',
  },
  {
    path: '/login', name: 'login', component: Login,
  },
  {
    path: '/user/:username', name: 'home', component: Home,
    children: [
      {
        path: '', component: Dashboard,
      },
      {
        path: 'dashboard', name: 'dashboard', component: Dashboard,
      },
    ]
  },
  {
    path: '*', redirect: '/', component: Login,
  }
];