<template>
  <vue-good-table
      :columns="columns"
      :rows="rows"
      :lineNumbers="false"
      :paginate="true"
      :ofText="'von'"
      :nextText="'Vor'"
      :prevText="'Zurück'"
      :perPage="5"
      :rowsPerPageText="'Einträge pro Seite'"
      styleClass="table condensed table-bordered table-striped">
    <template slot="table-row" slot-scope="props">
      <td class="text-center">{{props.row.coin}} <i class="cc" :class="props.row.coin"></i></td>
      <td class="text-right">
        {{props.row.amount.toFixed(8) | number}}
      </td>
      <td class="text-right">{{props.row.value | fnumber}}</td>
      <td class="text-right">{{props.row.course | fnumber}}</td>
      <td class="text-right" :style="props.row.trends['1'] >= 0 ? 'color: green;' : 'color: red;'">{{props.row.trends['1'] | fnumber}} %</td>
      <td class="text-right" :style="props.row.trends['7'] >= 0 ? 'color: green;' : 'color: red;'">{{props.row.trends['7'] | fnumber}} %</td>
      <td class="text-right" :style="props.row.trends['30'] >= 0 ? 'color: green;' : 'color: red;'">{{props.row.trends['30'] | fnumber}} %</td>
    </template>
  </vue-good-table>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import {minToNormal} from '../../../../../server/web/src/model/currency'

  export default {
    props: {
      counterValue: {
        type: String,
        required: false,
        default: 'EUR',
      }
    },
    data() {
      return {
        columns: [
          {
            label: 'Währung',
            field: 'coin',
            type: 'string',
            sortable: true,
          },
          {
            label: 'Anzahl',
            field: 'amount',
            type: 'number',
            sortable: true,
          },
          {
            label: `Wert in ${this.counterValue}`,
            field: 'value',
            type: 'number',
            sortable: true,
          },
          {
            label: `Preis in ${this.counterValue}`,
            field: 'course',
            type: 'number',
            sortable: true,
          },
          {
            label: `Trend 24h`,
            field: 'trends.1',
            type: 'number',
            sortable: true,
          },
          {
            label: `Trend 7D`,
            field: 'trends.7',
            type: 'number',
            sortable: true,
          },
          {
            label: `Trend 30D`,
            field: 'trends.30',
            type: 'number',
            sortable: true,
          }
        ],
        rows: []
      }
    },
    computed: {
      ...mapState({
        isStale: s => s.account.accountStale,
        coins: s => s.wallet.coins,
        courses: s => s.course.ticker,
        historicalCourses: s => s.course.historical,
      }),
      ...mapGetters({
        balances: 'wallet/balances',
      }),
    },
    methods: {
      calcChange(symbol, days) {
        try {
          return this.courses[symbol] / this.historicalCourses[symbol][days - 1].course * 100 - 100;
        }catch(e){
          return 0;
        }
      },
      calcRows() {
        let rows = [];

        if(this.isStale) {
          return rows;
        }

        for(let coin of this.coins) {
          let symbol = coin + this.counterValue;

          rows.push({
            coin: coin,
            amount: minToNormal(this.balances[coin], coin),
            value: this.courses[symbol] * minToNormal(this.balances[coin], coin),
            course: this.courses[symbol],
            trends: {
              1: this.calcChange(symbol, 1),
              7: this.calcChange(symbol, 7),
              30: this.calcChange(symbol, 30)
            }
          });
        }
        return rows;
      }
    },
    watch: {
      isStale(){
        this.rows = this.calcRows();
      },
      courses(){
        this.rows = this.calcRows();
      }
    }
  }
</script>