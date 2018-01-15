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
        <grid-layout :layout="layout" :col-num="12" :rowHeight="100">
          <grid-item :x="layout[0].x" :y="layout[0].y"
                     :w="layout[0].w" :h="layout[0].h"
                     :i="layout[0].i" :dragIgnoreFrom="'.drag-ignore'">
            <total-coins :wallets="account.wallets" :courses="courses"></total-coins>
          </grid-item>
          <grid-item :x="layout[1].x" :y="layout[1].y"
                     :w="layout[1].w" :h="layout[1].h"
                     :i="layout[1].i" :dragAllowFrom="'.box-header'"><box>
            <tax-report :report="account.taxReport"></tax-report>
          </box></grid-item>
        </grid-layout>
      </section>
    </div>
  </div>
</template>

<script>
  import TaxReport from "./TaxReport";
  import TotalCoins from "./TotalCoins";
  import { getReport } from "../js/service/report";
  import { getAccount } from "../js/service/account";
  import { getFullWallet } from "../js/service/wallet";

  export default {
    components: {
      TaxReport, TotalCoins
    },
    data: function () {
      return {
        gridSize: {
          w: 100, h: 100
        },
        layout: [
          {"x":0,"y":0,"w":3,"h":1,"i":"totalCoins"},
          {"x":0,"y":1,"w":12,"h":4,"i":"taxReport"},
        ],
        account: {
          name: "",
          wallets: [],
          taxReport: [],
        },
        courses: {
          'BTCEUR': 11513,
          'ETHEUR': 1075,
          'BCHEUR': 2026,
          'VIUEUR': 0.05,
          'OMGEUR': 18.86,
        }
      };
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
    mounted: function () {
      let ctx = this;

      getReport("rainu", (reportEntry) => {
        ctx.account.taxReport.push(reportEntry);
      });
      getAccount("rainu", (account) => {
        ctx.account.name = account.name;
        for(let wallet of account.wallets) {
          getFullWallet(wallet._id, (fullWallet) => {
            ctx.account.wallets.push(fullWallet);
          });
        }
      });
    }
  };
</script>