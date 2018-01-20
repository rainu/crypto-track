<template>
  <vue-good-table
      title="Steuerreport"
      :columns="columns"
      :rows="report"
      :lineNumbers="true"
      :paginate="true"
      :ofText="'von'"
      :nextText="'Vor'"
      :prevText="'Zurück'"
      :rowsPerPageText="'Einträge pro Seite'"
      styleClass="table condensed table-bordered table-striped">
    <template slot="table-row" slot-scope="props">
      <td class="col-currency">
          {{props.row.amount.toFixed(8) | number}}
      </td>
      <td>{{props.row.currency}}</td>
      <td>{{report[props.row.originalIndex].buyDate | date}}</td>
      <td>{{report[props.row.originalIndex].sellDate | date}}</td>
      <td>{{props.row.short ? 'Short' : 'Long'}}</td>
      <td class="col-currency">{{props.row.sellPrice | fnumber}}</td>
      <td class="col-currency">{{props.row.buyPrice | fnumber}}</td>
      <td class="col-currency">{{props.row.profit | fnumber}}</td>
    </template>
  </vue-good-table>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';

  export default {
    data() {
      return {
        columns: [
          {
            label: 'Anzahl',
            field: 'amount',
            type: 'number',
          },
          {
            label: 'Währung',
            field: 'currency',
            type: 'string',
          },
          {
            label: 'Erwerbsdatum',
            field: function(row) {
              return moment(row.buyDate).unix();
            },
            type: 'number',
            sortable: true,
          },
          {
            label: 'Verkaufsdatum',
            field: function(row) {
              return moment(row.sellDate).unix();
            },
            type: 'number',
            sortable: true,
          },
          {
            label: 'Short/Long',
            field: 'short',
            type: 'boolean',
          },
          {
            label: 'Erlös in EUR',
            field: 'sellPrice',
            type: 'number',
          },
          {
            label: 'Kosten in EUR',
            field: 'buyPrice',
            type: 'number',
          },
          {
            label: 'Gewinn/Verlust in EUR',
            field: 'profit',
            type: 'number',
          },
        ]
      }
    },
    computed: {
      ...mapState({
        report: s => s.taxReport.report,
      }),
      totalSell() {
        let total = 0;
        for(let entry of this.report) {
          total += entry.sellPrice;
        }
        return total;
      },
      totalBuy(){
        let total = 0;
        for(let entry of this.report) {
          total += entry.buyPrice;
        }
        return total;
      },
      totalProfit(){
        let total = 0;
        for(let entry of this.report) {
          total += entry.profit;
        }
        return total;
      }
    },
    created() {
      this.$store.dispatch('taxReport/getReport', this.$route.params.username);
    }
  }
</script>

<style scoped>
  .col-currency {
    text-align: right;
  }
</style>