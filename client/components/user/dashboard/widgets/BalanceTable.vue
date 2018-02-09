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
        ],
        rows: []
      }
    },
    computed: {
      ...mapState({
        isStale: s => s.account.accountStale,
        coins: s => s.wallet.coins,
        courses: s => s.course.ticker,
      }),
      ...mapGetters({
        balances: 'wallet/balances',
      }),
    },
    methods: {
      calcRows() {
        let rows = [];

        if(this.isStale) {
          return rows;
        }

        let coins = this.coins.filter(coin => {
          // return this.balances[coin] > 0;
          return true;
        });

        for(let coin of coins) {
          let symbol = coin + this.counterValue;

          rows.push({
            coin: coin,
            amount: minToNormal(this.balances[coin], coin),
            value: this.courses[symbol] * minToNormal(this.balances[coin], coin),
            course: this.courses[symbol],
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