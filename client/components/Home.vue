<template>
  <div class="wrapper">
    <header class="main-header">
      <a href="" class="logo">
        <span class="logo-mini">CT</span>
        <span class="logo-lg">CoinTrack</span>
      </a>
      <nav class="navbar navbar-static-top" role="navigation">
        <a href="javascript:void(0);" class="sidebar-toggle" data-toggle="push-menu" role="button">
          <span class="sr-only">Toggle navigation</span>
        </a>
        <div class="navbar-custom-menu">
          <ul class="nav nav-bar"></ul>
        </div>
      </nav>
    </header>
    <aside class="main-sidebar">
      <section class="sidebar">
        <ul class="sidebar-menu tree"></ul>
      </section>
    </aside>
    <div class="content-wrapper">
      <section class="content" style="width: 100%;">
        <router-view></router-view>
      </section>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';

  //entrypoint: here we only load the basic-data such like the account and there wallets etc.
  export default {
    computed: {
      ...mapState({
        account: state => state.account.account,
        courses: state => state.course.courses,
        wallets: state => state.wallet.wallets,
        coins: state => state.wallet.coins,
        taxReport: state => state.taxReport.report,
      }),
      ...mapGetters({
        transactions: 'wallet/transactions',
      }),
    },
    watch: {
      account(account){
        for(let wallet of account.wallets) {
          this.$store.dispatch('wallet/getFullWallet', wallet._id);
        }
      },
      coins(newCoins){
        for(let coin of newCoins) {
          this.$store.dispatch('job/add', {
            name: `courseUpdater_${coin}`,
            execute: () => {
              this.$store.dispatch('course/update', {
                coin: coin, currency: 'EUR',
              });
            }
          });
        }
      }
    },
    created() {
      this.$store.dispatch('taxReport/getReport', this.$route.params.username);
      this.$store.dispatch('account/getAccount', this.$route.params.username);
    }
  };
</script>