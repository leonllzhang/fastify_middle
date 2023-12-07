<template>
  <div class="vc-header" :class="getHeaderStyle">
    <v-toolbar :class="schema.classes" :width="schema.width" :height="'auto'" :absolute="schema.absolute" :fat="schema.fat" :floating="schema.floating">
      <!-- Left More Menu Button -->
      <div class="left-burger-activator">
        <v-btn dark icon @click="isBurgerMenu = true" class="menuBtn hidden-lg-and-up">
          <v-icon color="grey">mdi mdi-menu</v-icon>
        </v-btn>
        <v-btn v-show="isBurgerMenu" absolute text tile size="48px" style="z-index: 100" class="menuBtn close hidden-lg-and-up" @click="closeMenu()">
          <v-icon size="30px">mdi mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- App Icon and App Name -->
      <v-btn @click="backToHome" class="brand" elevation="0" text plain :ripple="false">
        <div class="logobrand" :style="logoProps" v-html="logo.image.outerHTML"></div>
        <span class="appname-wrap">
          {{ $te("system.appname") && $t("system.appname") ? $t("system.appname") : appInfo.ApplicationName }}
        </span>
      </v-btn>

      <v-spacer />
      <!-- search bar 入口 -->
      <v-btn tabindex="0" icon v-if="schema.enableSearchBar" @click="showSearchBar">
        <v-icon>mdi mdi-magnify</v-icon>
      </v-btn>

      <vc-headersection v-if="schema.enableSearchBar" ref="headerSection" :schema="headerSchema"></vc-headersection>

      <v-toolbar-items v-if="!schema.disableMenu" class="hidden-md-and-down" style="overflow: hidden;">
        <template v-for="(menuObj, index) in toolbarObj">
          <sub-menu v-if="menuObj.children.length > 0 && menuObj.type.toLowerCase() != 'view'" :key="index" :index="index" :showSubMenuIcon="schema.showSubMenuIcon" :menuObj="menuObj" :menuItems="menuObj.children" @sub-menu-click="(emitMenuObj) => active(index, emitMenuObj)" @onActiveRootMenu="changeActiveRootMenu">
            <v-icon v-show="schema.showExpandIcon" class="ml-1"> mdi-chevron-down </v-icon>
          </sub-menu>
          <v-btn
            v-else-if="menuObj.children.length == 0 || menuObj.type.toLowerCase() == 'view'"
            tabindex="0"
            :text="menuObj"
            :key="index"
            :color="isActivePage(menuObj.code, menuObj.type, menuObj.url) ? 'primary':''"
            :class="{ 'active-page': isActivePage(menuObj.code, menuObj.type, menuObj.url) }" 
            style="border-radius: 0 !important;"
            :style="menuBottomStyle(menuObj.code, menuObj.type, menuObj.url)"
            @click="active(index, menuObj)"
            @mouseover="changeActiveRootMenu">
            {{ menuObj.name.toLowerCase() == "admin" ? $t("sysadmintopmenu.admin") : $te("menu." + menuObj.code) ? $t("menu." + menuObj.code) : menuObj.name }}
          </v-btn>
          <div v-else :key="index">This is else case</div>
        </template>
      </v-toolbar-items>

      <v-btn tabindex="0" icon v-for="icon in toolbarObj.icons" :key="icon.content" @click="onfuc(icon.func, icon)">
        <v-icon>{{ icon.content }}</v-icon>
      </v-btn>

      <!-- <v-spacer class="right-spacer"/> -->

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
                        <v-list-item-subtitle style="font-size:12px;" class="font-weight-bold pt-1" :title="userInfo.userName">
                          {{ $t("toolBar.userPreference.pleaseSignIn") }}
                        </v-list-item-subtitle>
                        <v-btn small class="mt-2 mb-2" color="primary" max-width="125" @click="logOffOrIn('login')">{{ $t("toolBar.userPreference.signIn") }}</v-btn>
                      </template>
                    </template>
                    <template v-else>
                      <template v-if="userInfo && userInfo.userName && userInfo.email">
                        <v-list-item-subtitle class="vlistitemsubtitle font-weight-bold pt-1" :title="userInfo.userName">
                          {{ userInfo.userName }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle class="vlistitemsubtitle" :title="userInfo.email">
                          {{ userInfo.email }}
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
                  <span class="ml-2 mt-1" style="font-size:12px;">{{ $t("toolBar.userPreference.getMoreInformation") }}</span>
                </div>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-menu>
      </div>

      <!-- <v-icon>
        pwc-chevronright-outline
      </v-icon> -->

      <!--小铃铛-->
      <vc-notification v-if="!this.schema.disableNotification" ref="notificationEl" :schema="this.notificationSchema" @child-event="parentEvent"></vc-notification>

      <!-- 多语 -->
      <template v-if="!this.schema.disableMultiLanguage">
        <div class="hidden-md-and-down">
          <vc-multilanguage :schema="this.multiLanguageSchema" ref="multilanguageEl"></vc-multilanguage>
        </div>
      </template>

      <!-- 三个点 fixed -->
      <v-menu class="vc-header-burger-menu" :close-on-content-click="false" v-if="!schema.disableMenu" v-model="isBurgerMenu" min-width="100%" max-width="100%" absolute z-index="99" :offset-y="offsetY" :attach="true">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" dark icon v-on="on" class="right-burger-activator hidden-lg-and-up">
            <v-icon color="grey">mdi mdi-menu</v-icon>
          </v-btn>
        </template>
        <!-- <div style="height: 64px; background: rgba(0, 0, 0, 0.4)" @click="isBurgerMenu = false"></div> -->
        <!-- <v-btn
          absolute
          text
          tile
          style="top: 4px; right: 106px"
          class="menuBtn"
          :class="{ 'switch-menu-mutilan-mobile': isNavBar == true }"
          @click="
            isNavBar = true;
            isMultilan = false;
          ">
          <v-icon size="30px">pwc-icon pwc-listview-outline</v-icon>
        </v-btn> -->
        <!-- <v-btn
          absolute
          text
          tile
          class="menuBtn"
          :class="{ 'switch-menu-mutilan-mobile': isMultilan == true }"
          @click="toggleMenuType()">
          <v-icon size="30px">pwc-icon pwc-globe-outline</v-icon>
        </v-btn> -->
        <v-btn absolute text tile right min-width="48px" class="right-burger-activator menuBtn close"
         style="top: 5px; right: 10px;border-radius: 50% !important;" 
         @click="closeMenu()">
          <v-icon size="30px">mdi mdi-close</v-icon>
        </v-btn>
        <!-- mobile-menu -->
        <div class="hidden-lg-and-up phone-menu-wrap" :style="computeMenuWrapHeight" v-show="isNavBar">
          <v-list>
            <template v-for="(text, index) in mobileToolbarObj">
              <div class="v-list__subMenu__parent" :key="index">
                <v-list-item v-if="text.children.length == 0 || text.type.toLowerCase() == 'view'" :class="{ 'nav-active': isActivePage(text.code, text.type, text.url) }" @click="active(index, text)">
                  <v-list-item-action v-if="text.icon && schema.showSubMenuIcon" class="mr-3">
                    <v-icon>{{ text.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>
                    <!-- <span class="circle-wrap"></span> -->
                    {{ text.name.toLowerCase() == "admin" ? $t("sysadmintopmenu.admin") : $te("menu." + text.code) ? $t("menu." + text.code) : text.name }}
                  </v-list-item-title>
                </v-list-item>
                <sub-menu-burger v-if="text.children.length > 0 && text.type.toLowerCase() != 'view'" :menuItems="text" :showSubMenuIcon="schema.showSubMenuIcon" @sub-menu-click="(emitMenuObj) => active(index, emitMenuObj)"></sub-menu-burger>
              </div>
            </template>
          </v-list>
          <div class="languageBar">
            <v-list-item @click="toggleMenuType()">
              <v-list-item-action class="mr-3">
                <v-icon>pwc-globe-outline</v-icon>
              </v-list-item-action>
              <v-list-item-title>
                {{ $te("schema-base.translate") ? $t("schema-base.translate") : "Language" }}
              </v-list-item-title>
              <v-list-item-content>
                {{ currentLanguage }}
              </v-list-item-content>
            </v-list-item>
          </div>
        </div>
        <!-- mobile multilan -->
        <v-list class="hidden-lg-and-up phone-menu-wrap languageMenu" v-show="isMultilan">
          <div class="v-list-item__parent" v-for="language in this.$store.state.app.appPerference.AvaiableLanguage" :key="language.code">
            <v-list-item
              @click="toggleLanguage(language)"
              class="nav-line"
              :class="{
                'nav-active': $i18n.locale == language.code,
              }">
              <v-icon class="mr-4">pwc-icon pwc-globe-outline</v-icon>
              <v-list-item-title>{{ language.language }}</v-list-item-title>
            </v-list-item>
          </div>
        </v-list>
      </v-menu>
    </v-toolbar>
    <vc-userpreference :schema="this.vcUserpreferenceSchema" @closeDialog="preferencesDialog = false" :preferencesDialog="preferencesDialog"></vc-userpreference>

    <!-- 用户代理弹窗 -->
    <vc-delegation :delegationDialog = "delegationDialog" @closeDelegationDialog="delegationDialog=false"></vc-delegation>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import subMenu from "../subMenu.vue";
import subMenuBurger from "../subMenuBurger.vue";
import vcMultilanguage from "./vc-multilanguage.vue";
import vcNotification from "./vc-notification.vue";
import vcHeadersection from "./vc-headerSection.vue";
import vcUserpreference from "./vc-userpreference.vue";
import vcDelegation from "./vc-userdelegation.vue";
import base from "../utils/schema-base";
import { getUserAvatar }from "../../utils/appBaseMethods";
import { getEnv, exportEnvUrl } from "../../utils/env";
import i18n from "../../i18n/index";
import appInfo from "../../utils/appInfo";

let getAppInfo = appInfo();

export default {
  mixins: [base],
  components: {
    "sub-menu": subMenu,
    "sub-menu-burger": subMenuBurger,
    vcMultilanguage,
    vcNotification,
    vcHeadersection,
    vcUserpreference,
    vcDelegation
  },
  data() {
    return {
      delegationDialog:false,
      preferencesDialog: false,
      offsetY: true,
      isNavBar: true,
      isMultilan: false,
      isBurgerMenu: false,
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
      enbaleToggle: false,
      appInfo: this.$store.state.appInfo,
      logoProps: {
        // "background-image": this.$store.getters.cdnHostAndVersionPath + "url('/static/images/logo.svg')",
      },
      userInfoShow: false,
      showAboutDigitalMaker: false,
      digitalMakerVersion: "",
      version: "",
      items: [
        {
          title: "Start Tutorial",
        },
        {
          title: "Feedback",
        },
      ],
      ins: this.schema.ins,
      toolbarObj: {},
      mobileToolbarObj: [],
      showbar: false,
      messagesTip: "",
      showingMenu: null,
      logo: {
        image: new Image(),
      },
      innerHeight: 0,
      appCodeWithTenant: getAppInfo.appCodeWithTenant
    };
  },
  mounted(){
    this.setInnerHeight();
    window.addEventListener('resize', this.setInnerHeight);
  },
  computed: {
    ...mapState(["appInfo", "appLogo"]),
    computeMenuWrapHeight() {
      return { height: `${this.innerHeight}px` };
    },
    getHeaderStyle() {
      switch (this.schema.currentStyle) {
        default:
          return {
            'vc-header-default': true
          }
      }
    },
    currentLanguage() {
      return this.$store.state.app.appPerference.AvaiableLanguage.filter(x => x.code==this.$i18n.locale)[0].language;
    },
    isAnonymousUser() {
      if (this.$store.state.userInfo && this.$store.state.userInfo.roles.length == 1 && this.$store.state.userInfo.roles[0] == "AnonymousRole") {
        return true;
      } else {
        return false;
      }
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
    showingMenu(newVal, oldVal) {
      // console.log('header showingMenu', newVal, oldVal);
      if (oldVal) {
        oldVal.openMenu = false;
        oldVal.menuOpened = false;
      }
    },
  },
  methods: {
    ...mapMutations("app", ["setNavigationDrawerMini", "setNavigationDrawerDrawer"]),
    ...mapActions("app", ["getSyncAppLogo", "getAppPreference"]),
    setInnerHeight() {
      this.innerHeight = this.$dm.env === 'env' ? window.parent.innerHeight - 53 : window.innerHeight - 53;
    },
    menuBottomStyle(code,type,url) {
      if(this.isActivePage(code, type,url)) {
        return {
          'border-bottom':`2px ${this.$vuetify.theme.themes.light.primary} solid`
        }
      }else {
        return '';
      }
    },
    showPreferences() {
      this.preferencesDialog = true;
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
        this.toggleMenuType();
      }, 200);
    },
    closeMenu() {
      this.isBurgerMenu = false;
      if (!this.isNavBar) {
        this.toggleMenuType();
      }
    },
    toggleMenuType() {
      this.isNavBar = !this.isNavBar;
      this.isMultilan = !this.isMultilan;
    },
    userAvatar() {
      return getUserAvatar(this);
    },
    changeActiveRootMenu(showingMenu) {
      this.showingMenu = showingMenu;
    },
    getUrl(type,code){
        let _url = ""
        if(window.urlMode == 'NOTENANTAPPCODE') {
          if(type){
            _url = window.location.pathname
            .split("/")
            .splice(0,1)
            .concat([type])
            .concat([code.replace(/^\/*/, "")])
            .join("/")
          }else{
            _url = window.location.pathname
            .split("/")
            .splice(0,1)
            .concat([code.replace(/^\/*/, "")])
            .join("/")
          }
        }else{
          if(type){
            _url = window.location.pathname
            .split("/")
            .splice(0, 3)
            .concat([type])
            .concat([code.replace(/^\/*/, "")])
            .join("/")
          }else{
            _url = window.location.pathname
            .split("/")
            .splice(0, 3)
            .concat([code.replace(/^\/*/, "")])
            .join("/")
          }
        }
        return _url
      },
    active(num, text) {
      this.ins = num;
      if (text.type == "link") {
        var tempHttp = text.url.substr(0, 7).toLowerCase();
        var tempHttps = text.url.substr(0, 8).toLowerCase();
        if (tempHttp == "http://" || tempHttps == "https://") {
          window.open(text.url, "_blank");
        } else {
          //追加http://
          window.open("http://" + text.url, "_blank");
        }
      } else if (text.type == "view") {
        window.top.location.href = exportEnvUrl(this.getUrl(text.type,text.code));
      } else if (text.type == "page") {
        //修改这里解决 在dev的 iframe里面，点菜单，外面的父窗口链接没变
        window.top.location.href = exportEnvUrl(this.getUrl(text.type,text.url));
      } else if (text.type == "admin") {
        window.open(this.getUrl(null,text.url),
          "_blank"
        );
      } else if (text.type == "folder") {
        // console.log("this is folder, do nothing");
      } else {
        
        window.top.location.href = exportEnvUrl(
          this.getUrl(null,text.url)
        );
      }
    },
    logOffOrIn(loginType) {
      var href = window.location.href;
      if (href.indexOf("#") > 0) {
        href = href.substr(0, href.indexOf("#"));
      }
      //if (href.indexOf("?") > 0) {
      //  href = href.substr(0, href.indexOf("?"));
      //}
      if(loginType == "logoff")window.ls.set(`${this.appCodeWithTenant}@logout`, new Date().getTime())
      this.clearStorage();
      //清理ng 的 缓存
      this.$axios
        .post("/api/GetResult", {
          requestURL: "bs/logout",
        })
        .then((data) => {
          window.open(href.replace(/\/$/, '') + (loginType == "logoff" ? "/.logout" : "/.login"), "_self");
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
      this.$axios.post("/api/GetVersion").then(({ data }) => {
        this.digitalMakerVersion = data.DigitalMakerVersion;
        this.version = data.Version;
      });
    },
    aboutDigitalMaker() {
      this.showAboutDigitalMaker = true;
    },
    openSourceSoftware() {
      window.open(this.$store.getters.cdnHostAndVersionPath + "/static/about/Open-Source-Software.html", "_blank");
    },
    calculatelogo(imgData) {
      const imageObj = new Image();
      imageObj.alt = i18n.t("system.appname") ? i18n.t("system.appname") : this.appInfo.ApplicationName;
      imageObj.src = imgData;

      this.logo.image = imageObj;
    },
    sortByOrder(a, b) {
      return a.order - b.order;
    },
    backToHome(){
      window.location = this.to('')
    }
  },
  created() {
    //设置document title
    if (this.schema.enableSearchBar) {
      this.headerSchema = {
        component: "vc-headerSection",
        name: "vc-headerSection",
        model: "Ng_headerSection",
        show: true,
        SearchSettingId: this.schema.AppSearchId,
        searchPlaceholder: this.schema.searchPlaceholder,
        searchPageUrl: this.schema.searchPageUrl,
      };
    }
    //并行取菜单
    this.$axios
      .post("/api/GetMenuByParentCode", {
        parentCode: "",
        deep: 1,
      })
      .then(({ data }) => {
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

        this.mobileToolbarObj = this.toolbarObj.filter((el) => {
          return el.name.toLowerCase() != "admin";
        });
      });

    this.getVersion();
    // this logo should come from application logo.
    var appcode = this.$store.state.appInfo.ApplicationCode;
    //检查vuex中初始化了没有，没有，看storage里有没有,没有,走接口获取
    var imgData = this.$store.state.app.appLogo; // "/static/images/logo.svg";

    if (!imgData) {
      Promise.all([
        this.getSyncAppLogo({
          appcode,
        }),
      ]).then(() => {
        this.calculatelogo(this.$store.state.app.appLogo);
      });
    } else {
      this.calculatelogo(imgData);
    }

    this.bus.$on("enableNavigationInToolbar", () => {
      this.enbaleToggle = true;
    });
  },
};
</script>

<style lang="scss">
/* Override header in View */
.v-application--wrap {
  .vc-toolbar { z-index: 101; }
  .v-main__wrap {
    .vc-header {
      & > .v-toolbar {
        box-shadow: none;
      }
      & + div {
        margin-top: 0;
      }
    }
  }
}

@import "../style/vc-header/default.scss";
.vc-header {
  .brand {
    text-decoration: none !important;
    font-size: 1rem;
    line-height: 1.5;
    &:hover::before {
      opacity: 0;
    }
  }
}
.right-spacer, .left-burger-activator{
  display: none;
  position: relative;    
  justify-content: center;
  align-items: center;
  margin-right: 8px;
}
  // Spacer
.vc-header-float-left-item{
  & .left-spacer {
    display: none;
  }
  & .right-spacer {
    display: block;
  }
}

  // Burger Menu
.vc-header-left-burger-menu{
  & .left-burger-activator {
    display: inline-flex;
  }
  & .right-burger-activator {
    display: none;
  }
}

.languageBar {
  .v-list-item {
    .v-list-item__title {
      flex: 1;
    }
    .v-list-item__content {
      flex: none;
    }
  }
}

.logobrand img {
  background-position: center center;
  max-height: 47px;
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 10px;
  min-width: 40px;
  width: 47px;
  height: 47px;
}
</style>