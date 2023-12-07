<template>
  <div :class="['vc-view-card-list', classes]" ref="vcViewCardList" v-resize="onResize"
    :style="{'overflow-y':'auto','height':height}">
    <template v-if="currentQueryResult.datalist != undefined && currentQueryResult.datalist.length > 0">
      <v-layout>
        <v-flex>
          <div class="vc-view-card-list-content" ref="vcViewCardListContent">
            <template v-for="(item, index) in currentQueryResult.datalist">
              <vc-view-card :schema="schema" :model="item" :cardIndex="index" :formHref="formHref" :key="index" />
            </template>
          </div>
        </v-flex>
      </v-layout>
    </template>
    <template v-if="(currentQueryResult.datalist == undefined || currentQueryResult.datalist.length == 0) && !$store.state.loading">
      <v-layout justify-center>
        <p class="loadMoreContent">{{$t('view.datatable.noDataAvailable')}}</p>
      </v-layout>
    </template>
    <export-component 
      :currentQueryResult="currentQueryResult"
      :selected="selected"
      :optionsSync="optionsSync"
      :formHref="formHref"
      :pageView="pageView"
      :schema="schema"
      :exportDatatabledialog="exportCarddialog"
      @closeExportdialog="closeExportdialog(data)"
      :searchValues="searchValues"
    />
  </div>
</template>

<script>
  import vcCard from "./vc-view-card.vue";
  import {
    mapMutations
  } from "vuex";
  import appInfo from "../../utils/appInfo";
  import queryFilter from "../utils/query-filter";
  import axios from "axios";
  import {
    exportEnvUrl
  } from "../../utils/env"
  import exportComponent from "../basic/vc-export.vue"

  export default {
    mixins: [queryFilter],
    data() {
      return {
        searchValues: {},
        lastCardHeight: 0,
        setSameHeight: false,
        formHref: '',
        loadMoreData: true,
        buttonLoading:false,
        exportCarddialog: false,
        whetherToIncludeLink: false,
        whetherToExportAllTheData: false,
        id: this.$dm_getGuid(),
        currentQueryResult: {
          datalist: [],
          totalDesserts: 0
        },
        optionsSync: {
          page: 1,
          itemsPerPage: 25,
          collation: ''
        },
        selected: []
      };
    },
    props: {
      schema: {
        type: Object,
        default: {}
      },
      model: Object,
      options: Object
    },
    watch: {
      "$store.state.app.qyeryResultFlag": {
        handler: function (val, oldVal) {
          var that = this;
          that.currentQueryResult = Object.assign({}, that.$store.state.app.qyeryResult[that.schema.query.code]);
        },
        deep: true,
      },
      "$store.state.app.buttonLoading": function (newVal, oldVal) {
        this.buttonLoading = newVal;
      },
    },
    computed: {
      height() {
        if (this.$vuetify.breakpoint.name == 'xs') {
          return (document.documentElement.clientHeight - 64 - 39 - 57) + 'px'
        } else {
          return (document.documentElement.clientHeight - 64 - 39 - 64 - 57) + 'px'
        }
      },
    },
    methods: {
      ...mapMutations("app", [
        "setQyeryResult",
        "setViewDataExport",
        "setSortByDataItems",
        "setbuttonLoading"
      ]),
      closeExportdialog(data){
        this.exportCarddialog = data;
      },
      initFormHref() {
        var app = appInfo();
        this.formHref =
          (window.urlMode == 'NOTENANTAPPCODE' ? '' : `/${app.tenantId}/${app.appCode}` ) +          
          "/form/" +
          this.schema.formName +
          "/preview/";
      },
      onResize() {
        let that = this;
        if (that.schema.cardParameter == null) {
          return;
        }
        if (
          that.$store.state.app.isPCBroswer &&
          that.schema.cardParameter.enableWaterFall
        ) {
          that.waterfall();
        }
      },
      filterSearchValues() {
        let that = this;
        if (that.watchSearchValues != undefined) {
          that.searchValues = that.watchSearchValues;
        }
        if (that.searchValues != undefined) {
          Object.keys(that.searchValues).forEach(function (key) {
            switch (key.toUpperCase()) {
              case "CURRENTUSERID":
                that.searchValues[key] = that.$store.state.userInfo.userID;
                break;
              case "CURRENTUSERNAME":
                that.searchValues[key] = that.$store.state.userInfo.userName;
                break;
              case "ALIASCODE":
                that.searchValues[key] = that.$route.params.p1;
                break;
              default:
                break;
            }
          });
        }
      },
      GetDataList() {
        let that = this;
        if (that.schema.query.code == "") {
          return;
        }
        that.setViewDataExport('card');
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage,
          search,
          collation
        } = that.optionsSync;

        that.$store.state.loading = true;
        //走后台接口
        that.filterSearchValues();
        var parameter = {
          queryId: that.schema.query.code,
          searchParam: {
            SearchValues: that.searchValues,
            PageSize: itemsPerPage,
            PageIndex: page,
            Orders: {},
            collation: collation,
          }
        };

        if (sortBy != undefined && sortBy != '') {
          sortBy.forEach(function (e, index) {
            if (e != "") {
              parameter.searchParam.Orders[e] = sortDesc[index] == false ? 1 : -1;
            }
          });
        }
         //改变类型为dateTimeRange的orders
        const keys = Object.keys(parameter.searchParam.Orders);
        that.schema.cardHeader.forEach(function (obj) {
          if(obj.dataType.toLowerCase() === 'datetimerange' && obj.value === keys[0]){
            const key = obj.value + "." + obj.sortField;
            parameter.searchParam.Orders[key] = parameter.searchParam.Orders[keys[0]];
            delete parameter.searchParam.Orders[keys[0]];
          }
        })

        that.$axios
          .post("/api/getDataByQueryId", parameter)
          .then(({
            data
          }) => {
            let result = data || [];
            if (result != null) {
              if (that.optionsSync.page != 1) {
                that.setQyeryResult({
                  key: that.schema.query.code,
                  value: {
                    datalist: that.$store.state.app.qyeryResult[that.schema.query.code].datalist.concat(
                      result.items
                    ),
                    totalDesserts: result.totalCount
                  }
                });
              } else {
                that.setQyeryResult({
                  key: that.schema.query.code,
                  value: {
                    datalist: result.items,
                    totalDesserts: result.totalCount,
                  }
                });
              }
              that.loadMoreData = true;
              that.$store.state.app.qyeryResultFlag = !that.$store.state.app.qyeryResultFlag;
              that.$nextTick(() => {
                that.initScroll();
                if (
                  that.$store.state.app.isPCBroswer &&
                  that.schema.cardParameter.enableWaterFall
                ) {
                  that.waterfall();
                }
              });
            }
            that.$store.state.loading = false;
          })
          .catch(err => {
            that.$store.state.loading = false;
            // console.log(err);
          });
      },
      loadMore() {
        let that = this;
        that.optionsSync.page++;
        that.GetDataList();
      },
      getClassObj(parent, className) {
        var obj = parent.getElementsByTagName("*"); //获取 父级的所有子集
        var pinS = []; //创建一个数组 用于收集子元素
        for (var i = 0; i < obj.length; i++) {
          //遍历子元素、判断类别、压入数组
          if (obj[i].className == className) {
            pinS.push(obj[i]);
          }
        }
        return pinS;
      },
      getminHIndex(arr, minH) {
        for (var i in arr) {
          if (arr[i] == minH) {
            return i;
          }
        }
      },
      waterfall() {
        let that = this;

        that.$nextTick(() => {
          var oParent = that.$el;
          var aPin = that.getClassObj(oParent, "grid-item");
          if (aPin == "") {
            return;
          }
          var iPinW = aPin[0].offsetWidth + 10; // 一个块框pin的宽
          let innerWidth = document.getElementsByClassName('vc-view-card-list')[0].offsetWidth;
          var num = Math.floor(innerWidth / iPinW); //每行中能容纳的pin个数【窗口宽度除以一个块框宽度】

          var pinHArr = []; //用于存储 每列中的所有块框相加的高度。
          for (var i = 0; i < aPin.length; i++) {
            //遍历数组aPin的每个块框元素
            var pinH = aPin[i].offsetHeight + 10;
            if (i < num) {
              pinHArr[i] = pinH; //第一行中的num个块框pin 先添加进数组pinHArr

              aPin[i].style.position = "absolute"; //设置绝对位移
              if (i > 0) {
                aPin[i].style.top = "0px";
                aPin[i].style.left = iPinW * i + "px";
              }
            } else {
              var minH = Math.min.apply(null, pinHArr); //数组pinHArr中的最小值minH
              var minHIndex = that.getminHIndex(pinHArr, minH);
              aPin[i].style.position = "absolute"; //设置绝对位移
              aPin[i].style.top = minH + "px";
              aPin[i].style.left = aPin[minHIndex].offsetLeft + "px";
              //数组 最小高元素的高 + 添加上的aPin[i]块框高
              pinHArr[minHIndex] += aPin[i].offsetHeight + 10; //更新添加了块框后的列高
            }
          }
          var maxH = Math.max.apply(null, pinHArr); //数组pinHArr中的最小值minH
          that.lastCardHeight = parseInt(maxH);

        });
      },
      initScroll() {
        let that = this;
        var dataTable = that.$refs.vcViewCardList;
        if (dataTable !== undefined) {
          var dt = document.querySelector(".vc-view-card-list")
          if (dt != undefined) {
            dt.addEventListener('scroll', that.onScroll);
          }
        }
      },
      onScroll(e) {
        let that = this;
        var dataTable = that.$refs.vcViewCardList;
        if (dataTable !== undefined) {
          var dt = document.querySelector(".vc-view-card-list")
          var viewH = dt.offsetHeight,
            contentH = dt.scrollHeight,
            scrollTop = e.target.scrollTop;

          if (scrollTop / (contentH - viewH) >= 0.95 && that.loadMoreData) {
            that.loadMoreData = false;
            if (that.currentQueryResult.totalDesserts > that.currentQueryResult.datalist.length) {
              that.loadMore();
            }
          }
        }
      },
      computedSortByDataItem() {
        let that = this;
        let sortBy = [];
        that.schema.cardHeader.forEach(function (item) {
          item.title = that.$te(
              "query_" +
              that.schema.query.code +
              ".Field." +
              item.value +
              ".label"
            ) ?
            that.$t(
              "query_" +
              that.schema.query.code +
              ".Field." +
              item.value +
              ".label"
            ) :
            item.title;
          if (item.sortable) {
            sortBy.push({
              "title": item.title,
              "value": item.value,
              "collation": item.collation,
              "sortField": item.sortField || ""
            });
          }
        });
        var _ = require("lodash");
        let newSortBy = _.uniqBy(sortBy, 'value')
        that.setSortByDataItems({
          queryCode: that.schema.query.code,
          querySortList: newSortBy,
          name:that.schema.name
        });
      }
    },
    mounted() {
      let that = this;
      if (that.schema.show) {
        that.$store.state.app.currentViewMode = 'cardlist';
        that.computedSortByDataItem();
      }
      that.initFormHref();
      that.optionsSync.itemsPerPage = that.schema.itemsPerPage ? that.schema.itemsPerPage : 25;

      if (that.schema.show) {
        that.GetDataList()
      }
      that.bus.$on("toggle-view-card", (enable) => {
        that.schema.show = enable;
        if (enable) {
          that.computedSortByDataItem();
        }
      });
      that.bus.$on("refresh-GetDataList", (obj, code) => {
        if(that.schema.show && (that.schema.name === code || code === '')){
          that.optionsSync.page = 1;
          that.optionsSync.itemsPerPage = that.schema.itemsPerPage;
          that.optionsSync.sortDesc = obj.sortDesc;
          that.optionsSync.sortBy = obj.sortBy;
          that.optionsSync.collation = obj.collation;
          that.GetDataList();
        }
      });
      that.bus.$off("export-card");
      that.bus.$on("export-card", (code) => {
        if(code === this.schema.name || code === ''){
          that.exportCarddialog = true;
          // that.whetherToIncludeLink = false
          // that.whetherToExportAllTheData = false
        }
      });
      that.initScroll();
    },
    components: {
      "vc-view-card": vcCard,
      "export-component": exportComponent
    }
  };

</script>

<style>
  .vc-view-card-list {
    margin-top: 10px;
  }

  .vc-view-card-list-content {
    position: relative !important;
  }

  .vc-view-card-list-content .vc-layout.layout {
    padding: 0 3px !important;
  }

  .vc-view-card-list-content .grid-item {
    /* float: left; */
  }

  .vc-view-card-list-content .meta-content {
    margin: 5px 10px;
  }

  .vc-view-card-list-content .meta-header {
    margin: 5px 10px;
  }

  .vc-view-card-list .loadMoreContent {
    margin-bottom: 35px !important;
  }

  .vc-view-card-list .loadMoreButton {
    margin-bottom: 35px !important;
  }

  .vc-view-card-list::-webkit-scrollbar {
    width: 4px !important;
    height: 4px !important;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .vc-view-card-list::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }

  .vc-view-card-list::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  .vc-view-card-list .text-overflow span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

</style>
