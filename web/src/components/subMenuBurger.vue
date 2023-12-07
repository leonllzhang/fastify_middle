<template>
  <div :class="['burgerMenu', 'level-' + level, {expand: isExpanded}]">
    <div class="v-list__expandRow">
      <v-list-item v-if="menuItems.type.toLowerCase() != 'folder'"  :class="{ 'nav-active': isActivePage(menuItems.code, menuItems.type, menuItems.url)}" @click="emitClickEvent(menuItems)">
        <v-list-item-action v-if="menuItems.icon && showSubMenuIcon" class="mr-3">
          <v-icon>{{ menuItems.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>
          {{ menuItems.name.toLowerCase() == "admin" ? $t("sysadmintopmenu.admin") : $te("menu." + menuItems.code) ? $t("menu." + menuItems.code) : menuItems.name }}
        </v-list-item-title>
      </v-list-item>
      <a v-if="menuItems.type.toLowerCase() != 'folder'" class="expandBtn" @click.prevent="clickEvent" v-ripple><span></span></a>

      <v-list-item v-else class="expandBtn is-folder-item" @click.prevent="clickEvent">
        <v-list-item-action v-if="menuItems.icon && showSubMenuIcon" class="mr-3">
          <v-icon>{{ menuItems.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>
          {{ menuItems.name.toLowerCase() == "admin" ? $t("sysadmintopmenu.admin") : $te("menu." + menuItems.code) ? $t("menu." + menuItems.code) : menuItems.name }}
        </v-list-item-title>
      </v-list-item>
    </div>
    <v-expand-transition>
      <div v-show="isExpanded" class="v-list__subMenu__child__wrapper">
        <div class="v-list__subMenu__child">
          <template v-for="(text, index) in menuItems.children">
            <div class="v-list__subMenu__parent" :key="index">
              <v-list-item v-if="text.children.length == 0 || text.type.toLowerCase() == 'view'" :class="{ 'nav-active': isActivePage(text.code, text.type, text.url) }" @click="emitClickEvent(text)">
                <v-list-item-action v-if="text.icon && showSubMenuIcon" class="mr-3">
                  <v-icon>{{ text.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-title>
                  <!-- <span class="circle-wrap"></span> -->
                  {{ text.name.toLowerCase() == "admin" ? $t("sysadmintopmenu.admin") : $te("menu." + text.code) ? $t("menu." + text.code) : text.name }}
                </v-list-item-title>
              </v-list-item>
              <sub-menu-burger v-if="text.children.length > 0 && text.type.toLowerCase() != 'view'" :menuItems="text" :level="level + 1" :showSubMenuIcon="showSubMenuIcon" @sub-menu-click="emitClickEvent"></sub-menu-burger>
            </div>
          </template>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  components: {
    "sub-menu-burger": () => import("./subMenuBurger.vue"),
  },
  name: "sub-menu-burger",
  props: {
    level: {
      type: Number,
      default: 1,
    },
    index: Number,
    menuItems: Object,
    showSubMenuIcon: { type: Boolean, default: false },
  },
  data: () => ({
    isExpanded: false,
  }),
  computed: {
    isActivePage() {
      return function (code, type, url) {
        code = code.toLowerCase();
        type = type.toLowerCase();
        url = url.toLowerCase();

        let newUrl = type == "link" || type == "page" ? type + "/" + url : type + "/" + code;

        let pathname = window.location.pathname.split("/").splice(3, 4).join("/").toLowerCase();

        return (pathname && pathname == newUrl) || (!pathname && type == "home");
      };
    },
  },
  watch: {},
  methods: {
    emitClickEvent(item) {
      this.$emit("sub-menu-click", item);
    },
    // active(num, text) {
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
    //   } else if (text.type == "folder") {
    //     console.log("this is folder, do nothing");
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
    clickEvent(event) {
      this.isExpanded = !this.isExpanded;
    },
  },
  mounted() {},
};
</script>

<style lang="scss">
.v-menu {
  .v-list-item__action {
    [class^="pwc-"]:before, [class*="pwc-"]:before {
      margin: 0;
    }
  }
}

.burgerMenu {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  min-width: 0;

  &.expand {
    & > * > .expandBtn {
      &:after {
        transform: rotate(45deg) translate(3px, 26px);
        border-width: 2px 0 0 2px;
      }
    }
  }

  .expandBtn {
    width: 48px;
    height: 48px;
    min-width: 48px;
    position: relative;
    cursor: pointer;
    color: inherit;

    &:before {
      background-color: currentColor;
      bottom: 0;
      content: "";
      left: 0;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: .3s cubic-bezier(.25,.8,.5,1);
    }

    &:hover {
      &:before {
        opacity: .04;
      }
    }

    &:after {
      position: absolute;
      top: 0;
      right: 0;
      bottom: unset;
      left: unset;
      opacity: 1;
      transform: rotate(45deg) translate(-2px, 21px);
      display: inline-block;
      content: "";
      border: solid #757575;
      border-width: 0 2px 2px 0;
      padding: 6px;
      box-sizing: border-box;
      background: none;
      transition: none;
      min-height: 0;
    }
  }

  .v-list__expandRow {
    display: flex;

    .v-list-item {
      min-width: 0;
    }
  }

}
</style>