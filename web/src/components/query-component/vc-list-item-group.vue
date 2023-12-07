<template>
  <v-list-group no-action :class="'v-list-group-level'+currentlevel">
    <template v-slot:activator>
      <v-list-item @click="vlistitemClick(parentitem,parentDrawerName,'', parentitem.url)" :class="activeitemclass(parentitem)">
        <v-list-item-icon>
          <v-icon>{{(parentitem.icon.indexOf('pwc-') > -1 ? 'pwc-icon ' : 'mdi ') + parentitem.icon}}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title tabindex="0" :aria-label="parentitem.displayName">{{ parentitem.displayName }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <template v-for="item in items">
      <template v-if="item.children && item.children.length">
        <v-list>
          <listitemgroupwrapper :schema="schema" :curentitem="item" :level="currentlevel" :currentDrawerName="parentDrawerName" />
        </v-list>
      </template>
      <template v-else>
        <v-list-item :key="item.title"
                     @click="vlistitemClick(item,parentDrawerName,item.name,item.url)"
                     :class="activeitemclass(item)"
                     link>
          <v-list-item-icon>
            <v-icon>{{ (item.icon.indexOf('pwc-') > -1 ? 'pwc-icon ' : 'mdi ') + item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title tabindex="0" :aria-label="item.displayName">{{ item.displayName }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </template>
  </v-list-group>
</template>

<script>
  import base from "../utils/schema-base";
  import { mapMutations } from "vuex";

  export default {
    mixins: [base],
    components: {
      listitemgroupwrapper: () => import("./vc-list-item-group.vue")
    },
    inject: {
      NavigationManager: {
        default: {
          toggleNavigation() { }
        }
      },
    },
    name: "vc-list-item-group-component",
    props: {
      schema: { type: Object, default: {} },
      curentitem: {},
      level: 0,
      currentDrawerName: []
    },
    data() {
      return {
        parentitem: {},
        items: [],
        right: null,
        currentlevel: 0,
        parentDrawerName: [],
        activeParentId: ""
      };
    },
    computed: {
      activeitemclass() {
        return function (item) {
          if (item.id == this.$store.state.app.navigationDrawerActiveItem.id) {
            return "v-list-item-root v-item--active v-list-item--active primary--text v-list-group--active";
          } else {
            return "v-list-item-root";
          }
        };
      }
    },
    created() {
      var that = this;
      if (that.curentitem) {
        that.parentitem = that.curentitem;
      }
      if (that.curentitem.children) {
        that.items = that.curentitem.children;
      }
      that.filterDisplayItems(that.items);
      that.currentlevel = that.level + 1;
      if (that.currentDrawerName) {
        let newArray = that.currentDrawerName.concat([{ name: that.curentitem.name, code: that.curentitem.code }]);
        that.parentDrawerName = Object.assign([], newArray);
      } else {
        that.parentDrawerName = Object.assign([], [{ name: that.curentitem.name, code: that.curentitem.code }]);
      }
    },
    methods: {
      ...mapMutations("app", [
        "setnavigationDrawerActiveItem",
        "setBreadcrumbsData",
      ]),
      filterDisplayItems(arr) {
        for (var i = 0; i < arr.length; i++) {
          arr[i].displayName = this.$te('menu.' + arr[i].code) ? this.$t('menu.' + arr[i].code) : arr[i].name;
          if (arr[i].display == false) {
            arr.splice(i--, 1);
          } else if (arr.children && arr.children.length > 0) {
            this.filterDisplayItems(arr.children);
          }
        }
      },
      vlistitemClick(item, parentDrawerName, text, viewAlias) {
        let that = this
              //清空floatingButtonItems
      this.$store.state.app.floatingButtonItems = [];
       
        if (item.type == 'link') {
          var tempHttp = item.url.substr(0, 7).toLowerCase();
          var tempHttps = item.url.substr(0, 8).toLowerCase();
          if (tempHttp == "http://" || tempHttps == "https://") {
            window.open(item.url, "_blank");
          } else {
            //追加http://
            window.open("http://" + item.url, "_blank");
          }
          return;
        } else if (item.type == 'folder') {
          return;
        } else {         
          let newArray = parentDrawerName.concat([{ name: item.displayName, code: item.code }]);
          that.setBreadcrumbsData(newArray);
          that.setnavigationDrawerActiveItem({
            id: item.id,
            viewAlias: item.url,
            type: item.type,
          });

          that.NavigationManager.toggleNavigation();
        }      
      }
    }
  };
</script>
<style scoped>
  .v-icon {
    margin-top: 5px;
  }

  .v-list-group--no-action > .v-list-group__items > div > .v-list-item {
    padding-left: 25px;
  }

  .v-list-item {
    padding: 0px;
  }

  .v-list-group-level2 {
    margin-left: 15px;
  }

  .v-list-group-level3 {
    margin-left: 15px;
  }

  .v-list-group-level4 {
    margin-left: 15px
  }
</style>
