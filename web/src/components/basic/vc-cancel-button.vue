<template>
  <div v-if="!(options && options.loadType && options.loadType ==='embed')">
    <v-btn 
           tabindex="0" :aria-label="label" 
           v-show="showBtn"
           class="mx-1 cancel-btn"
           :class="{'vc-button-custom-style': schema.revampSchema && schema.revampSchema[0] && schema.revampSchema[0].members}"
           :color="buttonColor"
           :outlined="ifSchemaOutlined"
           tile
           @click="cancel()"
           type="button"
           :style="[schema.style,computeStyle('',schema)]">{{label}}</v-btn>
  </div>
</template>

<script>
  import base from "../utils/form-base";
  import queryBase from "../utils/query-base";
  import {
    mapMutations
  } from "vuex";
  export default {
    mixins: [base, queryBase],
    inject: {
      popupWrapper: {
        default: {
          close() {},
        },
      },
      popupForm: {
        default: {
          reload() {},

      },
    },
    vcForm: {
      default: {
        isCurrentPageView: true,
      },
    },
  },
  methods: {
    cancel() {
      if (this.schema.click && Array.isArray(this.schema.click)) {
        this.eval(...this.schema.click);
      }
      this.cancelConfrim()
    },
    cancelConfrim(){
      let dialogContent = {
        message:this.$t("schema-base.defaultBtns.cancelTip"),
        fn:this.cancel,
        fnCancel: true,
        //App.vue取消ok按钮需要增加两个参数 by Kangta
        isCurrentPageView: this.vcForm.isCurrentPageView,
        alertConfirm:this.cancelAlertConfirm
      };
      this.messageDialog.canCancelConfirm(dialogContent);
    },
    cancelAlertConfirm(){
      this.popupForm.swithPageMode({
        pageView: this.vcForm.pageView,
        pageMode: "Preview"
      });
    }
  },
  computed: {
    ifSchemaOutlined() {
      if(this.schema.revampSchema && this.schema.revampSchema[0] && this.schema.revampSchema[0].members) {
        let buttonStyles = this.schema.revampSchema[0].members;
        return buttonStyles.find(item => {
          return item.name == "outlined";
        }).value;
      }else {
        return true;
      }
    },
    buttonColor() {
      if(this.schema.revampSchema && this.schema.revampSchema[0] && this.schema.revampSchema[0].members){
          let buttonStyles = this.schema.revampSchema[0].members;
          let value = buttonStyles.find(item => {return item.name == "buttonColor"}).value;
          if(typeof value == 'string'){
            return value;
          }else {
            return value.color;
          }
      }else {
        return "primary";
      }
    },
    label() {
      return this.$te(this.localeKey + ".label") &&
        this.$t(this.localeKey + ".label")
        ? this.$t(this.localeKey + ".label")
        : this.$te('schema-base.defaultBtns.'+this.schema.label.toLowerCase()) ?
        this.$t('schema-base.defaultBtns.'+this.schema.label.toLowerCase()) :
        this.schema.label;
    },
    showBtn() {
      //如果文档已经被标记为删除状态，则不显示这个按钮
      if (this.model["Ng_SysIsDeleted"]) {
        return false;
      }
      return (this.schema.show && this.options.pageMode !== undefined && this.options.pageMode.toLowerCase() == 'edit') || (this.schema.show && this.$route.name == "Edit" && this.options.pageMode == undefined);
    },
    order() {
      return this.schema.order || 30;
    },
  },
};
</script>

<style>
.v-application .cancel-btn.vc-button-custom-style {
  border-radius: var(--c-borderRadius) !important;
  box-shadow: var(--c-shadow) !important;
  height: auto;
  min-height: 36px;
}
</style>
