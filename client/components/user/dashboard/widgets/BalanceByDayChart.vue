<template>
  <div class="small">
    <line-chart :chart-data="chartData" :options="options"></line-chart>
  </div>
</template>

<script>
  import LineChart from '../../../chart/ReactiveLine'
  import {number as formatNumber} from '../../../../js/filter'
  import {totalCoinValue, accountValue} from '../../../../js/calc'
  import {minToNormal} from '../../../../../server/web/src/model/currency'
  import {mapGetters, mapState} from 'vuex';

  export default {
    components:{
      LineChart
    },
    props: {
      title: {
        type: String,
        required: false,
        default: 'Wert pro Währung in EUR',
      },
      counterValue: {
        type: String,
        required: false,
        default: 'EUR',
      },
      options: {
        required: false,
        default: {
          maintainAspectRatio: false,
          spanGaps: true,
          animation: {
            duration: 0, // general animation time
          },
          responsiveAnimationDuration: 0, // animation duration after a resize
          tooltips: {
            displayColors: false,
            callbacks: {
              title(tpItem, data){
                return moment(tpItem[0].xLabel).format('dddd, DD MMM YYYY');
              },
              beforeLabel(tpItem, data){
                const i = tpItem.index;
                const account = formatNumber(data.datasets[2].data[i]);
                const accountTitle = data.datasets[2].label;
                return `${accountTitle}: ${account} €`;
              },
              label(tpItem, data){
                const i = tpItem.index;
                const currency = formatNumber(data.datasets[1].data[i]);
                const currencyTitle = data.datasets[1].label;
                return `${currencyTitle}: ${currency} €`;
              },
              afterLabel(tpItem, data){
                const i = tpItem.index;
                const coin = formatNumber(data.datasets[0].data[i]);
                const coinTitle = data.datasets[0].label;
                return `${coinTitle}: ${coin} €`;
              },
            },
            intersect: false,
          },
          scales:{
            xAxes: [{
              type: 'time',
              time: {
                displayFormats: {
                  'millisecond': 'DD.MM.YYYY',
                  'second': 'DD.MM.YYYY',
                  'minute': 'DD.MM.YYYY',
                  'hour': 'DD.MM.YYYY',
                  'day': 'DD.MM.YYYY',
                  'week': 'DD.MM.YYYY',
                  'month': 'DD.MM.YYYY',
                  'quarter': 'DD.MM.YYYY',
                  'year': 'DD.MM.YYYY',
                }
              }
            }],
          },
          elements: {
            line: {
              tension: 0, // disables bezier curves
            },
            point: {
              hoverRadius: 10,
              pointHitRadius: 50,
            }
          },
          plugins: {
            datalabels: {
              display: false
            }
          }
        }
      }
    },
    computed: {
      ...mapState({
        coins: s => s.wallet.coins,
        currencies: s => s.wallet.currencies,
        courses: s => s.course.historical,
      }),
      ...mapGetters({
        balances: 'wallet/balances',
        hasOpenCalls: 'call/hasOpenCalls',
      }),
      chartData() {
        let data = {
          labels: [],
        };

        let totalCoinDS = {
          label: 'Coins',
          backgroundColor: 'rgba(0, 128, 0, 0.5)',
          borderColor: '#008000',
          fill: true,
          data: [],
        };
        let totalCurrencyDS = {
          label: 'Währungen',
          backgroundColor: 'rgba(0, 128, 128, 0.5)',
          borderColor: '#008080',
          fill: true,
          data: [],
        };
        let accountValueDS = {
          label: 'Account Gesamtwert',
          backgroundColor: 'rgba(128, 0, 0, 0.5)',
          borderColor: '#800000',
          fill: true,
          data: [],
        };
        data.datasets = [];
        data.datasets.push(totalCoinDS, totalCurrencyDS, accountValueDS);

        for (let i = 60; i >= 0; i--) {
          const curDate = moment().add(i * -1, 'days').toDate();
          let dayCourses = {};
          let dayBalances = this.$store.getters['wallet/filteredBalances'](null, curDate);

          for (let coin of this.coins) {
            let symbol = coin.toUpperCase() + this.counterValue.toUpperCase();

            if (this.courses[symbol]) {
              try {
                dayCourses[symbol] = this.courses[symbol][i].course;
              } catch (err) {
                dayCourses[symbol] = 0;
              }
            }
          }

          data.labels.push(curDate);
          totalCoinDS.data.push(totalCoinValue(dayBalances, dayCourses, this.counterValue));
          totalCurrencyDS.data.push(minToNormal(dayBalances[this.counterValue], this.counterValue));
          accountValueDS.data.push(accountValue(dayBalances, dayCourses, this.counterValue));
        }

        return data;
      }
    },
  }
</script>

<style scoped>

</style>