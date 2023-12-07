<template>
  <div v-if="permission">
    <v-btn tabindex="0" depressed :aria-label="label" v-show="showBtn" 
      :color="buttonColor"
      :outlined="ifSchemaOutlined"
      tile class="delete-btn"
      @click="click" :disabled="schema.disabled"
      :class="[{ 'icon-right': !left },{'vc-button-custom-style': schema.revampSchema && schema.revampSchema[0] && schema.revampSchema[0].members},
       schema.classes, 'mx-1', 'btndefault']" :type="type" 
      :style="[schema.style,computeStyle('',schema)]"
      :href="schema.href" :to="schema.to" :target="schema.target || '_blank'">
      <v-icon v-if="schema.icon" :left="left" :right="!left">
        {{
        schema.icon
        }}
      </v-icon>
      <span>{{label}}</span>
    </v-btn>
  </div>
</template>

<script>
  import appInfo from "../../utils/appInfo";
  import base from "../utils/form-base";


  let app = appInfo();

  export default {
    mixins: [base],
    data() {
      return {
        isHardDelete: false
      }
    },
    inject: {
      messageDialog: {
        default: {
          showMsg() {},
          showErr() {},
          showOptions() {},
        },
      },
    },
    methods: {
      click() {
        return this.messageDialog.showMsg({
          title: "",
          message: this.$t("vc.form.deleteConfirmMessage"),
          mode: "confirm",
          fn: this.deletefun,
          fnCancel: this.deleteCancel,
        });
      },
      deletefun() {
        let self = this;
        self.$axios
          .post(
            '/api/PostJObjectResult',
            {
              requestURL: `${self.pageView}/doc/${self.isHardDelete ? 'harddel' : 'softdel'}/${self.$route.params.id}/${self.schema.name}`
            }
          )
          .then(({
            data
          }) => {
            if (data.error) {
              let errorMsg = '';
              switch (data.error.code.toLowerCase()) {
                case "document_notfound":
                  errorMsg = self.$t("error.docDoesNotExist");
                  break;
                case "document_notallowed":
                  errorMsg = self.$t("error.docHaveBeenDeleted");
                  break;
                default:
                  errorMsg = self.$t("error.deleteErrorMessage");
                  break;
              }
              this.messageDialog.showMsg({
                title: self.$t("vc.form.error"),
                message: errorMsg
              });
            } else {
              return self.messageDialog.showMsg({
                title: "",
                message: self.$t("success.successfullyDeleted"),
                mode: "detele",
                fn: self.deleteSuccess
              });

            }
          });
      },
      deleteCancel() {
        //do nothing
      },
      deleteSuccess() {
        window.top.close()
      },
      filterDeletePermission() {
        let self = this;

        //匿名模式下隐藏Delete系统按钮
        if (self.isAnonymousUser) {
          self.schema.show = false;
          return;
        }

        //限制Edit模式下，不允许查看Delete按钮
        if (self.pageMode == 'edit' && self.model["Ng_SysIsDeleted"]) {
          if(window.urlMode == 'NOTENANTAPPCODE'){
            window.open("/systemmessage/403", "_self");
          }else{
            window.open("/" + app.tenantId + "/" + app.appCode + "/systemmessage/403", "_self");
          }
          return;
        }

        //依据IsDeleted状态判断是否为Hard Delete情况, 且必须满足是AppAdmin
        //底层接口过滤了Ng_SysIsDeleted为true,但又没有AppAdmin的请求
        if (self.model["Ng_SysIsDeleted"] && self.$store.state.userInfo.roles.indexOf("AppAdmin") > 0) {
          self.isHardDelete = true;
          self.schema.show = true;
          return;
        }

        let permissions = self.schema.permission || [];
        //如果用户没有设置自定义权限，则按照系统内置权限来处理Delete Button
        if (permissions.length == 0) {
          if (
            self.$store.state.userInfo.roles.indexOf("AppAdmin") > 0 ||
            (self.model["Ng_SysCreatorId"] == self.$store.state.userInfo.userID && !self.$store.state.app
              .enableWorkflow)
          ) {
            //拥有AppAdmin权限能够使用Soft Delete
            //或者在没有workFlow的情况下，当前文档创建人拥有Soft delete
            self.schema.show = true;
          } else {
            self.schema.show = false;
          }
        }

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
      isAnonymousUser() {
        if (this.$store.state.userInfo &&
          this.$store.state.userInfo.roles.length == 1 &&
          this.$store.state.userInfo.roles[0] == "AnonymousRole"
        ) {
          return true;
        } else {
          return false;
        }
      },
      showBtn() {
        return (this.schema.show && this.$route.name !== "Add" && this.$route.name !== "ChooseView" && this.options
          .pageMode == undefined) || (this.schema.show && this.options.pageMode !== undefined && this.options.pageMode
          .toLowerCase() !== 'add');
      },
      left() {
        return this.schema.iconposition !== "right";
      },
      type() {
        return this.schema.type || "button";
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
      this.filterDeletePermission();
    }
  };

</script>
<style>
.v-application .delete-btn.vc-button-custom-style {
  border-radius: var(--c-borderRadius) !important;
  box-shadow: var(--c-shadow) !important;
  height: auto;
  min-height: 36px;
}
  .icon-right>.v-btn__content {
    flex-direction: row-reverse;
  }

  .v-application .primary--text.btndefault:hover {
    /* color: #fff !important; */
  }

</style>
