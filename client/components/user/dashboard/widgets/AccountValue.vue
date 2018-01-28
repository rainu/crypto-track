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
  import {accountValue} from '../../../../js/calc'
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
        courses: s => s.course.ticker,
      }),
      total() {
        return accountValue(this.balances, this.courses, this.counterValue);
      }
    }
  }
</script>