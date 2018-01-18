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
        <dashboard :wallets="account.wallets" :courses="courses"></dashboard>
      </section>
    </div>
  </div>
</template>

<script>
  import Dashboard from "./dashboard/Dashboard"
  import TaxReport from "./TaxReport";
  import { Scheduler } from "../js/service/scheduler";
  import { getReport } from "../js/service/report";
  import { getAccount } from "../js/service/account";
  import { getFullWallet } from "../js/service/wallet";
  import { getCourse } from "../js/service/course";

  export default {
    components: {
      Dashboard, TaxReport
    },
    data: function () {
      return {
        account: {
          name: "",
          wallets: [],
          coins: [],
          taxReport: [],
        },
        courses: {},
        services: {
          scheduler: new Scheduler(),
        }
      };
    },
    methods: {
      updateCourse(coin){
        const ctx = this;
        getCourse(coin, 'EUR', (course) => {
          const symbol = coin.toUpperCase() + 'EUR';
          ctx.$set(ctx.courses, symbol, course.course);
        });
      }
    },
    computed: {
      transactions() {
        let tx = [];
        for(let wallet of this.account.wallets) {
          tx.push(...wallet.transactions);
        }
        return tx;
      }
    },
    created() {
      // let ctx = this;
      this.services.scheduler.executeJob('getReport', () => {
        getReport("rainu", (reportEntry) => {
          this.account.taxReport.push(reportEntry);
        });
      });

      this.services.scheduler.executeJob('getAccount', () => {
        getAccount("rainu", (account) => {
          this.account.name = account.name;
          for(let wallet of account.wallets) {

            this.services.scheduler.executeJob('getAccount' + wallet.address, () => {
              getFullWallet(wallet._id, (fullWallet) => {
                for(let coin of fullWallet.coins) {
                  if(!this.account.coins.includes(coin)){
                    this.account.coins.push(coin);

                    //enable job
                    this.services.scheduler.enableJob('updateCourse_' + coin, 60000, () => {
                      this.updateCourse(coin);
                    });
                  }
                }
                this.account.wallets.push(fullWallet);
              });
            });

          }
        });
      });
    }
  };
</script>