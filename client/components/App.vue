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
        <grid-layout :layout="layout" :col-num="12">
          <grid-item :x="layout[0].x" :y="layout[0].y"
                     :w="layout[0].w" :h="layout[0].h"
                     :i="layout[0].i" :dragAllowFrom="'.box-header'"><box>
            <tax-report :report="taxReport"></tax-report>
          </box></grid-item>
        </grid-layout>
      </section>
    </div>
  </div>
</template>

<script>
  import TaxReport from "./TaxReport";

  export default {
    components: {
      TaxReport,
    },
    data: function () {
      return {
        gridSize: {
          w: 100, h: 100
        },
        layout: [
            {"x":0,"y":0,"w":12,"h":4,"i":"taxReport"},
        ],
        taxReport: []
      };
    },
    mounted: function () {
      let ctx = this;

      $.ajax({
        url: "/api/report/rainu",
      }).then((data) => {
        for (let entry of data) {
          entry.sellDate = moment(entry.sellDate);
          entry.buyDate = moment(entry.buyDate);
          ctx.taxReport.push(entry);
        }
      });
    }
  };
</script>