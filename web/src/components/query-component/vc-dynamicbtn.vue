<template>
  <div class="dynamicbtn-wrap" @mouseleave="listWrap = false">
    <template v-if="schema.items.length < 4">
      <v-btn class="show-btn" v-for="(item,index) in schema.items" :key="index" @click="btnClick(item)">
        <v-icon left class="dynamicbtn-icon">{{item.icon}}</v-icon>
        {{ $te(item.text)?$t(item.text):item.text }}
      </v-btn>
    </template>

    <!-- 下拉action -->
    <div v-else class="btn-wrap">
      <button class="action" @click="listWrap = !listWrap">{{$t('view.dynamicbtn.Action')}}</button>

      <v-list class="items-wrap" v-show="listWrap">
        <v-list-item-group v-model="item" color="primary">
          <v-list-item v-for="(item, i) in schema.items" :key="i" @click="btnClick(item)">
            <v-list-item-icon>
              <v-icon v-text="item.icon" class="dynamicbtn-icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </div>

</template>

<script>
  import base from "../utils/schema-base";
  import {exportEnvUrl} from "../../utils/env"

// isSort:ture,默认显示向下的箭头
  export default {
    mixins: [base],    
    // props: {
    //   schema: { type: Object, default: {} },
    //   model: Object,
    //   options: Object,
    //   searchValues: {}
    // },
    data() {
      return {
        item: 0,
        listWrap: false,
        // items: []
      };
    },
    // watch: {
    //   watchSchemaItems() {        
    //     this.items = this.schema.items;
    //   }
    // },
    // computed: {
    //   watchSchemaItems() {
    //     return this.schema.items;
    //   }
    // },
    methods: {
      btnClick(item) {        
        let target = item.target || "_blank";
        let that = this,
          tableCode = that.schema.tableCode || '';
        that.listWrap = false;
        that.url = ''
        if (item.type == 'export') {
          switch (that.$store.state.app.viewdataExport) {
            case "datatable":
              that.bus.$emit("export-datatable", tableCode);
              break;
            case "datatablegroup":
              that.bus.$emit("export-datatablegroup", tableCode);
              break;
            case "card":
              that.bus.$emit("export-card", tableCode);
              break;
            default:
              that.bus.$emit("toggle-datatable", tableCode);
              break;
          }
        } else {
          window.open(exportEnvUrl(this.to(item.href)), target);
        }       
      }
    },
    mounted() {
      // let schema = this.schema;
      // this.items = schema.items;
    }
  };
</script>

<style>
.dynamicbtn-wrap{
  min-height: 32px;
}
.dynamicbtn-wrap .show-btn {
  height: 40px !important;
  line-height: 40px;
  border-radius: 0;
  background: #fff !important;
  box-shadow: none !important;
  border: 1px solid rgb(224, 48, 30) !important;
  color: rgb(224, 48, 30) !important;
}
.dynamicbtn-wrap .v-list-item__icon{
  margin-right:12px !important;
}
.dynamicbtn-wrap .v-list-item{
  height:14px;
}
.dynamicbtn-wrap .v-btn {
  margin-right: 8px;
}
.dynamicbtn-wrap .btn-wrap {
  position: relative;
  top: 0px;
}
.dynamicbtn-wrap .btn-wrap .action {
  height: 40px !important;
  line-height: 40px;
  color: rgb(224, 48, 30);
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(224, 48, 30);
  position: relative;
  min-width: 100px;
  font-size: 16px;
  margin: 0 10px;
}
.dynamicbtn-wrap .items-wrap {
  position: absolute;
  right: 10px;
  background: #fff;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  z-index: 99;
  min-width: 140px;
  height: 200px;
  overflow: auto;
}
.dynamicbtn-wrap ::-webkit-scrollbar {
  width: 5px;
}
  .dynamicbtn-icon {
    color: #e0301e !important;
  }
</style>
