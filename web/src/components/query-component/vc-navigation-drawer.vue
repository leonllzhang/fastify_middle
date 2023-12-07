<template>
  <div
    :class="
      $vuetify.breakpoint.name == 'xs'
        ? 'navigation-drawer-mobile'
        : 'navigation-drawer-pc'
    "
  >
    <v-navigation-drawer
      tabindex="0"
      :height="
        $vuetify.breakpoint.name == 'xs'
          ? 'calc(100vh)'
          : 'calc(100vh - 64px - 39px)'
      "
      class="navigation-drawer-top"
      v-model="drawer"
      :absolute="absolute"
      :expand-on-hover="isMini"
      :temporary="temporary"
      :permanent="permanent"
      app
      :width="$vuetify.breakpoint.name == 'xs' ? 'calc(100vh)' : '256px'"
    >
      <v-list>
        <template v-for="(item, index) in items">
          <template v-if="item.children && item.children.length">
            <listitemgroupwrapper
              :schema="schema"
              :curentitem="item"
              :level="0"
              :key="index"
            />
          </template>
          <template v-else>
            <v-list-item
              :key="item.id"
              @click="vlistitemClick(item)"
              :class="activeitemclass(item.id)"
              class="navigation-list-item"
              link
            >
              <v-list-item-icon>
                <v-icon>
                  {{
                    (item.icon.indexOf("pwc-") > -1 ? "pwc-icon " : "mdi ") +
                    item.icon
                  }}
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title tabindex="0" :aria-label="item.displayName">{{ item.displayName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-btn
      v-if="$vuetify.breakpoint.name == 'xs' && drawer"
      class="mx-2 toggle-navigation-button"
      fixed
      fab
      dark
      small
      color="primary"
      @click="toggleMobileNavigationDrawer"
    >
      <v-icon dark>mdi mdi-close</v-icon>
    </v-btn>
    <v-btn
      v-if="$vuetify.breakpoint.name == 'xs'"
      class="open-left-menu-btn"
      fixed
      fab
      dark
      small
      color="primary"
      width="60"
      height="60"
      @touchstart="touchstart"
      @touchmove="touchmove"
    >
      <v-icon dark>pwc-icon pwc-listview-outline</v-icon>
    </v-btn>
  </div>
</template>
<script>
import base from "../utils/form-base";
import { mapMutations } from "vuex";

export default {
  mixins: [base],
  components: {
    listitemgroupwrapper: () => import("./vc-list-item-group.vue"),
  },
  provide: function () {
    return {
      NavigationManager: {
        toggleNavigation: this.toggleNavigation,
      },
    };
  },
  data() {
    return {
      drawer: true,
      isMini: true,
      items: [],
      right: null,
      absolute: false,
      temporary: false,
      miniVariant: true,
      permanent: true,
      active: false,
      startX: "",
      moveX: ""
    };
  },
  watch: {
    "$i18n.locale": function () {
      this.filterDisplayItems(this.items);
    },
  },
  computed: {},
  mounted() {
    this.initNavigationDrawer();
    this.bindNavigationDrawer();
  },
  methods: {
    ...mapMutations("app", [
      "setnavigationDrawerActiveItem",
      "setBreadcrumbsData",
    ]),
    touchstart(e) {
      this.toggleMobileNavigationDrawer();
      e = e || window.event;
      e.preventDefault();
      this.startX = e.touches[0].clientX;
    },
    touchmove(e) {
      e = e || window.event;
      e.preventDefault();
      this.moveX = e.touches[0].clientX;

      if (this.startX - this.moveX <= 0) {
        // 右滑触发
        this.toggleMobileNavigationDrawer();
      }
    },
    toggleMobileNavigationDrawer() {
      this.bus.$emit("toggleMobileNavigationDrawer");
    },
    bindNavigationDrawer() {
      var that = this;
      if (that.$vuetify.breakpoint.name == "xs") {
        that.drawer = false;
        that.isMini = false;
        that.temporary = false;
        that.absolute = false;
        that.permanent = false;
      }
      that.bus.$on("toggleMobileNavigationDrawer", () => {
        that.drawer = !that.drawer;
        that.isMini = false;
        that.temporary = true;
        that.absolute = true;
        that.permanent = false;
      });
      that.bus.$emit("enableNavigationInToolbar");
    },
    filterDisplayItems(arr) {
      for (var i = 0; i < arr.length; i++) {
        arr[i].displayName = this.$te("menu." + arr[i].code)
          ? this.$t("menu." + arr[i].code)
          : arr[i].name;
        //console.log('filterDisplayItems-t', this.$t('menu.' + arr[i].code));
        //console.log('filterDisplayItems', this.$te('menu.' + arr[i].code) ? this.$t('menu.' + arr[i].code) : arr[i].name);
        if (arr[i].display == false) {
          arr.splice(i--, 1);
        } else if (arr[i].children && arr[i].children.length > 0) {
          this.filterDisplayItems(arr[i].children);
        }
      }
    },
    initNavigationDrawer() {
      let that = this;
      let route = this.$route;
      var apiUrl = "/api/GetMenuByParentCode";
      var searchparam = {
        parentCode: route.params.pageView,
        deep: -1,
        //requestURL: "menu/pc/" + route.params.pageView + "?deep=-1",
      };
      that.$axios
        .post(apiUrl, searchparam)
        .then(({ data }) => {
          let result = data || [];
          if (result != null) {
            this.filterDisplayItems(result);
            that.items = result;

            that.setnavigationDrawerActiveItem({
              id: that.items[0].id,
              viewAlias: that.items[0].url,
              type: that.items[0].type,
              isLoad: true,
            });

            var activeName = that.items[0].name;
            var pageView = this.$route.params.pageView.toLowerCase();

            if (that.$te(pageView + "." + activeName)) {
              activeName = that.$t(`${pageView}.${activeName}`);
            }
                  //清空floatingButtonItems
      this.$store.state.app.floatingButtonItems = [];
            that.setBreadcrumbsData([
              { name: that.items[0].displayName, code: that.items[0].code },
            ]);

            that.items[0].active = true;
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    },
    vlistitemClick(item) {

            //清空floatingButtonItems
      this.$store.state.app.floatingButtonItems = [];
      if (item.type == "folder") {
        return;
      }

      if (item.type == "link") {
        var tempHttp = item.url.substr(0, 7).toLowerCase();
        var tempHttps = item.url.substr(0, 8).toLowerCase();
        if (tempHttp == "http://" || tempHttps == "https://") {
          window.open(item.url, "_blank");
        } else {
          //追加http://
          window.open("http://" + item.url, "_blank");
        }
        return;
      }

      let that = this;
      that.setnavigationDrawerActiveItem({
        id: item.id,
        viewAlias: item.url,
        type: item.type,
      });
      that.setBreadcrumbsData([{ name: item.displayName, code: item.code }]);
      that.toggleNavigation();
    },
    toggleNavigation() {
      let that = this;
      if (that.$vuetify.breakpoint.name == "xs") {
        that.drawer = false;
        that.isMini = false;
        that.temporary = false;
        that.absolute = true;
        that.permanent = false;
      }
    },
    activeitemclass(id) {
      if (id === this.$store.state.app.navigationDrawerActiveItem.id) {
        return "v-list-item-root v-item--active v-list-item--active primary--text";
      } else {
        return "v-list-item-root";
      }
    },
  },
};
</script>

<style>
/*.v-list-item {
        padding: 0px 16px 0px 8px !important;
    }*/

.navigation-drawer-top .v-icon {
  height: 29px;
}
.navigation-drawer-mobile .v-navigation-drawer--temporary {
  z-index: 100;
}
.navigation-drawer-mobile .toggle-navigation-button {
  z-index: 101;
  right: 5px;
  top:10px;
}
.navigation-drawer-mobile .open-left-menu-btn {
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  justify-content: flex-end;
  padding:0 6px;
}
.navigation-drawer-mobile .v-list-group-level1 {
  border-bottom: 1px solid #dedede;
}
.navigation-drawer-mobile .navigation-list-item {
  border-bottom: 1px solid #584242;
}

.navigation-drawer-top [class$="pwc-icon"]:before,
[class*="pwc-icon"]:before,
.pwc-icon::before {
  margin-left: 0px !important;
  margin-right: 0px !important;
}

.v-application--is-ltr
  .navigation-drawer-top
  .v-list-group--no-action
  > .v-list-group__items
  > .v-list-item {
  padding-left: 32px;
}

.navigation-drawer-top .v-list {
  padding: 0px !important;
}

.navigation-drawer-top .v-list-item {
  min-height: 61px;
}
  .navigation-drawer-top .v-list-item__content {
    max-width: 165px;
  }
  .navigation-drawer-top .v-list-group .v-list-group__header .v-list-item__icon.v-list-group__header__append-icon {
      min-width:28px;
  }
  .navigation-drawer-top .v-application--is-ltr .v-list-item__action:first-child, .v-application--is-ltr .v-list-item__icon:first-child {
      margin-right: 12px;
  }
  .navigation-drawer-top .v-list-group__header {
    /* padding: 0px 10px; */
  }
  .navigation-drawer-top .navigation-list-item {
    /* padding: 0px 10px; */
  }
 /* .navigation-drawer-top .v-list-item {
      padding: 0px 10px;
  }*/
</style>
