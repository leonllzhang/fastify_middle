<template>
  <div class="datatable-wrap">
    <v-data-table
      tabindex="0"
      ref="vcDataTable"
      v-model="selected"
      :loading="loading"
      :loading-text="$t('view.datatable.loading-text')"
      :hide-default-header="$vuetify.breakpoint.name == 'xs'"
      :headers="datatableHeader"
      :items="currentQueryResult.datalist"
      :options.sync="optionsSync"
      :server-items-length="currentQueryResult.totalDesserts"
      :single-select="schema.singleSelect ? schema.singleSelect : singleSelect"
      @click:row="clickRow"
      @dblclick:row="dblclickRow"
      item-key="_id"
      :show-select="schema.enableMultiSelect"
      :height="height"
      :disable-sort="disableSort"
      fixed-header
      hide-default-footer
      :class="['query-datatable elevation-1', classes]"
      :no-data-text="$t('view.datatable.noDataAvailable')"
    >
      <template
        v-for="itemhearder in datatableHeader"
        v-slot:[getComputedValue(itemhearder)]="{ item }"
      >
        <template v-if="itemhearder.color">
          <template v-if="itemhearder.docLink">
            <v-chip :text-color="itemhearder.textColor"
                    :color="itemhearder.color"
                    @click="clickChip(item)"
                    dark>{{ getShowValue(item, itemhearder) }}</v-chip>
          </template>
          <template v-else>
            <v-chip :text-color="itemhearder.textColor"
                    :color="itemhearder.color"
                    dark>{{ getShowValue(item, itemhearder) }}</v-chip>
          </template>
        </template>
        <template v-else>
          <template v-if="itemhearder.docLink">
            <a :href="returnAlink(formHref + item._id)" target="_blank">
              {{
              getShowValue(item, itemhearder)
              }}
            </a>
          </template>
          <template v-else>
            {{ getShowValue(item, itemhearder) }}
          </template>
        </template>
      </template>         
      <template v-slot:footer>
        <div>
          <v-card class="xl12 align-that-center">
            <p class="text-center loadMore">
              <span>
                {{
                  currentQueryResult.datalist
                    ? currentQueryResult.datalist.length
                    : ""
                }}
                {{ $t("view.datatable.of") }}
                {{ currentQueryResult.totalDesserts }}
              </span>
            </p>
          </v-card>
        </div>
      </template>
    </v-data-table> 
    <export-component 
      :currentQueryResult="currentQueryResult"
      :selected="selected"
      :optionsSync="optionsSync"
      :formHref="formHref"
      :pageView="pageView"
      :schema="schema"
      :exportDatatabledialog="exportDatatabledialog"
      @closeExportdialog="closeExportdialog(data)"
      :searchValues="searchValues"
    />
  </div>
</template>

<script>
  import { mapMutations } from "vuex";
  import appInfo from "../../utils/appInfo";
  import queryFilter from "../utils/query-filter";
  import axios from "axios";
  import { exportEnvUrl, formatFieldValue, getEnv } from "../../utils/appBaseMethods";
  import exportComponent from "../basic/vc-export.vue"

  export default {
    mixins: [queryFilter],
    components: {
      exportComponent
    },
    data() {
      return {
        disableSort: false,
        searchValues: {},
      
        currentPageView: (
          this.options.pageView ||
          this.$route.params.pageView ||
          ""
        ).toLowerCase(),
        multiSort: false,
        loading: false,
        selected: [],
        singleSelect: false,
        formHref: "",
        loadMoreData: true,
        exportDatatabledialog: false,
        tableWidth: "100%",
        currentQueryResult: {
          datalist: [],
          totalDesserts: 0
        },
        optionsSync: {
          page: 1,
          itemsPerPage: 25,
          collation: ''
        },
      };
    },
    watch: {
      selected() {
        this.updateQyerySelectedResult();
      },
      tableWidth() {
        var dataTable = this.$refs.vcDataTable;
        if (dataTable !== undefined) {
          var dt = dataTable.$el.querySelector(".v-data-table__wrapper table");
          if (dt != undefined) {
            dt.setAttribute("style", "width:" + this.tableWidth);
          }
        }
      },
      "$store.state.app.qyeryResultFlag": {
        handler: function (val, oldVal) {
          var that = this;
          that.currentQueryResult = Object.assign({}, that.$store.state.app.qyeryResult[that.schema.query.code]);
        },
        deep: true,
      },
      "optionsSync": {
        handler: function (val, oldVal) {
          if (val && oldVal && oldVal.sortBy && (val.sortBy.length == 0 && oldVal.sortBy.length != 0)) {
            this.dataReset()
          } else if (val && oldVal && val.sortBy.length > 0 && ((val.sortBy[0] !== oldVal.sortBy[0]) || (val.sortDesc[0] !== oldVal.sortDesc[0]))) {
            this.dataReset()
          }
        }
      },
      // "$store.state.app.buttonLoading": function (newVal, oldVal) {
      //   this.buttonLoading = newVal;
      // },
      // "$store.state.app.detailLoading": function (newVal, oldVal) {
      //   this.detailLoading = newVal;
      // },
    },
    computed: {
      datatableHeader() {
        //支持datatableHeader 多语
        let that = this;
        let totalWidth = 0;
        if (that.schema.datatableHeader.length == 0) return;
        let dataheaders = [];
        that.schema.datatableHeader.forEach(function (item) {
          var newitem = JSON.parse(JSON.stringify(item));
          newitem.text = that.$te(
            "query_" +
            that.schema.query.code +
            ".Field." +
            item.value +
            ".label"
          )
            ? that.$t(
              "query_" +
              that.schema.query.code +
              ".Field." +
              item.value +
              ".label"
            )
            : item.text;
          if (that.$vuetify.breakpoint.name == "xs") {
            that.disableSort = true; //为了保持手机上的显示效果，移除了再pc端使用头部排序规则
          }
          totalWidth = parseInt(totalWidth) + parseInt(item.width);
          newitem.width = item.width + "%";
          dataheaders.push(newitem);
        });
        that.tableWidth = totalWidth + "%";
        return dataheaders;
      },
      height() {
        if (this.$vuetify.breakpoint.name == "xs") {
          return document.documentElement.clientHeight - 64 - 39 - 57 + "px";
        } else {
          return document.documentElement.clientHeight - 64 - 39 - 64 - 57 + "px";
        }
      }
    },
    methods: {
      ...mapMutations("app", [
        "setQyeryResult",
        "setQyerySelectedResult",
        "setViewDataExport",
        "setSortByDataItems"
      ]),
      closeExportdialog(data){
        this.exportDatatabledialog = data;
      },
      computedSortByDataItem() {
        let that = this;
        let sortBy = [];
        that.schema.datatableHeader.forEach(function (item) {
          if (item.sortable) {
            sortBy.push({ "title": item.text, "value": item.value, "collation": item.collation, "sortField": item.sortField || "" });
          }
        });
        var _ = require("lodash");
        let newSortBy = _.uniqBy(sortBy, 'value')
        that.setSortByDataItems({ queryCode: that.schema.query.code, querySortList: newSortBy,name:that.schema.name });
      },
      updateQyerySelectedResult() {
        let that = this;
        let existed = false;
        if (
          that.$store.state.app.qyerySelectedResult &&
          that.$store.state.app.qyerySelectedResult.length > 0
        ) {
          that.$store.state.app.qyerySelectedResult.map((m) => {
            if (m.key == that.schema.name) {
              m.value = that.selected;
              existed = true;
            }
          });
        }
        if (!existed) {
          that.$store.state.app.qyerySelectedResult = [];
          that.$store.state.app.qyerySelectedResult.push({
            key: that.schema.name,
            value: that.selected,
          });
          that.setQyerySelectedResult(that.$store.state.app.qyerySelectedResult);
        }
      },
      returnAlink(url) {
        return exportEnvUrl(url);
      },
      getShowValue(item, itemhearder) {
        return formatFieldValue(item, itemhearder, this);
      },
      getPeopleShowValue(item, itemhearder) {
        try {
          if (!item[itemhearder.value]) {
            return;
          }
          if (item[itemhearder.value].length > 1) {
            let showValue = "";
            item[itemhearder.value].map((itemData) => {
              showValue = showValue + itemData[itemhearder.dataFormat] + ",";
            });
            showValue = showValue.substr(0, showValue.length - 1);
            return showValue;
          } else if (item[itemhearder.value].length == 1) {
            return item[itemhearder.value][0][itemhearder.dataFormat];
          } else {
            return "";
          }
        } catch (ex) { }
      },
      getComputedValue: function (item) {
        return "item." + item.value;
      },
      clickChip: function (item) {
        window.open(
          exportEnvUrl(this.formHref + item._id),
          this.schema.target ? this.schema.target : "_blank"
        );
      },
      clickRow: function (item, row) {
        if (this.$vuetify.breakpoint.name == "xs") {
          window.open(
            exportEnvUrl(this.formHref + row.item._id),
            this.schema.target ? this.schema.target : "_blank"
          );
        }
      },
      dblclickRow: function (item, row) {
        window.open(
          exportEnvUrl(this.formHref + row.item._id),
          this.schema.target ? this.schema.target : "_blank"
        );
      },
      filterSearchValues() {
        let that = this;
        if (that.watchSearchValues != undefined) {
          that.searchValues = that.watchSearchValues;
        } else {
          that.searchValues = {}
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
        that.setViewDataExport("datatable");
        
        const {
          sortBy,
          sortDesc,
          page,
          itemsPerPage,
          search,
        } = that.optionsSync;

        //依据当前排序的列名，找出header中的collation规则
        let columnCollation = "";
        that.schema.datatableHeader.forEach(function (item) {
          if(sortBy && sortBy.length>0){
            sortBy.forEach(function (e, index) {
            if (e == item.value) {
              columnCollation = item.collation ? item.collation : "";
            }
          });
          }
        });

        //走后台接口
        that.filterSearchValues();
        var parameter = {
          queryId: that.schema.query.code,
          searchParam: {
            searchValues: that.searchValues,
            pageSize: itemsPerPage,
            pageIndex: page,
            orders: {},
            collation: columnCollation,
          },
        };

        if (sortBy != undefined && sortBy != "") {
          sortBy.forEach(function (e, index) {
            if (e != "") {
              parameter.searchParam.orders[e] = sortDesc[index] == false ? 1 : -1;
            }
          });
        }

        //改变类型为dateTimeRange的orders
        const keys = Object.keys(parameter.searchParam.orders);
        that.schema.datatableHeader.forEach(function (obj) {
          if(obj.dataType.toLowerCase() === 'datetimerange' && obj.value === keys[0]){
            const key = obj.value + "." + obj.sortField;
            parameter.searchParam.orders[key] = parameter.searchParam.orders[keys[0]];
            delete parameter.searchParam.orders[keys[0]];
          }
        })
        
        that.$axios
          .post("/api/getDataByQueryId", parameter)
          .then(({ data }) => {
            let result = data || [];
            if (result != null) {

              // 兼容布尔类型数据的展示
              result.items.forEach(obj=> {
                for(let k in obj) {
                  if (typeof obj[k] === 'boolean') {
                    obj[k] = String(obj[k])
                  }
                }
                return obj
              })              
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
              that.$store.state.app.qyeryResultFlag = !that.$store.state.app.qyeryResultFlag;
              that.loadMoreData = true;
              that.initScroll();
            }
          })
          .catch((err) => {
            // console.log(err);
          });
      },
      initFormHref() {
        var app = appInfo();
        this.formHref =
          (window.urlMode == 'NOTENANTAPPCODE' ? '' : `/${app.tenantId}/${app.appCode}` ) +          
          "/form/" +
          this.schema.formName +
          "/preview/";
      },
      initScroll() {
        var dataTable = this.$refs.vcDataTable;
        if (dataTable !== undefined) {
          var dt = dataTable.$el.querySelector(".v-data-table__wrapper");
          if (dt != undefined) {
            dt.addEventListener("scroll", this.onScroll);
          }
        }
      },
      onScroll(e) {
        let that = this;
        var dataTable = that.$refs.vcDataTable;
        if (dataTable !== undefined) {
          var dt = dataTable.$el.querySelector(".v-data-table__wrapper");
          var viewH = dt.offsetHeight,
            contentH = dt.scrollHeight,
            scrollTop = e.target.scrollTop;

          if (scrollTop / (contentH - viewH) >= 0.95 && that.loadMoreData) {
            that.loadMoreData = false;
            if (
              that.currentQueryResult.totalDesserts >
              that.currentQueryResult.datalist.length
            ) {
              that.loadMore();
            }
          }
        }
      },
      loadMore() {
        let that = this;
        that.optionsSync.page++;
        that.GetDataList();
      },
      dataReset() {
        let that = this;
        that.optionsSync.page = 1;
        that.setQyeryResult({
          key: that.schema.query.code,
          value: {
            datalist: [],
            totalDesserts: 0
          }
        });
        that.$store.state.app.qyeryResultFlag = !that.$store.state.app.qyeryResultFlag;
        that.GetDataList();
      }
    },
    mounted() {
      let that = this;
     if (that.schema.query.searchValues == undefined) {
        this.schema.query.searchValues = {};
        that.$set(that.schema, "query", this.schema.query)
      }

      if (that.schema.show) {
        that.$store.state.app.currentViewMode = "datatable";
        that.computedSortByDataItem();
      }
      that.initFormHref();
      if (that.schema.itemsPerPage != "") {
        that.optionsSync.itemsPerPage =
          that.schema.itemsPerPage;
      }
      if (that.schema.show) {
        that.GetDataList();
      } else {
        that.initScroll();
      }
      that.bus.$on("toggle-datatable", (enable) => {
        that.schema.show = enable;
        if (enable) {
          that.computedSortByDataItem();
        }
      });
      that.bus.$on("refresh-GetDataList", (obj,code) => {
        if(that.schema.show && (that.schema.name === code || code === '')){
          that.optionsSync.page = 1;
          that.optionsSync.itemsPerPage = that.schema.itemsPerPage;
          that.optionsSync.sortDesc = obj.sortDesc;
          that.optionsSync.sortBy = obj.sortBy;
          that.optionsSync.collation = obj.collation;
          that.GetDataList();
        }
      });
      that.bus.$off("export-datatable");
      that.bus.$on("export-datatable", (code) => {
        if(code === this.schema.name || code === ''){
          that.exportDatatabledialog = true;
        }
      });
    },
  };
</script>
<style>
  .v-card {
    margin-right: 0px;
  }
  @media screen and (max-width: 600px) {
    .v-data-table__mobile-row__header {
      max-width: 80px;
    }

    .v-data-table__mobile-row__cell {
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
 
  @media (max-width: 1264px) {
    .datatable-wrap .v-data-table table {
      /* background: #F2F2F2; */
    }

    .datatable-wrap .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
      /* border-bottom: 1px solid #DEDEDE; */
    }

    .datatable-wrap .v-data-table .v-data-table__mobile-table-row {
      display: block;
      margin: 10px 8px 8px 8px;
      border: 1px solid #DEDEDE;
      padding: 0 10px;
    }

    .datatable-wrap .theme--light.v-data-table > .v-data-table__wrapper > table > tbody > tr:not(:last-child) > td:last-child {
      border: none;
    }

    .datatable-wrap .v-data-table tr {
      /* background: #fff; */
    }
  }

  .loadMore {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }

  .v-data-table__wrapper::-webkit-scrollbar {
    width: 4px !important;
    height: 4px !important;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .v-data-table__wrapper::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }

  .v-data-table__wrapper::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  .v-data-table__checkbox .mdi-checkbox-marked{
    color: var(--v-primary-base);
    caret-color: var(--v-primary-base);
  }
  .v-data-table__checkbox .mdi-minus-box{
    color: var(--v-primary-base);
  }
</style>
