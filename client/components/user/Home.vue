<template>
  <div class="wrapper">
    <header class="main-header">
      <a href="" class="logo">
        <span class="logo-mini">CT</span>
        <span class="logo-lg">CoinTrack</span>
      </a>
      <nav class="navbar navbar-static-top">
        <a href="javascript:void(0);" class="sidebar-toggle" data-toggle="push-menu" role="button">
          <span class="sr-only">Toggle navigation</span>
        </a>

        <!-- Navbar Right Menu -->
        <div class="navbar-custom-menu">
          <ul class="nav navbar-nav">

            <!-- Load-Indicator -->
            <li class="dropdown messages-menu" v-if="hasOpenCalls">
              <a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fa fa-refresh fa-spin"></i>
              </a>
              <ul class="dropdown-menu">
                <li class="header">Offene Calls</li>
                <li>
                  <ul class="menu">
                    <li v-for="call in openCalls">
                      <a href="javascript:void(0);">
                        <i class="fa fa-spinner fa-spin"></i>
                        {{ call.url }}
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            <!-- Job-List -->
            <li class="dropdown messages-menu">
              <a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown">
                <i class="fa fa-tasks"></i>
                <span class="label label-success">{{Object.keys(jobs).length}}</span>
              </a>
              <ul class="dropdown-menu">
                <li class="header">Aktive Jobs</li>
                <li>
                  <ul class="menu">
                    <li v-for="job in jobs">
                      <a href="javascript:void(0);">
                        <i class="fa fa-tasks"></i>
                        {{ job.name }} ({{ job.interval / 1000}} sek)
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </nav>
    </header>
    <aside class="main-sidebar">
      <section class="sidebar">
        <ul class="sidebar-menu tree" data-widget="tree">
          <router-link :to="{name: 'dashboard'}" tag="li" active-class="active" exact>
            <a>
              <i class="fa fa-dashboard"></i>
              <span>Dashboard</span>
            </a>
          </router-link>
          <router-link :to="{name: 'taxReport'}" tag="li" active-class="active" exact>
            <a>
              <i class="fa fa-line-chart"></i>
              <span>Steuer-Report</span>
            </a>
          </router-link>
          <router-link :to="{name: 'backup'}" tag="li" active-class="active" exact>
            <a>
              <i class="fa fa-database"></i>
              <span>Backup</span>
            </a>
          </router-link>
        </ul>
      </section>
    </aside>
    <div class="content-wrapper">
      <section class="content-header"></section>
      <section class="content container-fluid">
        <router-view></router-view>
      </section>
    </div>

    <footer class="main-footer">
      <div class="pull-right hidden-xs">
        <b>Version</b> {{version}}
      </div>
      <strong>© Rainu</strong> {{builtDate ? builtDate.format('DD.MM.YY HH:mm') : '-'}}
    </footer>
    <!-- Add the sidebar's background. This div must be placed immediately after the control sidebar -->
    <div class="control-sidebar-bg"></div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';

  //entrypoint: here we only load the basic-data such like the account and there wallets etc.
  export default {
    computed: {
      ...mapState({
        account: state => state.account.account,
        courses: state => state.course.ticker,
        wallets: state => state.wallet.wallets,
        coins: state => state.wallet.coins,
        taxReport: state => state.taxReport.report,
        jobs: state => state.job.jobs,
        version: state => state.meta.version,
        builtDate: state => state.meta.builtDate,
      }),
      ...mapGetters({
        transactions: 'wallet/transactions',
        hasOpenCalls: 'call/hasOpenCalls',
        openCalls: 'call/openCalls',
      }),
    },
    created() {
      this.$store.dispatch('account/updateAccount', this.$route.params.username);
    }
  };
</script>