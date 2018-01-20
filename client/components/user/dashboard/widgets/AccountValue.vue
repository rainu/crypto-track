<template>
  <div class="info-box">
    <span class="info-box-icon bg-aqua"><i class="fa fa-balance-scale"></i></span>

    <div class="info-box-content">
      <span class="info-box-text">Account Gesamtwert</span>
      <span class="info-box-number drag-ignore">{{total | fnumber | euro}}</span>
    </div>
  </div>
</template>

<script>
  import {minToNormal, isCurrency} from '../../../../../server/src/model/currency'
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
        const currency = this.counterValue.toUpperCase();

        let total = 0;
        for(let coin of Object.keys(this.balances)) {
          let balance = this.balances[coin];
          let tag = coin + currency;

          if(this.courses.hasOwnProperty(tag)) {
            let course = this.courses[tag];
            total += minToNormal(balance, coin) * course;
          }
        }

        return total + minToNormal(this.balances[currency], currency);
      }
    }
  }
</script>