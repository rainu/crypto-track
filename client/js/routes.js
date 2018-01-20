import Login from '../components/Login.vue'

const Home = resolve => {
  require.ensure(['../components/user/Home.vue'], () => {
    resolve(require('../components/user/Home.vue'));
  }, 'user');
};
const Dashboard = resolve => {
  require.ensure(['../components/user/dashboard/Dashboard.vue'], () => {
    resolve(require('../components/user/dashboard/Dashboard.vue'));
  }, 'user');
};
const TaxReport = resolve => {
  require.ensure(['../components/user/TaxReport.vue'], () => {
    resolve(require('../components/user/TaxReport.vue'));
  }, 'user');
};

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
      {
        path: 'tax-report', name: 'taxReport', component: TaxReport,
      },
    ]
  },
  {
    path: '*', redirect: '/', component: Login,
  }
];