<template>
<div v-if="ifBtn">
  <v-btn tabindex="0" :aria-label="label"
    v-show="showBtn"
    :color="buttonColor"
    :outlined="ifSchemaOutlined"
    class="mx-1 edit-btn"
    :class="{'vc-button-custom-style': schema.revampSchema && schema.revampSchema[0] && schema.revampSchema[0].members}"
    tile
    depressed
    @click="edit('Edit')"
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
    messageDialog: {
      default: {
        showMsg() {},
        showErr() {},
        showOptions() {},
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
        pageView: ''
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
      //console.log("showBtn", this.schema.show && !this.isEdit);
      return this.schema.show && !this.isEdit;
    },
    ifBtn() {

      if(this.$store.state.app.workflow && this.$store.state.app.workflow[this.options.pageView.toLowerCase()]) {
        let workflow = this.$store.state.app.workflow[this.options.pageView.toLowerCase()];
        return workflow.enableWorkflow && workflow.enableEditMode;
      }else{
        return true;
      }
    },
    order() {
      return this.schema.order || 10;
    },
  },
  methods: {
    edit() {
      if (this.schema.click && Array.isArray(this.schema.click)) {
        this.eval(...this.schema.click);
      }
      if(this.vcForm.isCurrentPageView) {
        this.switchPageMode("Edit");
      } else {
        if (this.options.loadType == 'embed') {
          this.options.commonMethod.changeSchemasAndModel(this.options.pageCode, "form", "Edit", this.options.id);
        } else {
          //popup form or wrapper form
          this.popupForm.swithPageMode({
            pageView: this.vcForm.pageView,
            pageMode: "Edit"
          });
        }

      }

    },
  },
};
</script>

<style>
.v-application .edit-btn.vc-button-custom-style {
  border-radius: var(--c-borderRadius) !important;
  box-shadow: var(--c-shadow) !important;
  height: auto;
  min-height: 36px;
}
</style>
