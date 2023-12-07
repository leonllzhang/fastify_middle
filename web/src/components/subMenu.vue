<template>
  <v-menu v-model="menuOpened" :value="openMenu" :close-on-content-click="false" 
    :offset-x="isOffsetX" :offset-y="isOffsetY" :open-on-hover="isOpenOnHover" 
    :left="isXOverflowing" 
      :min-width="isSubMenu ? 12 : undefined"
      :max-width="menuMaxWidth"
      :ref="'menu'">
    <!-- 
      :left="false"
      :min-width="isSubMenu ? '0px' : undefined" 
    -->
    <template v-slot:activator="{ on, attrs }">
      <!-- Icon button -->
      <!-- <v-btn
        v-if='icon'
        v-on="on"
        :color='color'
      >
        <v-icon>
          {{ icon }}
        </v-icon>
      </v-btn> -->

      <!-- Nested submenu -->
      <v-list-item v-if="isSubMenu" v-bind="attrs" v-on="on" @click="emitClickEvent(menuObj)" 
          :ripple="!isFolder(menuObj)"
          :class="['d-flex', 'justify-space-between', {
            'active-page-title': isActivePage(menuObj.code, menuObj.type, menuObj.url),
            'isFolderButton': isFolder(menuObj)
          }]">
          <v-list-item-action v-show="menuObj.icon && showSubMenuIcon" class="mr-3">
            <v-icon>{{ menuObj.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-title>
            {{ menuItemName }}
          </v-list-item-title>
        <!-- <span class="">{{ menuItemName }}</span> -->
        <div class="flex-grow-1"></div>
        <v-icon class="pl-2"> mdi-chevron-right </v-icon>
      </v-list-item>

      <!-- Lv1 Menu Leaf -->
      <v-btn
        v-else
        v-bind="attrs"
        v-on="on"
        text
        :class="{
          'active-page': isActivePage(menuObj.code, menuObj.type, menuObj.url),
          'isFolderButton': isFolder(menuObj)
        }"
        :ripple="!isFolder(menuObj)"
        @click="emitClickEvent(menuObj)">
        {{ menuItemName }}
        <!-- Down icon slot -->
        <slot> </slot>
      </v-btn>
    </template>

    <!-- If have childern -->
    <v-list>
      <template v-for="(item, index) in menuItems || []">
        <v-divider :key="index" v-if="item.isDivider" />

        <!-- sub level nested menu -->
        <sub-menu v-else-if="item.children.length > 0 && item.type.toLowerCase() != 'view'" :is-offset-x="true" :is-offset-y="false" :isOpenOnHover="true" :is-sub-menu="true" :showSubMenuIcon="showSubMenuIcon" :key="index" :menuObj="item" :menuItems="item.children" :name="item.name" @sub-menu-click="emitClickEvent" @onActiveSubMenu="changeActiveSubMenu" />

        <!-- Sub lv menu leaf -->
        <v-list-item v-else :key="index" @click="emitClickEvent(item)" @mouseover="changeActiveSubMenu" 
        :ripple="!isFolder(item)"
        :class="[{
            'active-page-title': isActivePage(item.code, item.type, item.url),
            'isFolderButton': isFolder(item)
          }]"
        >
          <v-list-item-action v-show="item.icon && showSubMenuIcon" class="mr-3">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-title>
            {{ $te("menu." + item.code) ? $t("menu." + item.code) : item.name }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script>
import { exportEnvUrl } from "../utils/env";

export default {
  components: {
    "sub-menu": () => import("./subMenu.vue"),
  },
  name: "sub-menu",
  props: {
    name: String,
    icon: String,
    showSubMenuIcon: { type: Boolean, default: false },
    index: Number,
    menuObj: Object,
    menuItems: Array,
    color: { type: String, default: "secondary" },
    isOffsetX: { type: Boolean, default: false },
    isOffsetY: { type: Boolean, default: true },
    isSubMenu: { type: Boolean, default: false },
    isOpenOnHover: { type: Boolean, default: true },
    transition: { type: String, default: "slide-x-transition" },
  },
  data: () => ({
    openMenu: false,
    menuOpened: false,
    showingMenu: null,
    left: false,
    isMounted: false,
  }),
  computed: {
    menuItemName() {
      if (this.menuObj) {
        return this.menuObj.name.toLowerCase() == "admin" ? this.$t("sysadmintopmenu.admin") : this.$te("menu." + this.menuObj.code) ? this.$t("menu." + this.menuObj.code) : this.menuObj.name;
      } else {
        return "Error";
      }
    },
    isXOverflowing() {
      let menuRef = this.$refs.menu;
      let vm = this;
      if (this.isMounted && menuRef) {
        // View Canvas width
        var documentWidth = window.innerWidth || document.documentElement.clientWidth;
        var toLeft = menuRef.pageYOffset + documentWidth;

        // Menu show X axis
        var activatorLeft = menuRef.dimensions.activator.left;
        var activatorWidth = menuRef.dimensions.activator.width;
        var contentLeft = menuRef.dimensions.content.left;      // for ref
        var contentWidth = menuRef.dimensions.content.width;
        var totalWidth = activatorLeft + activatorWidth + contentWidth + 24; // 24 = 12 + 12, this is parent and child min-margin-right in vuetify source code

        // console.log("menuRef -> ", menuRef);
        // console.log(`
        //   code: ${vm.menuObj.name}
        //   documentWidth: ${documentWidth}px
        //   toLeft: ${toLeft}px

        //   activatorLeft: ${activatorLeft}px
        //   activatorWidth: ${activatorWidth}px
        //   contentLeft: ${contentLeft}px
        //   contentWidth: ${contentWidth}px
        //   totalWidth: ${totalWidth}px

        //   w < m: ${toLeft} < ${totalWidth}
        //   isXOverflowing: ${toLeft < totalWidth}`);

        return toLeft < totalWidth;
      } else {
        return false;
      }
    },
    menuContentWidth(){
      let menuRef = this.$refs.menu;
      let vm = this;
      if (this.isMounted && menuRef) {
        var contentWidth = menuRef.dimensions.content.width;
        // console.log(`
        //   code: ${vm.menuObj.name}
        //   contentWidth: ${contentWidth}px`);
          return contentWidth;
      } else {
        return 'unset';
      }
    },
    menuMaxWidth(){
      // Add 0.5 for ellipsis
      return this.menuContentWidth ? this.menuContentWidth + 0.5 : 'fit-content';
    }
  },
  watch: {
    "$vuetify.breakpoint.name":{
      handler(newVal, oldVal){
        // console.log(newVal, oldVal);
        if(!['lg', 'xl'].includes(newVal)){
          this.openMenu = false;
          this.menuOpened = false;
          this.showingMenu = null;
          this.left = false;
        }
      }
    },
    isXOverflowing: {
      immediate: true,
      handler(newVal, oldVal) {
        // console.log("isXOverflowing", newVal, oldVal);
        let menuRef = this.$refs.menu;
        if(newVal == true){
          var calculatedMinWidth = menuRef.calculatedMinWidth;
          var contentWidth = menuRef.dimensions.content.width;
          var menuWidth = Math.max(contentWidth, parseFloat(calculatedMinWidth));
          var calcLeft = menuRef.calcLeft(menuWidth);
          var activatorLeft = menuRef.dimensions.activator.left;
          var defaultOffset = menuRef.defaultOffset;
          var calcLeftAuto = menuRef.calcLeftAuto();
          var calculatedLeft = menuRef.calculatedLeft;
          var computedLeft = menuRef.computedLeft;
          var calcXOverflow = menuRef.calcXOverflow(calcLeftAuto, menuWidth)
          var calcXOverflow2 = menuRef.calcXOverflow(computedLeft, menuWidth)
          
          // console.log(`
          // calculatedMinWidth: ${calculatedMinWidth}
          // contentWidth: ${contentWidth}
          // menuWidth: ${menuWidth}
          // (max(contentWidth,calculatedMinWidth))
          // calcLeft: ${calcLeft}
          // calcXOverflow2: ${calcXOverflow2}

          // activatorLeft: ${activatorLeft}
          // defaultOffset: ${defaultOffset * 2}
          // calcLeftAuto: ${calcLeftAuto}
          // (activatorLeft - defaultOffset)
          
          // calculatedLeft: ${calculatedLeft}
          // *computedLeft: ${computedLeft}
          // calcXOverflow: ${calcXOverflow}`);
        }

      },
    },
    menuOpened: function () {
      this.isOpenOnHover = !this.menuOpened;
      this.emitOnActiveMenu();
    },
    showingMenu(newVal, oldVal) {
      //console.log('subMenu showingMenu', newVal, oldVal);
      if (oldVal) {
        oldVal.openMenu = false;
        oldVal.menuOpened = false;
      }
    },
  },
  methods: {
    getIsXOverflowing(menuRef, vm) {
      // View Canvas width
      var documentWidth = window.innerWidth || document.documentElement.clientWidth;
      var toLeft = menuRef.pageYOffset + documentWidth;

      // Menu show X axis
      var activatorLeft = menuRef.dimensions.activator.left;
      var activatorWidth = menuRef.dimensions.activator.width;
      var contentLeft = menuRef.dimensions.content.left;
      var contentWidth = menuRef.dimensions.content.width;
      var totalWidth = activatorLeft + activatorWidth + contentWidth;

      var computedLeft = menuRef.computedLeft;

      var isXOverflowing = toLeft < totalWidth;
      // console.log("menuRef -> ", menuRef);
      console.log(`
        code: ${vm.menuObj.name}
        documentWidth: ${documentWidth}px
        toLeft: ${toLeft}px

        activatorLeft: ${activatorLeft}px
        activatorWidth: ${activatorWidth}px
        contentLeft: ${contentLeft}px
        contentWidth: ${contentWidth}px
        totalWidth: ${totalWidth}px

        computedLeft: ${computedLeft}px

        w < m: ${toLeft} < ${totalWidth}
        isXOverflowing: ${isXOverflowing}`);

      return isXOverflowing;
    },
    emitClickEvent(item) {
      this.$emit("sub-menu-click", item);
      if (item.type != "folder") {
        this.openMenu = false;
        this.menuOpened = false;
      }
    },
    emitOnActiveMenu() {
      if (!this.isSubMenu && this.menuOpened) {
        // console.log("Root Menu: emitOnActiveRootMenu");
        this.$emit("onActiveRootMenu", this);
      } else if (this.isSubMenu && this.menuOpened) {
        // console.log("Sub Menu: emitOnActiveSubMenu");
        this.$emit("onActiveSubMenu", this);
      }
    },
    changeActiveSubMenu(showingMenu) {
      this.showingMenu = showingMenu;
    },
    // active(num, text) {
    //   this.openMenu = true;
    //   this.ins = num;
    //   if (text.type == "link") {
    //     var tempHttp = text.url.substr(0, 7).toLowerCase();
    //     var tempHttps = text.url.substr(0, 8).toLowerCase();
    //     if (tempHttp == "http://" || tempHttps == "https://") {
    //       window.open(text.url, "_blank");
    //     } else {
    //       //追加http://
    //       window.open("http://" + text.url, "_blank");
    //     }
    //   } else if (text.type == "view") {
    //     window.top.location.href = exportEnvUrl(
    //       window.location.pathname
    //         .split("/")
    //         .splice(0, 3)
    //         .concat(["view"])
    //         .concat([text.code.replace(/^\/*/, "")])
    //         .join("/")
    //     );
    //   } else if (text.type == "page") {
    //     //修改这里解决 在dev的 iframe里面，点菜单，外面的父窗口链接没变
    //     window.top.location.href = exportEnvUrl(
    //       window.location.pathname
    //         .split("/")
    //         .splice(0, 3)
    //         .concat(["page"])
    //         .concat([text.url.replace(/^\/*/, "")])
    //         .join("/")
    //     );
    //   } else if (text.type == "admin") {
    //     window.open(
    //       window.location.pathname
    //         .split("/")
    //         .splice(0, 3)
    //         .concat([text.url.replace(/^\/*/, "")])
    //         .join("/"),
    //       "_blank"
    //     );
    //   } else {
    //     window.top.location.href = exportEnvUrl(
    //       window.location.pathname
    //         .split("/")
    //         .splice(0, 3)
    //         .concat([text.url.replace(/^\/*/, "")])
    //         .join("/")
    //     );
    //   }
    // },
    isActivePage(code, type, url) {
      code = code.toLowerCase();
      type = type.toLowerCase();
      url = url.toLowerCase(); 
      let newUrl = type == "link" || type == "page" ? type + "/" + url : type + "/" + code;
      let pathname = ''
      // 如果是自定义域名，不带tenantId和appcode
      if (window.urlMode == 'NOTENANTAPPCODE') {
        pathname = window.location.pathname.slice(1)
      } else {
        // 如果是传统域名
        pathname = window.location.pathname.split("/").splice(3, 4).join("/").toLowerCase();
      }      
      return (pathname && pathname == newUrl) || (!pathname && type == "home");
    },
    isFolder(item){
      let type = item.type ? item.type.toLowerCase() : item.type;
      return type === 'folder';
    }
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>

<style lang="scss" scoped>
.active-page-title {
  /* border-bottom: 2px solid #e0301e; */
    color: var(--v-primary-base) !important;

    & .v-icon {
      color: var(--v-primary-base) !important;
    }

    & .v-list-item__title {
      color: var(--v-primary-base) !important;
    }
  }

  .v-list-item__action{
    min-width: auto;
  }

  .isFolderButton{
    cursor: default;
    
    &:focus {
      &:before {
        opacity: 0.04;
      }
    }
  }
</style>