<template>
  <div class="small">
    <pie-chart :chart-data="chartData" :options="options"></pie-chart>
  </div>
</template>

<script>
  import PieChart from '../../../chart/ReactivePie'
  import {minToNormal} from '../../../../../server/web/src/model/currency'
  import {mapGetters, mapState} from 'vuex';
  import randomColor from 'randomcolor'

  export default {
    components: {
      PieChart
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
      colors: {
        type: [String],
        required: false,
        default: [
          '#C0C0C0',
          '#008080',
          '#00FFFF',
          '#808000',
          '#000080',
          '#800000',
          '#0000FF',
          '#008000',
          '#808080',
          '#00FF00',
          '#FFFF00',
          '#FF00FF',
          '#FF0000',
          '#800080',
        ],
      },
      options: {
        required: false,
        default: {
          tooltips: {
            callbacks: {
              label(tpItem, data){
                return data.datasets[0].labels[tpItem.index];
              },
              afterLabel(tpItem, data){
                return data.datasets[0].footers[tpItem.index];
              }
            }
          },
          legend: {
            position: 'bottom'
          },
          plugins: {
            datalabels: {
              anchor: 'center',
              align: 'top',
              backgroundColor: '#FFFFFF',
              borderColor: '#909090',
              borderWidth: 2,
              borderRadius: 90,
              // offset: 100,
              font: {
                weight: 'bold',
              },
              formatter(value, ctx) {
                return ctx.dataset.datalabels[ctx.dataIndex];
              }
            }
          }
        }
      }
    },
    computed: {
      ...mapState({
        coins: s => s.wallet.coins,
        courses: s => s.course.ticker,
      }),
      ...mapGetters({
        balances: 'wallet/balances',
      }),
      chartData() {
        let data = {};
        data.labels = this.coins.filter(coin => {
          return this.balances[coin] > 0;
        });

        let datasetData = [];
        let dataLabels = [];
        let dataDataLabels = [];
        let dataFooters = [];
        let total = 0;
        for(let coin of data.labels){
          let value = minToNormal(this.balances[coin], coin) * this.courses[coin + this.counterValue];
          value = value.toFixed(2);
          total += parseFloat(value);

          datasetData.push(value);
          dataLabels.push(`${coin}: ${value} ${this.counterValue}`);
        }
        for(let i in datasetData){
          let percent = datasetData[i] * 100 / total;
          percent = percent.toFixed(2);

          dataDataLabels.push(`${percent}%`);
          dataFooters.push(`(${percent}% von Gesamt)`);
        }

        let colors = []; colors.push(...this.colors);
        if(data.labels.length > colors.length) {
          //we dont have enough colors: so generate some one
          colors.push(...randomColor({
            count: data.labels.length - colors.length,
          }))
        }

        data.datasets = [{
          label: this.title,
          backgroundColor: colors.slice(0, data.labels.length),
          data: datasetData,
          labels: dataLabels,
          footers: dataFooters,
          datalabels: dataDataLabels,
        }];

        return data;
      }
    }
  }
</script>

<style scoped>

</style>