<template>
  <div :class="['sortbtn-wrap', classes]">
    <v-btn tabindex="0" :class="$vuetify.breakpoint.name == 'xs' ? 'mobileStatus' : 'status'" @click="click">
      {{$t("cardFieldOrderList.selecteOrder")}}
      <v-icon right size="12">pwc-icon pwc-trenddown</v-icon>
    </v-btn>
    <v-list class="items-wrap" v-show="listWrap" dense>
      <v-list-item-group v-model="item" color="primary">
        <v-list-item v-for="(item, i) in dataItems" :key="i" @click="toggleSort(item,i)">
          <v-icon v-if="item.sortDirection =='up' && i!=0">mdi mdi-arrow-up</v-icon>
          <v-icon v-else-if="item.sortDirection =='down' && i!=0">mdi mdi-arrow-down</v-icon>
          <v-icon v-else="item.sortDirection && i!=0"></v-icon>
          <v-list-item-title>{{item.title}}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
  import { mapMutations } from "vuex";
  import base from "../utils/schema-base";

  export default {
    mixins: [base],
    props: {
      schema: { type: Object, default: {} },
    },
    data() {
      return {
        listWrap: false,
        btntext: `${this.$t("cardFieldOrderList.selecteOrder")}`,
        sortDirection: "",
        item: 0,
        sortOption: {
          page: 1,
          itemsPerPage: 25,
          sortDesc: [],
          sortBy: [],
          queryCode: this.queryCode,
          collation:''
        },
        sortByDataItems: []
      };
    },
    computed: {
      dataItems() {
        let that = this;
        let newDatas = [];
        newDatas.push({
          "value": that.$t("schema-base.defaultBtns.selectOrder"),
          "title": that.$t("schema-base.defaultBtns.selectOrder"),
          "collation": '',
          "sortDirection":''
        });
        //console.log(9999,that.$store.state.app.sortByDataItems)
        const sortByDataItems = that.$store.state.app.sortByDataItems;
        if(that.schema.tableCode == "" || that.schema.tableCode === undefined){ //未绑定或历史数据
          newDatas = newDatas.concat(sortByDataItems[sortByDataItems.length-1]['querySortList']);
          that.sortByDataItems = sortByDataItems[sortByDataItems.length-1]['querySortList'];
        } else {
          sortByDataItems.forEach(item => {
            if(item.name === that.schema.tableCode){
              newDatas = newDatas.concat(item['querySortList']);
              that.sortByDataItems = item['querySortList'];
            }
          })
        }
        return newDatas;
      },
      queryCode() {
        return this.schema.query ? (this.schema.query.code ? this.schema.query.code : '') : '';
      }
    },
    methods: {
      click() {
        this.listWrap = !this.listWrap;
      },
      toggleSort(item, i) {
        let that = this;
        that.listWrap = false;
        if (i == 0) {
          that.sortByDataItems.forEach(item => {
            item.sortDirection = "";
            that.sortOption.sortDesc = []
          });
        } else {
          that.transferSortDirection(item)
        }
      },
      transferSortDirection(item) {
        let that = this;
        that.$store.state.app.cardListOrderCollation = '';
        if (that.$store.state.app.sortByDataItems) {
          that.sortByDataItems.forEach(e => {
            if (e.value == item.value) {
              switch (item.sortDirection) {
                case "up":
                  item.sortDirection = "down";
                  that.sortOption.sortDesc = [true]
                  break;
                case "down":
                  item.sortDirection = "up";
                  that.sortOption.sortDesc = [false]
                  break;
                default:
                  item.sortDirection = "up";
                  that.sortOption.sortDesc = [false]
                  break;
              }
              that.sortOption.sortBy = [item.value]
              that.sortOption.collation = e.collation ? e.collation : '';
              let code = that.schema.tableCode || '';
              that.bus.$emit("refresh-GetDataList", that.sortOption, code);
            } else {
              e.sortDirection = "";
            }
          });
        }        
      }
    },
    mounted() {
    }
  };
</script>

<style>
  .sortbtn-wrap {
    position: relative;
    right: 0;
    z-index: 3;
    min-height: 40px;
  }

    .sortbtn-wrap .v-list {
      padding: 0px;
    }

    .sortbtn-wrap .v-list-item__title {
      line-height: normal !important;
    }

    .sortbtn-wrap .v-list-item {
      height: 14px;
    }

    .sortbtn-wrap .mobileStatus {
      text-align: left;
      margin-top: 6px;
      margin-right: 10px;
      padding: 3px 26px 5px 12px;
      background-color: rgb(255, 255, 255);
      font-size: 14px;
      border-width: 1px;
      border-style: solid;
      position: relative;
      height: 28px;
      min-width: 110px;
      /* color: black; */
      border-color: rgba(0,0,0,.12) !important;
    }

      .sortbtn-wrap .mobileStatus::before {
        /* content: "";
        position: absolute;
        right: 8px;
        top: 10px;
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-left: 6px solid rgba(0, 0, 0, 0.87);
        border-right: 6px solid transparent;
        border-bottom: 6px solid transparent;
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg); */
      }

    .sortbtn-wrap .status {
      margin-left:10px;
      text-align: left;
      padding: 5px 26px 5px 12px;
      /* background-color: rgb(255, 255, 255); */
      font-size: 14px;
      border-width: 1px;
      border-style: solid;
      position: relative;
      height: 40px;
    }

      .sortbtn-wrap .status::before {
        content: "";
        position: absolute;
        right: 8px;
        top: 17px;
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-left: 6px solid rgba(0, 0, 0, 0.87);
        border-right: 6px solid transparent;
        border-bottom: 6px solid transparent;
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg);
      }

    .sortbtn-wrap .items-wrap {
      position: absolute;
      top: 40px;
      right: 1px;
      background: #fff;
      box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
      max-width: 200px;
      overflow-y: auto;
      min-width: 180px;
    }

    .sortbtn-wrap ::-webkit-scrollbar {
      width: 5px;
    }

    .sortbtn-wrap .items-wrap .v-icon {
      margin-right: 8px;
    }

    .sortbtn-wrap .status {
      border-color: rgba(0,0,0,.12) !important;
      min-width: 110px !important;
    }

      .sortbtn-wrap .status .v-icon {
        /* color: rgb(224, 48, 30); */
      }
</style>
