<template>
  <div>
    <v-btn
      tabindex="0" :aria-label="label"
      v-show="showBtn"
      :loading="loading"
      depressed
      @click="clickSave"
      :color="buttonColor"
      :outlined="ifSchemaOutlined"
      :class="['mx-1 save-btn',{'vc-button-custom-style': schema.revampSchema && schema.revampSchema[0] && schema.revampSchema[0].members}, classes]"
      tile
      type="submit"
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
    messageDialog: {
      default: {
        showMsg() {},
        showErr() {},
        showOptions() {},
      },
    },
    vcForm: {
      default: {        
        setAction() {},
        setCode(){},
        setButtonType() { }     
      },
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    ifSchemaOutlined() {
      if(this.schema.revampSchema && this.schema.revampSchema[0] && this.schema.revampSchema[0].members) {
        let buttonStyles = this.schema.revampSchema[0].members;
        return buttonStyles.find(item => {
          return item.name == "outlined";
        }).value;
      }else {
        return false;
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
    showBtn() {
      //如果文档已经被标记为删除状态，则不显示这个按钮
      if (this.model["Ng_SysIsDeleted"]) {
        return false;
      }

      return this.schema.show && this.isEdit;
    },
    order() {
      return this.schema.order || 20;
    },
    label() {
      return this.$te(this.localeKey + ".label") &&
        this.$t(this.localeKey + ".label")
        ? this.$t(this.localeKey + ".label")
        : this.$te('schema-base.defaultBtns.'+this.schema.label.toLowerCase()) ?
        this.$t('schema-base.defaultBtns.'+this.schema.label.toLowerCase()) :
        this.schema.label;
    },
  },
  methods: {
    ...mapMutations("app", ["setbuttonLoading"]),
    clickSave() {
      if (this.schema.click && Array.isArray(this.schema.click)) {
        this.eval(...this.schema.click);
      }

      this.loading = true;
      this["vcForm"].setCode(this.schema.name);
      this["vcForm"].setAction("save");
      this["vcForm"].setafterSubmit(this.schema.afterSubmit);
      this["vcForm"].setButtonType("system");
      this.setbuttonLoading(true);
    },
  },
  watch: {
    "$store.state.app.buttonLoading": function (newVal, oldVal) {
      this.loading = newVal;
    },
  }
};
</script>
<style>
.v-application .save-btn.vc-button-custom-style {
  border-radius: var(--c-borderRadius) !important;
  box-shadow: var(--c-shadow) !important;
  height: auto;
  min-height: 36px;
}
</style>