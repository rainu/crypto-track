<template>
  <grid-layout :layout="layout" :col-num="12" :rowHeight="100">
    <grid-item :x="layout[0].x" :y="layout[0].y"
               :w="layout[0].w" :h="layout[0].h"
               :i="layout[0].i" :dragIgnoreFrom="'.drag-ignore'">
      <total-coins :balances="balances" :courses="courses"></total-coins>
    </grid-item>
    <grid-item :x="layout[1].x" :y="layout[1].y"
               :w="layout[1].w" :h="layout[1].h"
               :i="layout[1].i" :dragIgnoreFrom="'.drag-ignore'">
      <total-currency :balances="balances"></total-currency>
    </grid-item>
    <grid-item :x="layout[2].x" :y="layout[2].y"
               :w="layout[2].w" :h="layout[2].h"
               :i="layout[2].i" :dragIgnoreFrom="'.drag-ignore'">
      <account-value :balances="balances" :courses="courses"></account-value>
    </grid-item>
  </grid-layout>
</template>

<script>
  import AccountValue from "./widgets/AccountValue";
  import TotalCoins from "./widgets/TotalCoins";
  import TotalCurrency from "./widgets/TotalCurrency";

  export default {
    name: "dashboard",
    components: {
      AccountValue, TotalCoins, TotalCurrency
    },
    props: {
      gridSize: {
        type: Object,
        default: {
          w: 100, h: 100
        }
      },
      wallets: {
        type: Object,
        required: true
      },
      courses: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        layout: [
          {"x":0,"y":0,"w":3,"h":1,"i":"totalCoins"},
          {"x":3,"y":0,"w":3,"h":1,"i":"totalCurrencies"},
          {"x":6,"y":0,"w":3,"h":1,"i":"accountValue"},
        ],
      };
    },
    computed: {
      balances() {
        let balances = {};
        for(let wallet of this.wallets) {
          for(let coin of Object.keys(wallet.balances)){
            if(!balances.hasOwnProperty(coin)) {
              balances[coin] = 0;
            }

            balances[coin] += wallet.balances[coin];
          }
        }

        return balances;
      },
    }
  }
</script>

<style scoped>

</style>