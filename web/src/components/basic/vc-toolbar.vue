<template>
  <div class="vc-toolbar">
    <v-toolbar :class="schema.classes" :width="schema.width" :height="schema.height || '64px'"
      :absolute="schema.absolute" :fat="schema.fat" :floating="schema.floating">
      <v-btn @click="backToHome" class="brand" elevation="0" plain text :ripple="false" style="background: none;">
        <div :style="logoProps"></div>
        <span class="appname-wrap">
          {{
            $te("system.appname") && $t("system.appname")
              ? $t("system.appname")
              : appCodeWithTenant
          }}
        </span>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script>
  import {
    mapActions,
    mapMutations,
    mapState
  } from "vuex";
  import vcMultilanguage from "./vc-multilanguage.vue";
  import vcNotification from "./vc-notification.vue";
  import vcHeadersection from "./vc-headerSection.vue";
  import vcUserpreference from "./vc-userpreference.vue";
  import vcDelegation from "./vc-userdelegation.vue";
  import base from "../utils/schema-base";
  import { getUserAvatar }from "../../utils/appBaseMethods";
  import {
    getEnv,
    exportEnvUrl
  } from "../../utils/env";
  import appInfo from "../../utils/appInfo";

  let getAppInfo = appInfo();

  export default {
    mixins: [base],
    components: {
      vcMultilanguage,
      vcNotification,
      vcHeadersection,
      vcUserpreference,
      vcDelegation
    },
    inject: {
      messageDialog: {
        default: {
          showMsg() {},
          showErr() {},
          canCancelConfirm() {}
        }
      }
    },
    data() {
      return {
        delegationDialog:false,
        enablePwc: null,
        that: this,
        preferencesDialog: false,
        offsetY: true,
        isMenu: true,
        isMultilan: false,
        isMoreMenu: false,
        headerSchema: {}, //渲染vc-headerSection.vue所需schema
        notificationSchema: {
          name: "sysNotification",
          component: "vc-notification",
          show: true,
        },
        multiLanguageSchema: {
          name: "multilanguage",
          component: "vc-multilanguage",
          defaultLanguage: "en",
          show: true,
        },
        // vcUserpreferenceSchema: {
        //   name: "vc-userpreference",
        //   component: "vc-userpreference",
        //   model: "vc-userpreference",
        //   show: true,
        // },
        vcDelegationSchema: {
          name: "vc-delegation",
          component: "vc-delegation",
          model: "vc-delegation",
          show: true,
        },
        enbaleToggle: false,
        //appInfo: this.$store.state.appInfo,
        logoProps: {
          "background-image": "",
          "background-position": "center",
          "max-height": "47px",
          "background-size": "contain",
          "background-repeat": "no-repeat",
          width: "",
          height: "",
          "min-width": "40px",
        },
        //userInfoShow: false,
        showAboutDigitalMaker: false,
        digitalMakerVersion: "",
        version: "",
        items: [{
          title: "Start Tutorial"
        }, {
          title: "Feedback"
        }],
        ins: this.schema.ins,
        toolbarObj: {},
        mobileToolbarObj: [],
        showbar: false,
        messagesTip: "",
        currentTenant: 'normal',
        appCodeWithTenant: getAppInfo.appCodeWithTenant
      };
    },
    computed: {
      ...mapState(["appInfo", "appLogo"]),
      multiLanColor() {
        return this.isMultilan == true ? 'primary' : (this.$vuetify.theme.dark ? '#3b3b3b': '#e5e5e5');
      },
      menuColor() {
        return this.isMenu == true ? 'primary' : (this.$vuetify.theme.dark ? '#3b3b3b': '#e5e5e5');
      },
      navActiveStyle(){
        return function(flag){
          if(flag){
            return {
              background: this.$vuetify.theme.themes.light.primary,
              color: '#fff !important'
            }
          } else {
            return '';
          }
        }
      },
      isAnonymousUser() {
        if (
          this.$store.state.userInfo &&
          this.$store.state.userInfo.roles.length == 1 &&
          this.$store.state.userInfo.roles[0] == "AnonymousRole"
        ) {
          return true;
        } else {
          return false;
        }
      },
      isColor() {
        return function (code, type, url) {
          let isActive = this.isActivePage(code, type, url);
          return isActive ?
            "rgb(255, 255, 255) !important" :
            "rgba(0,0,0,.87)!important";
        };
      },
      isActivePage() {
        return function (code, type, url) {
          code = code.toLowerCase();
          type = type.toLowerCase();
          url = url.toLowerCase();
          let pathname = ''
          let newUrl = type == "link" || type == "page" ? type + "/" + url : type + "/" + code;
          // 如果是自定义域名，不带tenantId和appcode
          if (window.urlMode == 'NOTENANTAPPCODE') {
            pathname = window.location.pathname.slice(1)
          } else {
            // 如果是传统域名
            pathname = window.location.pathname.split("/").splice(3, 4).join("/").toLowerCase();
          } 
          return (pathname && pathname == newUrl) || (!pathname && type == "home");
        };
      },
      userInfoShow() {
        return false;
      },
    },
    watch: {
      userInfoShow() {
        if (this.userInfoShow) {
          this.showAboutDigitalMaker = false;
        }
      },
    },
    methods: {
      ...mapMutations("app", [
        "setNavigationDrawerMini",
        "setNavigationDrawerDrawer",
      ]),

      ...mapActions("app", ["getSyncAppLogo", "getAppPreference"]),
      menuBottomStyle(code, type, url) {
        if (this.isActivePage(code, type, url)) {
          return {
            'border-bottom': `2px ${this.$vuetify.theme.themes.light.primary} solid`
          }
        } else {
          return '';
        }
      },
      showPreferences() {
        this.preferencesDialog = true;
      },
      showDelegationDialog() {
        this.delegationDialog = true;
      },
      showSearchBar() {
        this.$refs.headerSection.isSearchBar = true;
        this.$refs.headerSection.overlay = true;
      },
      parentEvent(data) {
        this.messagesTip = data;
      },
      openNotification() {
        this.userInfoShow = false;
        this.$refs.notificationEl.expandbadgeModule();
      },
      toggleLanguage(language) {
        this.$refs.multilanguageEl.toggleLanguage(language);
        setTimeout(() => {
          this.isMoreMenu = false;
        }, 500);
      },
      userAvatar() {
        return getUserAvatar(this);
      },
      active(num, text) {
        this.ins = num;
        var urlconcat = '';
        if (text.type == "link") {
          var tempHttp = text.url.substr(0, 7).toLowerCase();
          var tempHttps = text.url.substr(0, 8).toLowerCase();
          if (tempHttp == "http://" || tempHttps == "https://") {
            window.open(text.url, "_blank");
          } else {
            //追加http://
            window.open("http://" + text.url, "_blank");
          }
        } 
        else if (text.type == "view") {
          urlconcat = this.concatUrlByMode('view', true, text.code);          
          window.top.location.href = exportEnvUrl(urlconcat)
        } else if (text.type == "page") {
          urlconcat = this.concatUrlByMode('page', true, text.url);  
          //修改这里解决 在dev的 iframe里面，点菜单，外面的父窗口链接没变
          window.top.location.href = exportEnvUrl(urlconcat);
        } else if (text.type == "admin") {
          urlconcat = this.concatUrlByMode('admin', false, text.url);  
          window.open(
            urlconcat,
            "_blank"
          );
        } else if (text.type == "home") {
            urlconcat = this.concatUrlByMode('home', false, '');
            window.top.location.href = exportEnvUrl(urlconcat);
        }
        else {
          urlconcat = this.concatUrlByMode('else', false, text.url);  
          window.top.location.href = exportEnvUrl(
            urlconcat
          );
        }
      },
      concatUrlByMode(type, needConcatType, pageAlias) {        
        var urlReturn = '';
        if(window.urlMode == 'NOTENANTAPPCODE') {
          if(needConcatType) {
            // old code, maybe useful
            // urlReturn = window.location.pathname
            //   .split("/").filter(item=>item!= '')              
            //   .concat([type])
            //   .concat([pageAlias.replace(/^\/*/, "")])
            //   .join("/")
            urlReturn = `${type}/${pageAlias}`
          }else{
            if (type === 'home') {
              urlReturn = ''
            } else {
              urlReturn =  window.location.pathname
              .split("/").filter(item=>item!= '')              
              .concat([pageAlias.replace(/^\/*/, "")])
              .join("/")
            }            
          }
        } else {
          if(needConcatType) {
            urlReturn = window.location.pathname
              .split("/").filter(item => item != '')
              .splice(0, 2)           
              .concat([type])
              .concat([pageAlias.replace(/^\/*/, "")])
              .join("/")
          } else {              
              urlReturn = window.location.pathname
                  .split("/").filter(item => item != '')
                  .splice(0, 2)
                  .concat([pageAlias.replace(/^\/*/, "")])
                  .join("/")
          }
        }
        return `/${urlReturn}`;
      },
      //设置页面的title
      setDocumentTitle() {
        if (
          this.pageView &&
          this.$route.name.toLowerCase() == "view"
        ) {
          parent.document.title = `${
              this.$te("system.appname") && this.$t("system.appname")
                ? this.$t("system.appname")
                : this.appCodeWithTenant
            } — ${
              this.$te(`menu.${this.pageView.toLowerCase()}`)
                ? this.$t(`menu.${this.pageView.toLowerCase()}`)
                : this.pageView || "view"
            }`;
        } else {
          parent.document.title = `${
              this.$te("system.appname") && this.$t("system.appname")
                ? this.$t("system.appname")
                : this.appCodeWithTenant
          } — ${
            this.$te(`${this.localeFormKey}.sys_defaultPageName`)
              ? this.$t(`${this.localeFormKey}.sys_defaultPageName`)
              : this.pageView || "home"
          }`;
        }
      },
      logOffOrIn(loginType) {
        var href = window.location.href;
        if (href.indexOf("#") > 0) {
          href = href.substr(0, href.indexOf("#"));
        }
        if(loginType == "logoff"){
          window.ls.set(`${this.appCodeWithTenant}@logout`, new Date().getTime())
          this.clearStorage();
        }
        //清理ng 的 缓存
        this.$axios
          .post("/api/GetResult", {
            requestURL: "bs/logout",
          })
          .then((data) => {
            //判断url后缀
            //if(href.endsWith('/')) {
            //  window.open(href + (loginType == 'logoff' ? ".logout" : ".login"), "_self");
            //} else {
            //  window.open(href + (loginType == 'logoff' ? "/.logout" : ".login"), "_self");
            //}
            let hasBackslash = !href.endsWith('/') || href.indexOf('?') > 0 ? "/" : "";
            window.open(href + hasBackslash + (loginType == 'logoff' ? ".logout" : ".login"), "_self");

            //dev环境沿用以前刷新逻辑，其他环境cancel页面重载逻辑
            if (getEnv() === "dev" || getEnv() === "stage") {
              setTimeout(function () {
                window.top.location.reload();
              }, 500)
            }
          });
      },
      //清理storage
      clearStorage() {
        window.ls.remove(`${this.appCodeWithTenant}@userInfo`);
        window.ls.remove(`${this.appCodeWithTenant}@Info`);
        window.ls.remove(`${this.appCodeWithTenant}@idle`);
        window.ls.remove(`${this.appCodeWithTenant}@active`);
        window.ls.remove(`${this.appCodeWithTenant}@expired`);
        window.ls.remove(`${this.appCodeWithTenant}@timeOut`);
        window.ls.remove(`${this.appCodeWithTenant}@Logo`);
      },
      toggleMobileNavigationDrawer() {
        this.bus.$emit("toggleMobileNavigationDrawer");
      },
      getVersion() {
        this.$axios.post("/api/GetVersion").then(({
          data
        }) => {
          this.digitalMakerVersion = data.DigitalMakerVersion;
          this.version = data.Version;
        });
      },
      openOnClick() {
        this.showAboutDigitalMaker = false;
      },
      aboutDigitalMaker() {
        this.showAboutDigitalMaker = true;
      },
      openSourceSoftware() {
        window.open(
          this.$store.getters.cdnHostAndVersionPath +
          "/static/about/Open-Source-Software.html",
          "_blank"
        );
      },
      calculatelogo(imgData) {
        let img = new Image();
        img.src = imgData;
        this.logoProps["background-image"] = "url(" + imgData + ")";
        var that = this;
        img.onload = function () {
          if (img.height > 47) {
            // 按比例计算
            that.logoProps.width = (img.width / img.height) * 47 + "px";
            that.logoProps.height = "47px";
          } else {
            // 正常大小就好
            that.logoProps.height = img.height + "px";
            that.logoProps.width = img.width + "px";
          }
        };
      },
      sortByOrder(a, b) {
        return a.order - b.order;
      },
      backToHome(){
        window.location = this.to('')
      }
    },
    filters: {
      timeFilter(val,that) {
        if (!val) return val
        return that.moment(val).format(that.$store.state.app.appPerference.GlobalDateFormat)
      }
    },
    async created() {
      this.enablePwc = await this.$store.dispatch("actionsGetEnablePwc")
      if (this.schema.enableSearchBar) {
        this.headerSchema = {
          component: "vc-headerSection",
          name: "vc-headerSection",
          model: "Ng_headerSection",
          show: true,
          SearchSettingId: this.schema.AppSearchId,
          searchPlaceholder: this.schema.searchPlaceholder,
          searchPageUrl: this.schema.searchPageUrl
        };
      }
      //并行取菜单
      // this.$axios
      //   .post("/api/GetMenuByParentCode", {
      //     parentCode: "",
      //     deep: 1
      //   })
      //   .then(({
      //     data
      //   }) => {
      //     var adminItem = {};
      //     var newToolbarObj = [];
      //     data.forEach(function (item, index) {
      //       if (item.type === "admin") {
      //         adminItem = item;
      //       } else {
      //         if (item.display) {
      //           var newItem = {};
      //           newItem = item;
      //           newToolbarObj.push(newItem);
      //         }
      //       }
      //     });
      //     this.toolbarObj = newToolbarObj;
      //     this.toolbarObj.sort(this.sortByOrder);
      //     let attrs = Object.keys(adminItem);
      //     if (attrs.length > 0 && getEnv() !== "dev" && getEnv() !== "stage") {
      //       this.toolbarObj.push(adminItem);
      //     }

      //     this.mobileToolbarObj = this.toolbarObj.filter(
      //       (el) => el.name.toLowerCase() != "admin"
      //     );
      //   });

      //this.getVersion();
      // this logo should come from application logo.
      //var appcode = this.$store.state.appInfo.ApplicationCode;
      var appcode = "estest";
      //检查vuex中初始化了没有，没有，看storage里有没有,没有,走接口获取
      var imgData = this.$store.state.app.appLogo; // "/static/images/logo.svg";

      // if (!imgData) {
      //   Promise.all([this.getSyncAppLogo({
      //     appcode: appcode,
      //     enablePwc: this.enablePwc
      //   })]).then(() => {
      //     this.calculatelogo(this.$store.state.app.appLogo);
      //   });
      // } else {
      //   this.calculatelogo(imgData);
      // }

      // this.bus.$on("enableNavigationInToolbar", () => {
      //   this.enbaleToggle = true;
      // });
      // //获取OrganizationType
      // this.$axios.get("/api/GetCurrentTenant",{}).then(({
      //   data
      // }) => {
      //   if (data) {
      //     this.currentTenant = data.tenantType;
      //   } else {
      //     return Promise.reject(new Error("cannot retrive userInfo"));
      //   }
      // });
    },
  };

</script>

<style lang="scss">
  .account-wrapper {
    top: 64px !important;
    box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14);
  }

  .v-menu__content {
    border-radius: 0 !important;
  }

  .vc-toolbar .avatar-wrap {
    border-radius: 100%;
  }

  .vc-toolbar .avatar-icon .v-btn__content {
    width: 100% !important;
  }

  .vc-navigation-drawer-toggle {
    font-size: 24px;
    min-width: 40px;
  }

  .vc-toolbar {
    position: relative;
    z-index: 98;
  }

  .v-toolbar__content,
  .v-toolbar__extension {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .v-list-item.nav-line {
    border-bottom: 1px solid #e5e5e5;
  }

  .theme--dark.v-application .v-list-item.nav-line {
    border-bottom: 1px solid #5a5a5a;
  }

    .v-list-item.nav-line:last-of-type {
      border-bottom: none;
    }

  .vc-toolbar>.v-toolbar {
    position: fixed;
    width: 100%;
    z-index: 99;
  }

  .vc-toolbar .avatar-link-text {
    text-decoration: underline;
  }

  .vc-toolbar .brand {
    text-decoration: none !important;
    font-size: 1rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 47px;
  }
  .vc-toolbar .brand:hover::before {
    opacity: 0;
  }

  .vlistitemsubtitle {
    padding-bottom: 8px;
  }

  .vc-toolbar .appname-wrap::before {
    content: "|";
    padding-right: 10px;
    margin-left: 10px;
    display: inline-block;
  }

  @media (max-width: 1264px) {
    .appname-wrap {
      font-size: 16px;
    }

    .appname-wrap::before {
      margin-left: 0 !important;
      padding-right: 5px !important;
    }
  }

  .v-application [class$="pwc-avatar-outline"]:before,
  .v-application [class*="pwc-avatar-outline"]:before {
    margin-right: 0px !important;
    margin-left: -0.2rem !important;
  }

</style>
