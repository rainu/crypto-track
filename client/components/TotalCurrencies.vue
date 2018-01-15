f<template>
  <div class="info-box">
    <span class="info-box-icon bg-aqua"><i class="fa fa-euro"></i></span>

    <div class="info-box-content">
      <span class="info-box-text">Gesamtwert aller Währungen</span>
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
      currency: {
        type: String,
        required: false,
        default: 'EUR',
      }
    },
    data(){
      return {
      };
    },
    computed: {
      total() {
        let total = 0;
        for (let wallet of this.wallets) {
          if (wallet.balances[this.currency]) {
            total += wallet.balances[this.currency]
          }
        }

        return minToNormal(total, this.currency);
      }
    }
  }
</script>