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
  import {minToNormal, isCurrency} from '../../../../../server/web/src/model/currency'
  import { mapState, mapGetters, mapActions } from 'vuex';

  export default {
    props: {
      counterValue: {
        type: String,
        required: false,
        default: 'EUR',
      }
    },
    computed: {
      ...mapGetters({
        balances: 'wallet/balances',
      }),
      ...mapState({
        courses: s => s.course.courses,
      }),
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