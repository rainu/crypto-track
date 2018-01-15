<template>
  <div class="box" v-show="show">
    <div class="box-header with-border">
      <h3 class="box-title">
        <slot name="title"></slot>
      </h3>
      <div class="box-tools pull-right">
        <button type="button" class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="" data-original-title="Minimieren"><i class="fa fa-minus"></i></button>
        <button type="button" class="btn btn-box-tool" @click="close()" data-toggle="tooltip" title="" data-original-title="Schließen"><i class="fa fa-times"></i></button>
      </div>
    </div>
    <div class="box-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      show: {
        type: Boolean,
        default: true,
      }
    },
    methods:{
      close: function(){
        this.show = false;
      },
    }
  }
</script>
