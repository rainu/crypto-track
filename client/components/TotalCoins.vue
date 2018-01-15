<template>
  <div class="info-box">
    <span class="info-box-icon bg-aqua"><i class="fa fa-bitcoin"></i></span>

    <div class="info-box-content">
      <span class="info-box-text">Gesamtwert aller Coins</span>
      <span class="info-box-number drag-ignore">{{total | fnumber | euro}}</span>
    </div>
  </div>
</template>

<script>
  import {minToNormal, normalToMin} from '../../server/src/model/currency'

  export default {
    props: {
      wallets:{
        type: Object,
        required: true,
      },
      courses: {
        type: Object,
        required: true,
      },
      counterValue: {
        type: String,
        required: false,
        default: 'EUR',
      }
    },
    data(){
      return {
        blacklist: ['EUR']
      };
    },
    computed: {
      balances() {
        let balances = {};
        for(let wallet of this.wallets) {
          for(let coin of Object.keys(wallet.balances)){
            if(this.blacklist.includes(coin)) continue; //skip blacklisted coins

            if(!balances.hasOwnProperty(coin)) {
              balances[coin] = 0;
            }

            balances[coin] += wallet.balances[coin];
          }
        }

        return balances;
      },
      total() {
        let total = 0;
        const balances = this.balances;
        for(let coin of Object.keys(balances)) {
          let balance = balances[coin];
          let tag = coin + this.counterValue.toUpperCase();

          if(this.courses.hasOwnProperty(tag)) {
            let course = this.courses[tag];
            total += minToNormal(balance, coin) * course;
          }
        }
        return total;
      }
    }
  }
</script>