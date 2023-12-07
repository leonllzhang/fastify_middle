<template>
<div v-if="!(options && options.loadType && options.loadType ==='embed')">
  <v-btn
    tabindex="0" :aria-label="label" 
    v-show="showBtn"
    :color="buttonColor"
    :outlined="ifSchemaOutlined"
    class="mx-1 close-btn"
    :class="{'vc-button-custom-style': schema.revampSchema && schema.revampSchema[0] && schema.revampSchema[0].members}"
    tile
    @click="closeConfrim()"
    type="button"
    :style="[schema.style,computeStyle('',schema)]"
  >{{label}}</v-btn>
</div>
  
</template>

<script>
import base from "../utils/form-base";
import queryBase from "../utils/query-base";
import { mapMutations } from "vuex";
export default {
  mixins: [base, queryBase],
  inject: {
    popupWrapper: {
      default: {
        close() {},
      },
    },
    vcForm: {
      default: {
        isCurrentPageView: true,
      },
    },
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
      return this.schema.show;
    },
    order() {
      return this.schema.order || 40;
    },
  },
  methods: {
    closeConfrim(){
      let dialogContent = {
        message:this.$t("schema-base.defaultBtns.closeTip"),
        mode:"confirm",
        fn:this.close,
        fnCancel: true
      };
      this.messageDialog.showMsg(dialogContent);
    },
    close() {
      if (this.schema.click && Array.isArray(this.schema.click)) {
        this.eval(...this.schema.click);
      }

        if (this.vcForm.isCurrentPageView) {
          var userAgent = navigator.userAgent;
          if (
            userAgent.indexOf("Firefox") != -1 ||
            userAgent.indexOf("Chrome") != -1
          ) {
            window.location.href = "about:blank";
            //针对debugging mode有 iframe
            top.opener = null;
            top.close();
            parent.close();
            window.close();
          } else {
            window.opener = null;
            window.open("", "_self");
            //针对debugging mode有 iframe
            top.opener = null;
            top.close();
            parent.close();
            window.close();
          }
        } else {
          this.popupWrapper.close();
        }
      },
    },
  };

</script>

<style>
.v-application .close-btn.vc-button-custom-style {
  border-radius: var(--c-borderRadius) !important;
  box-shadow: var(--c-shadow) !important;
  height: auto;
  min-height: 36px;
}
</style>
