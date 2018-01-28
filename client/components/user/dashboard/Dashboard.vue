<template>
  <grid-layout :layout="layout" :col-num="12" :rowHeight="100">
    <grid-item :x="layout[0].x" :y="layout[0].y"
               :w="layout[0].w" :h="layout[0].h"
               :i="layout[0].i" :dragIgnoreFrom="'.drag-ignore'">
      <total-coins></total-coins>
    </grid-item>
    <grid-item :x="layout[1].x" :y="layout[1].y"
               :w="layout[1].w" :h="layout[1].h"
               :i="layout[1].i" :dragIgnoreFrom="'.drag-ignore'">
      <total-currency></total-currency>
    </grid-item>
    <grid-item :x="layout[2].x" :y="layout[2].y"
               :w="layout[2].w" :h="layout[2].h"
               :i="layout[2].i" :dragIgnoreFrom="'.drag-ignore'">
      <account-value></account-value>
    </grid-item>
    <grid-item :x="layout[3].x" :y="layout[3].y"
               :w="layout[3].w" :h="layout[3].h"
               :i="layout[3].i" :dragIgnoreFrom="'.drag-ignore'">
      <box>
        <span slot="title">Wert pro Währung</span>
        <balance-chart></balance-chart>
      </box>
    </grid-item>
    <grid-item :x="layout[4].x" :y="layout[4].y"
               :w="layout[4].w" :h="layout[4].h"
               :i="layout[4].i" :dragIgnoreFrom="'.drag-ignore'">
      <box>
        <span slot="title">Bilanz nach Tagen</span>
        <balance-by-day-chart></balance-by-day-chart>
      </box>
    </grid-item>
  </grid-layout>
</template>

<script>
  import AccountValue from "./widgets/AccountValue";
  import TotalCoins from "./widgets/TotalCoins";
  import TotalCurrency from "./widgets/TotalCurrency";
  import BalanceChart from "./widgets/BalanceChart";
  import BalanceByDayChart from "./widgets/BalanceByDayChart";

  export default {
    name: "dashboard",
    components: {
      AccountValue, TotalCoins, TotalCurrency, BalanceChart, BalanceByDayChart
    },
    props: {
      gridSize: {
        type: Object,
        default: {
          w: 100, h: 100
        }
      },
    },
    data: function () {
      return {
        layout: [
          {"x":0,"y":0,"w":3,"h":1,"i":"totalCoins"},
          {"x":3,"y":0,"w":3,"h":1,"i":"totalCurrencies"},
          {"x":6,"y":0,"w":3,"h":1,"i":"accountValue"},
          {"x":0,"y":1,"w":2,"h":3,"i":"balanceChart"},
          {"x":2,"y":1,"w":7,"h":5,"i":"balanceByDayChart"},
        ],
      };
    },
  }
</script>

<style scoped>

</style>