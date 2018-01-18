<template>
  <grid-layout :layout="layout" :col-num="12" :rowHeight="100">
    <grid-item :x="layout[0].x" :y="layout[0].y"
               :w="layout[0].w" :h="layout[0].h"
               :i="layout[0].i" :dragIgnoreFrom="'.drag-ignore'">
      <total-coins :wallets="wallets" :courses="courses"></total-coins>
    </grid-item>
    <grid-item :x="layout[1].x" :y="layout[1].y"
               :w="layout[1].w" :h="layout[1].h"
               :i="layout[1].i" :dragIgnoreFrom="'.drag-ignore'">
      <total-currencies :wallets="wallets"></total-currencies>
    </grid-item>
  </grid-layout>
</template>

<script>
  import TotalCoins from "./widgets/TotalCoins";
  import TotalCurrencies from "./widgets/TotalCurrencies";

  export default {
    name: "dashboard",
    components: {
      TotalCoins, TotalCurrencies
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
        ],
      };
    },
  }
</script>

<style scoped>

</style>