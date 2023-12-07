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
              : appInfo.ApplicationName
          }}
        </span>
      </v-btn>

      <v-spacer />

      <!-- search bar 入口 -->
      <v-btn tabindex="0" icon v-if="schema.enableSearchBar" @click="showSearchBar">
        <v-icon>mdi mdi-magnify</v-icon>
      </v-btn>

      <vc-headersection v-if="schema.enableSearchBar" ref="headerSection" :schema="headerSchema"></vc-headersection>

      <v-toolbar-items v-if="!schema.disableMenu" class="hidden-md-and-down" 
        style="max-width: 85%; overflow: hidden;">
        <v-btn tabindex="0" text v-show="!schema.disableMenu" v-for="(text, index) in toolbarObj" :key="index"
          :color="isActivePage(text.code, text.type, text.url) ? 'primary':''"
          style="border-radius: 0 !important;"
          :style="menuBottomStyle(text.code, text.type, text.url)"
          @click="active(index, text)">
          {{
            text.name.toLowerCase() == "admin"
              ? $t("sysadmintopmenu.admin")
              : $te("menu." + text.code)
              ? $t("menu." + text.code)
              : text.name
          }}
        </v-btn>
      </v-toolbar-items>

      <v-btn tabindex="0" icon v-for="icon in toolbarObj.icons" :key="icon.content" @click="onfuc(icon.func, icon)">
        <v-icon>{{ icon.content }}</v-icon>
      </v-btn>

      <!--小人：对应的弹框-->
      <div>
        <v-menu offset-y content-class="account-wrapper" v-model="userInfoShow" :close-on-content-click="false"
          min-width="326px">
          <template v-slot:activator="{ on: menu }">
            <v-tooltip left v-if="$vuetify.breakpoint.name != 'xs'">
              <template v-slot:activator="{ on: tooltip, attrs }">
                <v-btn v-bind="attrs" icon v-on="on" height="48" class="avatar-icon">
                  <v-badge :content="messagesTip" :value="messagesTip" color="#e0301e" overlap>
                    <v-avatar size="30" v-on="{ ...tooltip, ...menu }">
                      <v-icon v-if="!userInfo.avatar && !isAnonymousUser" size="38px"  :color="$vuetify.theme.dark ? '' : '#2d2d2d'" class="ml-0">pwc-icon pwc-avatar-outline</v-icon>
                      <img v-else :src="userAvatar()">
                    </v-avatar>
                  </v-badge>
                </v-btn>
              </template>
              <span>{{ $t("toolBar.userInfo") }}</span>
            </v-tooltip>
            <v-btn v-else icon v-on="on" height="30" class="avatar-icon">
              <v-badge :content="messagesTip" :value="messagesTip" color="#e0301e" overlap>
                <v-avatar size="30" v-on="{ ...tooltip, ...menu }">
                  <v-icon v-if="!userInfo.avatar && !isAnonymousUser" size="38px" :color="$vuetify.theme.dark ? '' : '#2d2d2d'" class="ml-0">pwc-icon pwc-avatar-outline</v-icon>
                  <img v-else :src="userAvatar()">
                </v-avatar>
              </v-badge>
            </v-btn>
          </template>
          <v-flex xs12>
            <v-card class="mx-0 my-0">
              <v-layout v-if="!showAboutDigitalMaker">
                <v-list-item three-line>
                  <v-list-item-avatar size="80">
                    <v-icon v-if="!userInfo.avatar && !isAnonymousUser" size="107" :color="$vuetify.theme.dark ? '' : '#2d2d2d'" class="ml-0">pwc-icon pwc-avatar-outline</v-icon>
                    <img v-else class="elevation-6" :src="userAvatar()">
                  </v-list-item-avatar>
                  <v-list-item-content style="overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      width: 200px;
                    ">
                    <template v-if="isAnonymousUser">
                      <template>
                        <v-list-item-subtitle style="font-size:12px;" class="font-weight-bold pt-1"
                          :title="userInfo.userName">
                          {{ $t("toolBar.userPreference.pleaseSignIn") }}
                        </v-list-item-subtitle>
                        <v-btn small class="mt-2 mb-2" color="primary" max-width="125" @click="logOffOrIn('login')">
                          {{ $t("toolBar.userPreference.signIn") }}</v-btn>
                      </template>
                    </template>
                    <template v-else>
                      <template v-if="userInfo && userInfo.userName && userInfo.email">
                        <v-list-item-subtitle class="vlistitemsubtitle font-weight-bold pt-1"
                          :title="userInfo.userName">
                          {{ userInfo.userName }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle class="vlistitemsubtitle" :title="userInfo.email">
                          {{ userInfo.email }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle v-show="currentTenant != 'normal'" class="vlistitemsubtitle" :title="userInfo.metadataObject.activeExpirationDate">
                          {{ userInfo.metadataObject.activeExpirationDate | timeFilter(that)}} {{ $t("toolBar.userPreference.expired") }}
                        </v-list-item-subtitle>
                      </template>
                    </template>

                    <v-list-item-subtitle class="vlistitemsubtitle">
                      <a href="javascript:;" @click="aboutDigitalMaker()" style="text-decoration:underline;">
                        {{
                        $t("toolBar.aboutDigitalMaker")
                        }}
                      </a>
                    </v-list-item-subtitle>
                    <v-btn dark color="primary" v-if="!isAnonymousUser" tile class="white--text hidden-md-and-down"
                      @click="showPreferences()" style="box-shadow:none;">
                      {{$t("toolBar.userPreference.editPreferences")}}
                    </v-btn>
                  </v-list-item-content>
                </v-list-item>
              </v-layout>
              <v-layout v-else>
                <v-flex>
                  <v-card-subtitle>
                    {{ $t("toolBar.digtalmakerVersionTitle") }}:{{
                      digitalMakerVersion
                    }}
                  </v-card-subtitle>
                  <!-- <v-card-subtitle>
                    {{ $t("toolBar.versionTitle") }}:{{
                      version
                    }}
                  </v-card-subtitle> -->
                  <v-card-subtitle>
                    <a href="javascript:;" @click="openSourceSoftware()">
                      {{
                      $t("toolBar.openSourceSoftware")
                      }}
                    </a>
                  </v-card-subtitle>
                </v-flex>
              </v-layout>
              <v-divider light></v-divider>
              <v-card-actions v-if="!isAnonymousUser" class="d-flex justify-space-between">
                <v-badge bordered color="#e0301e" dot offset-x="10" offset-y="10" :content="messagesTip"
                  :value="messagesTip" v-if="!this.schema.disableNotification">
                  <v-btn small text color="grey" @click="openNotification">
                    <v-icon>pwc-icon pwc-comment-outline</v-icon>
                    {{ $t("toolBar.notification") }}
                  </v-btn>
                </v-badge>
                <v-btn small text color="grey" @click="delegationDialog = true">
                  <v-icon>pwc-icon pwc-edit-outline</v-icon>
                  {{$t("delegationuser.Delegation")}}
                </v-btn>
                <v-btn small text color="grey" @click="logOffOrIn('logoff')">
                  <v-icon>pwc-icon pwc-login-outline</v-icon>
                  {{ $t("toolBar.logOut") }}
                </v-btn>
              </v-card-actions>
              <v-card-actions v-else>
                <div class="d-flex" style="margin-left:6px;">
                  <v-icon>pwc-icon pwc-information-outline</v-icon>
                  <span class="ml-2 mt-1"
                    style="font-size:12px;">{{ $t("toolBar.userPreference.getMoreInformation") }}</span>
                </div>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-menu>
      </div>

      <!--小铃铛-->
      <vc-notification v-if="!this.schema.disableNotification" ref="notificationEl" :schema="this.notificationSchema"
        @child-event="parentEvent"></vc-notification>

      <!-- 多语 -->
      <template v-if="!this.schema.disableMultiLanguage">
        <div class="hidden-md-and-down">
          <vc-multilanguage :schema="this.multiLanguageSchema" ref="multilanguageEl"></vc-multilanguage>
        </div>
      </template>

      <!-- 三个点 fixed -->
      <v-menu :close-on-content-click="false" v-if="!schema.disableMenu" v-model="isMoreMenu" min-width="100%"
        max-width="100%" absolute z-index="99" :offset-y="offsetY" :attach="true">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" dark icon v-on="on" class="hidden-lg-and-up"
            style="margin-right: -14px; margin-left: -10px">
            <v-icon color="grey">mdi mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <div style="height: 64px; background: rgba(0, 0, 0, 0.4)" @click="isMoreMenu = false"></div>
        <v-btn absolute tile right min-width="48px" style="
            top: 94px;
            width: 48px;
            height: 48px;
            z-index: 99;
            border-radius: 50% !important;"
            :color="menuColor" 
            @click="
            isMenu = true;
            isMultilan = false; ">
          <v-icon size="30px">pwc-icon pwc-listview-outline</v-icon>
        </v-btn>
        <v-btn absolute tile right min-width="48px" style="
            top: 148px;
            width: 48px;
            height: 48px;
            z-index: 99;
            border-radius: 50% !important;"  
            :color="multiLanColor"
            @click="
            isMenu = false;
            isMultilan = true; ">
          <v-icon size="38px">pwc-icon pwc-globe-outline</v-icon>
        </v-btn>
        <v-btn absolute tile right 
            :color="$vuetify.theme.dark ? '#3b3b3b' : '#e5e5e5'"
            min-width="48px" style="
            top: 202px;
            width: 48px;
            height: 48px;
            z-index: 99;
            border-radius: 50% !important;
          " @click="isMoreMenu = false">
          <v-icon size="30px">mdi mdi-close</v-icon>
        </v-btn>
        <!-- mobile-menu -->
        <v-list width="100%" height="calc(100vh - 64px)" class="hidden-lg-and-up phone-menu-wrap" v-show="isMenu"
          style="padding: 0; overflow-y: auto">
          <v-list-item v-for="(text, index) in mobileToolbarObj" :key="index" class="nav-line"
            :style="navActiveStyle(isActivePage(text.code, text.type, text.url))" @click="active(index, text)">
            <v-list-item-title>
              <v-avatar class="circle-wrap mr-4 mb-1"
                :color="!isActivePage(text.code, text.type, text.url) ? $vuetify.theme.themes.light.primary : '#fff'"
                size="11"></v-avatar>
              {{
                text.name.toLowerCase() == "admin"
                  ? $t("sysadmintopmenu.admin")
                  : $te("menu." + text.code)
                  ? $t("menu." + text.code)
                  : text.name
              }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <!-- mobile multilan -->
        <v-list width="100%" height="calc(100vh - 64px)" class="hidden-lg-and-up phone-menu-wrap" v-show="isMultilan"
          style="padding: 0; overflow-y: auto">
          <v-list-item v-for="language in this.$store.state.app.appPerference.AvaiableLanguage" :key="language.code"
            @click="toggleLanguage(language)" class="nav-line" :style="navActiveStyle($i18n.locale == language.code)"
            :class="{
              'nav-active': $i18n.locale == language.code,
            }">
            <v-icon class="mr-4" :color="$vuetify.theme.dark ? '' : '#2d2d2d'">pwc-icon pwc-globe-outline</v-icon>
            <v-list-item-title>{{ language.language }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <vc-userpreference :schema="this.vcUserpreferenceSchema" @closeDialog="preferencesDialog= false"
      :preferencesDialog="preferencesDialog"></vc-userpreference>
    
    <vc-delegation :delegationDialog = "delegationDialog" @closeDelegationDialog="delegationDialog=false"></vc-delegation>
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
        vcUserpreferenceSchema: {
          name: "vc-userpreference",
          component: "vc-userpreference",
          model: "vc-userpreference",
          show: true,
        },
        vcDelegationSchema: {
          name: "vc-delegation",
          component: "vc-delegation",
          model: "vc-delegation",
          show: true,
        },
        enbaleToggle: false,
        appInfo: this.$store.state.appInfo,
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
        userInfoShow: false,
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
        return this.userInfoShow;
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
                : this.appInfo.ApplicationName
            } — ${
              this.$te(`menu.${this.pageView.toLowerCase()}`)
                ? this.$t(`menu.${this.pageView.toLowerCase()}`)
                : this.pageView || "view"
            }`;
        } else {
          parent.document.title = `${
              this.$te("system.appname") && this.$t("system.appname")
                ? this.$t("system.appname")
                : this.appInfo.ApplicationName
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
      this.$axios
        .post("/api/GetMenuByParentCode", {
          parentCode: "",
          deep: 1
        })
        .then(({
          data
        }) => {
          var adminItem = {};
          var newToolbarObj = [];
          data.forEach(function (item, index) {
            if (item.type === "admin") {
              adminItem = item;
            } else {
              if (item.display) {
                var newItem = {};
                newItem = item;
                newToolbarObj.push(newItem);
              }
            }
          });
          this.toolbarObj = newToolbarObj;
          this.toolbarObj.sort(this.sortByOrder);
          let attrs = Object.keys(adminItem);
          if (attrs.length > 0 && getEnv() !== "dev" && getEnv() !== "stage") {
            this.toolbarObj.push(adminItem);
          }

          this.mobileToolbarObj = this.toolbarObj.filter(
            (el) => el.name.toLowerCase() != "admin"
          );
        });

      this.getVersion();
      // this logo should come from application logo.
      var appcode = this.$store.state.appInfo.ApplicationCode;
      //检查vuex中初始化了没有，没有，看storage里有没有,没有,走接口获取
      var imgData = this.$store.state.app.appLogo; // "/static/images/logo.svg";

      if (!imgData) {
        Promise.all([this.getSyncAppLogo({
          appcode: appcode,
          enablePwc: this.enablePwc
        })]).then(() => {
          this.calculatelogo(this.$store.state.app.appLogo);
        });
      } else {
        this.calculatelogo(imgData);
      }

      this.bus.$on("enableNavigationInToolbar", () => {
        this.enbaleToggle = true;
      });
      //获取OrganizationType
      this.$axios.get("/api/GetCurrentTenant",{}).then(({
        data
      }) => {
        if (data) {
          this.currentTenant = data.tenantType;
        } else {
          return Promise.reject(new Error("cannot retrive userInfo"));
        }
      });
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
