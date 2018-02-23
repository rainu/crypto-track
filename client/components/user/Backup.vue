<template>
  <div class="row">
    <message-error v-show="downloadError">{{downloadError}}</message-error>
    <message-error v-show="uploadError">{{uploadError}}</message-error>
    <message-success v-show="uploadSuccess">{{uploadSuccess}}</message-success>

    <div class="col-md-6">
      <div class="info-box">
        <span class="info-box-icon bg-aqua"><i class="fa fa-cloud-upload"></i></span>

        <div class="info-box-content">
          <form role="form" class="form" onsubmit="return false;">
            <div class="form-group">
              <input id="file" type="file" @change="onFileChange" />
            </div>
            <button class="btn btn-lg btn-primary btn-block" @click="upload">Upload</button>
          </form>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="info-box">
        <span class="info-box-icon bg-aqua"><i class="fa fa-download"></i></span>

        <div class="info-box-content">
          <button class="btn btn-lg btn-primary btn-block" @click="download">Download</button>
        </div>
      </div>
    </div>

    <a class="download-link"></a>
  </div>
</template>

<script>
  import axios from './../../js/backend.js';
  import HttpStatus from 'http-status-codes';
  import { mapState } from 'vuex';

  export default {
    name: "backup",
    data(){
      return {
        files: [],
        downloadError: '',
        uploadError: '',
        uploadSuccess: '',
      }
    },
    computed: {
      ...mapState({
        account: state => state.account.account,
      }),
    },
    methods:{
      onFileChange(e) {
        this.files = e.target.files || e.dataTransfer.files;
      },
      upload(){
        if (!this.files.length) return;
        this.uploadError = '';
        this.uploadSuccess = '';

        let data = new FormData();
        data.append('file', this.files[0]);

        axios.put(`/backup/${this.account.username}`, data).then((response) => {
          if(response && response.status === HttpStatus.CREATED) {
            this.uploadSuccess = 'Einspielen des Backups war erfolgreich.';
          } else {
            this.uploadError = 'Einspielen des Backups fehlgeschlagen. Die Datei scheint beschädigt zu sein.';
          }
        }).catch(err => {
          this.uploadError = `Einspielen des Backups fehlgeschlagen. ${err}`;
        });
      },
      download(){
        this.downloadError = '';

        axios.get(`/backup/${this.account.username}`).then((response) => {
          let blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'text/json' } );
          let link = this.$el.querySelector('a.download-link');
          link.href = window.URL.createObjectURL(blob);
          link.download = `cryptotrack_backup_${this.account.username}.json`;
          link.click();
        }).catch(err => {
          this.downloadError = `Es konnte kein Backup geladen werden! Fehler: ${err}`;
        });
      }
    }
  }
</script>

<style scoped>
 a.download-link {
   display:none;
 }
</style>