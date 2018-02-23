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
  });
};
const Backup = resolve => {
  require.ensure(['../components/user/Backup.vue'], () => {
    resolve(require('../components/user/Backup.vue'));
  });
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
      {
        path: 'backup', name: 'backup', component: Backup,
      },
    ]
  },
  {
    path: '*', redirect: '/', component: Login,
  }
];