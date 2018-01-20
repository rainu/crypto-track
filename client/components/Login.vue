<template>
  <div class="login-box">
    <div class="login-logo">
      <router-link :to="{name: 'login'}"><b>CoinTrack</b></router-link>
    </div>
    <!-- /.login-logo -->
    <div class="login-box-body">
      <p class="login-box-msg">Anmelden</p>

      <div class="row">
        <div class="col-xs-12 form-group">
          <div class="input-group input-group-sm">
            <input class="form-control" v-model="selectedAccount">
            <div class="input-group-btn">
              <button
                  class="btn btn-default dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false">
                <i class="glyphicon glyphicon-user"></i><span></span>
              </button>
              <ul class="dropdown-menu">
                <li v-for="an in accountNames">
                  <a href="javascript:void(0)" @click="selectedAccount = an"><span>{{an}}</span></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-xs-offset-8 col-xs-4">
          <router-link
              tag="button"
              :to="link"
              class="btn btn-primary">Anmelden</router-link>
        </div>
      </div>

      <a href="#" class="text-center">Neuer Account</a>
    </div>
  </div>
</template>

<script>
  import { listAccounts } from '../js/service/account'

  export default {
    data(){
      return {
        accountNames: [],
        selectedAccount: '',
      }
    },
    computed: {
      link(){
        return {
          name: 'dashboard',
          params: {
            username: this.selectedAccount,
          },
        }
      }
    },
    created() {
      listAccounts(names => {
        this.accountNames = names;
      });
    }
  }
</script>