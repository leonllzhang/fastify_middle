<template>
  <div>
    <v-btn
      tabindex="0" :aria-label="label"
      tile
      depressed
      :loading="loading"
      :type="schema.type || 'button'"
      :color="buttonColor"
      :outlined="ifSchemaOutlined"
      :active-class="schema.activeClass"
      v-show="showBtn"
      v-if="ifBtn"
      class="workflow-btn"
      @click="click"
      :style="[schema.style,computeStyle('',schema)]"
      :class="[schema.classes,{'vc-button-custom-style': schema.revampSchema && schema.revampSchema[0] && schema.revampSchema[0].members},'mx-1' ]"
    >
      <v-icon v-if="schema.icon" left>{{schema.icon}}</v-icon>
      {{label}}
    </v-btn>
  </div>
</template>

<script>
import base from "../utils/form-base";
import queryBase from "../utils/query-base";
import { mapMutations } from "vuex";
export default {
  mixins: [base, queryBase],
  inject: {
    vcForm: {
      default: {
        setCode(){},
        validate() {},
        setAction() {},
        submit() {},
        setButtonType() { },
        setafterSubmit() { },
        setPopup() { },
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

      //需要考虑以下几点：1. currentworkflowrole,2.currentworkflowuser,3.statebindaction(这个在外层做) 4.schema上的 showCondition
      var showCondition = this.schema.showCondition;
      if (showCondition && Array.isArray(showCondition)) {
        return this.eval(...showCondition);
      }
      return true;
    },
    ifBtn() {
      //现在workflowbutton中存储了buttonID，为了兼容旧数据，需要，buttonid 或者 action 能匹配上就能显示。
      //20211105-01387 workflow 的 状态需要区分form，不然会混淆。     
      if(this.$store.state.app.workflow && this.$store.state.app.workflow[this.options.pageView.toLowerCase() ]) {
        let currentFormWorkflow = this.$store.state.app.workflow[this.options.pageView.toLowerCase()];
        if(currentFormWorkflow.workflowStates && currentFormWorkflow.workflowStates.length > 1){

            for(let i =0;i<currentFormWorkflow.workflowStates.length;i++){
              let x = currentFormWorkflow.workflowStates[i];
              let result = (
                      x.showWorkflowButton &&
                      x.actionCodeList &&
                      (x.actionCodeList.indexOf(
                        this.schema.buttonId
                      ) >= 0 ||
                      x.actionCodeList.indexOf(
                        this.schema.action
                      ) >= 0) &&
                      x.showWorkflowButton &&
                      !currentFormWorkflow.isEndState &&
                      this.permission
                    );
              if(result){
                return true;
              }
            }
            return false;
        }
        else{
          let result = (
            currentFormWorkflow.showWorkflowButtons &&
            currentFormWorkflow.currentActionCodeList &&
            ( currentFormWorkflow.currentActionCodeList.indexOf(
              this.schema.buttonId
            ) >= 0 ||
              currentFormWorkflow.currentActionCodeList.indexOf(
              this.schema.action
            ) >= 0) &&
            currentFormWorkflow.showWorkflowButtons &&
            !currentFormWorkflow.isEndState &&
            this.permission
          );
          return result;
        }

      }
      else{
        return false;
      }

    },
    order() {
      return this.schema.order;
    },
    permission() {
      let roles = this.userInfo.roles;
      let permissions = this.schema.permission || [];
      if (permissions.length == 0) {
        return true;
      } else {
        for (let i in permissions) {
          if (roles.indexOf(permissions[i]) > -1 || (this.model['delegateRoles'] && this.model['delegateRoles'].length && this.model['delegateRoles'].indexOf(permissions[i]) > -1)) {
            return true;
          }
        }
        return false;
      }
    },
  },
  methods: {
    ...mapMutations("app", ["setbuttonLoading"]),
    click(e) {
      this.loading = true;
      this.setbuttonLoading(true);
      if (this.schema.click && Array.isArray(this.schema.click)) {
        var clickFunc = this.generateFunction(this.schema.click).bind(this);
          let result = clickFunc();
        //如果return false 阻断
          if (result == false) {
            e && e.preventDefault();
            this.setbuttonLoading(false);
            this.loading = false;
            return;
          }
      }
      if (this.schema.action) {
        this["vcForm"].setCode(this.schema.name);
        this["vcForm"].setAction(this.schema.action);
        this["vcForm"].setafterSubmit(this.schema.afterSubmit);
        this["vcForm"].setButtonType('workflow');
        this["vcForm"].setPopup(this.schema.enablePopup);
      }

    },
  },
    watch: {
    "$store.state.app.buttonLoading": function (newVal, oldVal) {
      this.loading = newVal;
    },
  },
};
</script>

<style lang="scss">
.v-application .workflow-btn.vc-button-custom-style {
  border-radius: var(--c-borderRadius) !important;
  box-shadow: var(--c-shadow) !important;
  height: auto;
  min-height: 36px;
  .v-btn__content {
    line-height: var(--c-lineHeight) !important;
  }
}
</style>
