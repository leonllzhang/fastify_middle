<template>
  <div>
    <v-btn tabindex="0" depressed :aria-label="label"
     v-if="schema.show && permission" 
     :color="buttonColor" tile
     :outlined="ifSchemaOutlined"
      class="custom-btn" @click="click" :disabled="schema.disabled"
      :loading="loading" 
      :class="[{ 'icon-right': !left},
       {'vc-button-custom-style': schema.revampSchema && schema.revampSchema[0] && schema.revampSchema[0].members},
        schema.classes, 'btndefault', 'mx-1']" :type="type" 
      :style="[schema.style,computeStyle('',schema)]"
      :href="schema.href" :to="schema.to" v-show="showBtn" :target="schema.target || '_blank'">
      <v-icon v-if="schema.icon" :left="left" :right="!left">
        {{ getIcon() }}
      </v-icon>
      <span>{{ label }}</span>
    </v-btn>
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
       messageDialog: {
        default: {
          showErr() {},
        },
      },
      vcForm: {
        default: {
          validate() {},
          setAction() {},
          setButtonCodeSnippetFlag() {},
          submit() {},
          setafterSubmit() {},
          setButtonType() {},
          setClickErr(){},
          setPopup() {},
          setCode() {},
        },
      },
    },
    data(){
      return {
        loading: false
      }
    },
    watch: {
      // 需要设置deep属性才能响应全局buttonLoading的变化
      "$store.state.app.buttonLoading": {
        handler: function (newVal, oldVal) {
          this.loading = newVal;
        },
        deep: true
      },
    },
    methods: {
      ...mapMutations("app", ["setbuttonLoading", "setFloatingButtonItems"]),
      getIcon() {
        return (
          (this.schema.icon ?
            this.schema.icon.indexOf("pwc-") > -1 ?
            "pwc-icon " :
            "mdi " :
            "") + (this.schema.icon ? this.schema.icon : "")
        );
      },
      click(e) {
        try{
        let that = this;  
        that.loading = true;
        that.setbuttonLoading(true);
        if (that.schema.click && Array.isArray(that.schema.click)) {
          var clickFunc = this.generateFunction(that.schema.click).bind(this);
          let result = clickFunc();
          //如果return false 阻断
          if (result == false) {
            e && e.preventDefault();
            that.setbuttonLoading(false);
            return;
          }
        }

        if (that.schema.buttonId) {
          //如果存在C# Code,则需要触发后台请求，如果没有，则不触发.
          this["vcForm"].setCode(this.schema.name);
          that["vcForm"].setAction(that.schema.buttonId)
          that["vcForm"].setafterSubmit(that.schema.afterSubmit);
          that["vcForm"].setButtonType("custom");
          that["vcForm"].setButtonCodeSnippetFlag(that.schema.hasCodeSnippet ? true : false);
          that["vcForm"].setPopup(that.schema.enablePopup);
          //关闭custom button只写vue代码时候的loading
          if(!that.schema.hasCodeSnippet ) {
            that.setbuttonLoading(false)
            that.loading = false;
          };
          //关闭page上custom button写C#代码的loading
          let pageType =  that.options.pageType || 'root';
          if(that.$dm.currentPageType === 'page' && pageType === 'root'){
            that.setbuttonLoading(false)
            that.loading = false;
          } else if(that.$dm.currentPageType === 'page' && pageType === 'page') {
            that.setbuttonLoading(false)
            that.loading = false;
          }
        } else {
          that.setbuttonLoading(false);
        }
        if (
          that.schema.type &&
          that.schema.type.toLowerCase() == "customsubmit"
        ) {
          that.vcForm.submit();
        }
        }catch (err) {
          this.loading = false
          this.setbuttonLoading(false);
          this.schema.type = "button"
          this.messageDialog.showErr(err)
          this.vcForm.setClickErr(true);  
        }        
      },
      pushButtonToFloatingButton() {
        let icon = this.getIcon();
        if (icon) {
          let button = {
            name: this.schema.name,
            icon: this.getIcon(),
            target: this.schema.target || "_self",
            href: "",
            type: "custom",
            buttonType: (this.schema.type || "custom").toLowerCase(),
            click: this.schema.click,
            action: this.schema.action,
            click: this.schema.click,
          };
          this.setFloatingButtonItems(button);
        }
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
      showBtn() {
        //如果文档已经被标记为删除状态，则不显示这个按钮
        if (this.model["Ng_SysIsDeleted"]) {
          return false;
        }
        return this.schema.show;
      },
      left() {
        return this.schema.iconposition !== "right";
      },
      type() {
        return this.schema.type || "button";
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
            if (roles.indexOf(permissions[i]) > -1) {
              return true;
            }
          }
          return false;
        }
      },
    },
    mounted() {
      if (
        this.$store.state.app.buttinInQueryPage &&
        this.$vuetify.breakpoint.name == "xs"
      ) {
        this.pushButtonToFloatingButton();
        this.schema.show = false;
      }
    },
  };

</script>
<style>
.v-application .custom-btn.vc-button-custom-style {
  border-radius: var(--c-borderRadius) !important;
  box-shadow: var(--c-shadow) !important;
  height: auto;
  min-height: 36px;
}
</style>