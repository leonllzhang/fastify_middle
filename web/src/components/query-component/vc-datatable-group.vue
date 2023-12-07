<template>
  <div :class="$vuetify.breakpoint.name == 'xs' ? 'datatable-group-mobile-container' : 'datatable-pc-container'">
    <v-data-table tabindex="0" ref="vcDataTableGroup" v-model="selected" :loading="loading"
      :loading-text="$t('view.datatable.loading-text')" :headers="datatableHeader" :items="currentQueryResult.datalist"
      :options.sync="optionsSync" :server-items-length="currentQueryResult.totalDesserts" @click:row="clickRow"
      @dblclick:row="dblclickRow" item-key="_id" :height="height" disable-sort fixed-header hide-default-footer
      :hide-default-header="$vuetify.breakpoint.name == 'xs'"
      :class="['vc-datatable-group query-datatable elevation-1', classes]"
      :no-data-text="$t('view.datatable.noDataAvailable')">
      <template v-slot:body="{ items, headers }">
        <tbody class="datatable-group-tbody">
          <tr>
            <td :colspan="datatableHeader ? datatableHeader.length : 0" class="datatable-group-td">
              <datatablegrouptrwrapper :groupdatalist="currentQueryResult.datalist" :schema="schema" :level="0"
                :total="0" :patentId="0" :formHref="formHref" :searchValues="searchValues"
                :groupdatatableHeader="datatableHeader" />
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
    <export-component 
      :currentQueryResult="currentQueryResult"
      :selected="selected"
      :optionsSync="optionsSync"
      :formHref="formHref"
      :pageView="pageView"
      :schema="schema"
      :exportDatatabledialog="exportDatatablegroupdialog"
      @closeExportdialog="closeExportdialog(data)"
      :searchValues="searchValues"
    />
  </div>
</template>

<script>
  import {
    mapMutations
  } from "vuex";
  import appInfo from "../../utils/appInfo";
  import axios from "axios";
  //import base from "../utils/schema-base"
  import queryFilter from "../utils/query-filter";
  import exportComponent from "../basic/vc-export.vue"
  import {
    exportEnvUrl
  } from "../../utils/env"

  export default {
    mixins: [queryFilter],
    components: {
      datatablegrouptrwrapper: () => import("./vc-datatable-grouptr.vue"),
      exportComponent
    },
    data() {
      return {
        searchValues: {},
        currentPageView: (
          this.options.pageView ||
          this.$route.params.pageView ||
          ""
        ).toLowerCase(),
        multiSort: false,
        loading: false,
        singleSelect: false,
        selected: [],
        formHref: "",
        loadMoreData: true,
        buttonLoading:false,
        exportDatatablegroupdialog: false,
        whetherToIncludeLink: false,
        whetherToExportAllTheData: true,
        tableWidth: '100%',
        currentQueryResult: {
          datalist: [],
          totalDesserts: 0
        },
        optionsSync: {
          page: 1
        },
        selected: []
      };
    },
    watch: {
      tableWidth() {
        var dataTable = this.$refs.vcDataTableGroup;
        if (dataTable !== undefined) {
          var dt = dataTable.$el.querySelector(".v-data-table__wrapper table");
          if (dt != undefined && this.$vuetify.breakpoint.name != 'xs') {
            dt.setAttribute("style", "width:" + this.tableWidth);
          }
        }
      },
      "$store.state.app.buttonLoading": function (newVal, oldVal) {
        this.buttonLoading = newVal;
      },
    },
    computed: {
      datatableHeader() {
        //支持datatableHeader 多语
        let that = this;
        if (that.schema.datatableHeader == 0) return;
        let totalWidth = 0;
        let dataheaders = [];
        that.schema.datatableHeader.forEach(function (item) {
          var newitem = JSON.parse(JSON.stringify(item));
          newitem.text = that.$te("query_" + that.schema.query.code + ".Field." + item.value + ".label") ?
            that.$t("query_" + that.schema.query.code + ".Field." + item.value + ".label") :
            item.text;
          totalWidth = parseInt(totalWidth) + parseInt(item.width);
          newitem.width = item.width + "%";
          dataheaders.push(newitem);
        });
        that.tableWidth = totalWidth + "%";
        return dataheaders;
      },
      height() {
        if (this.$vuetify.breakpoint.name == "xs") {
          return document.documentElement.clientHeight - 64 - 39 - 27 + "px";
        } else {
          return document.documentElement.clientHeight - 64 - 39 - 64 - 27 + "px";
        }
      },
    },
    methods: {
      ...mapMutations("app", [
        "setViewDataExport",
        "setbuttonLoading"
      ]),
      closeExportdialog(data){
        this.exportDatatablegroupdialog = data;
      },
      getPeopleShowValue(item, itemhearder) {
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
      },
      // exportClick() {
      //   let that = this;
      //   that.buttonLoading = true;
      //   that.setbuttonLoading(true);
      //   var exportHeader = [];
      //   let index = 0;
      //   that.schema.datatableHeader.forEach(function (item) {
      //     let dataFormat = "";
      //     switch (item.dataType) {
      //       case "DateTime":
      //         dataFormat = item.dataFormat ?
      //           item.dataFormat :
      //           that.$store.state.app.appPerference.GlobalDateFormat;
      //         dataFormat = dataFormat
      //           .replace(/Y/g, "y")
      //           .replace(/D/g, "d")
      //           .replace(/H/g, "h");
      //         break;
      //       default:
      //         dataFormat = item.dataFormat ? item.dataFormat : "";
      //         break;
      //     }
      //     let newJson = {
      //       column: item.value,
      //       header: item.text,
      //       order: index,
      //       dataFormat: dataFormat,
      //     };
      //     index++;
      //     exportHeader.push(newJson);
      //   });

      //   var apiUrl = "/api/export";
      //   that.filterSearchValues();
      //   const {
      //     page,
      //   } = that.optionsSync;
      //   var url = "";
      //   var pageSize = 99999;
      //   if (that.whetherToIncludeLink) {
      //     url = exportEnvUrl(window.location.origin + that.formHref + "{dataId}");
      //   }
      //   if (that.whetherToExportAllTheData) {
      //     pageSize = -1;
      //   }
      //   var parameter = {
      //     queryId: that.schema.query.code,
      //     searchParam: {
      //       searchValues: that.searchValues,
      //       pageSize: pageSize,
      //       pageIndex: page,
      //       orders: {},
      //       url: url,
      //       columns: exportHeader,
      //       timeDeviation: 0 - new Date().getTimezoneOffset() / 60,
      //     },
      //   };

      //   this.$axios.post(apiUrl, parameter, {
      //     responseType: "blob", // 表明返回服务器返回的数据类型
      //   }).then((res) => {
      //     // 处理返回的文件流
      //     //主要是将返回的data数据通过blob保存成文件
      //     var filename = "";
      //     var disposition = res.headers["content-disposition"];
      //     if (disposition && disposition.indexOf("attachment") !== -1) {
      //       var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      //       var matches = filenameRegex.exec(disposition);
      //       if (matches != null && matches[1])
      //         filename = matches[1].replace(/['"]/g, "");
      //     }
      //     var content = res.data;
      //     var blob = new Blob([content]);
      //     if ("download" in document.createElement("a")) {
      //       // 非IE下载
      //       var elink = document.createElement("a");
      //       elink.download = filename;
      //       elink.style.display = "none";
      //       elink.href = URL.createObjectURL(blob);
      //       document.body.appendChild(elink);
      //       elink.click();
      //       URL.revokeObjectURL(elink.href); // 释放URL 对象
      //       document.body.removeChild(elink);
      //     } else {
      //       // IE10+下载
      //       navigator.msSaveBlob(blob, filename);
      //     }
      //     // console.log(res);
      //   });
      //   that.buttonLoading = false;
      //   that.setbuttonLoading(false);
      //   that.exportDatatablegroupdialog = false;
      // },
      getComputedValue: function (item) {
        if (item.dataType == "DateTime") {
          return "item." + item.value;
        } else if (item.dataType == "User") {
          return "item." + item.value;
        }
        return "";
      },
      clickRow: function (item, row) {
        if (this.$vuetify.breakpoint.name == "xs") {
          window.open(exportEnvUrl(this.formHref + row.item._id), (this.schema.target ? this.schema.target :
            "_blank"));
        }
      },
      dblclickRow: function (item, row) {
        window.open(exportEnvUrl(this.formHref + row.item._id), (this.schema.target ? this.schema.target : "_blank"));
      },
      filterSearchValues() {
        let that = this;
        if (that.watchSearchValues != undefined) {
          that.searchValues = that.watchSearchValues;
        } else {
          that.searchValues = {}
        }
        if (that.watchSearchValues != undefined) {
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
        that.setViewDataExport("datatablegroup");
        const {
          page,
        } = that.optionsSync;

        //走后台接口
        that.filterSearchValues();
        var parameter = {
          queryId: that.schema.query.code,
          searchParam: {
            SearchValues: that.searchValues,
            PageSize: 99999,
            PageIndex: page,
            Orders: {},
          },
        };

        that.$axios
          .post("/api/getGroupDataByQueryId", parameter)
          .then(({
            data
          }) => {
            let result = data || [];
            if (result != null) {
              if (result.groups != null) {
                result.groups.forEach(function (item) {
                  item.isGroup = true;
                  item.isLoad = false;
                  item.expanded = true;
                  item.children = [];
                  item.fieldValues = [item.value];
                });
                that.currentQueryResult.datalist = result.groups;
                that.currentQueryResult.totalDesserts = result.groups.length;
              }
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
      //initScroll() {
      //  var dataTable = this.$refs.vcDataTableGroup;
      //  if (dataTable !== undefined) {
      //    var dt = dataTable.$el.querySelector(".v-data-table__wrapper");
      //    if (dt != undefined) {
      //      dt.addEventListener("scroll", this.onScroll);
      //    }
      //  }
      //},
      //onScroll(e) {
      //  let that = this;
      //  var dataTable = that.$refs.vcDataTableGroup;
      //  if (dataTable !== undefined) {
      //    var dt = dataTable.$el.querySelector(".v-data-table__wrapper");
      //    var viewH = dt.offsetHeight,
      //      contentH = dt.scrollHeight,
      //      scrollTop = e.target.scrollTop;

      //    if (scrollTop / (contentH - viewH) >= 0.95 && that.loadMoreData) {
      //      that.loadMoreData = false;
      //      if (
      //        that.currentQueryResult.totalDesserts >
      //        that.currentQueryResult.datalist.length
      //      ) {
      //        that.loadMore();
      //      }
      //    }
      //  }
      //},
      //loadMore() {
      //  let that = this;
      //  that.optionsSync.page++;
      //},
    },
    mounted() {
      let that = this;
      if (that.schema.query.searchValues == undefined) {
        this.schema.query.searchValues = {};
        that.$set(that.schema, "query", this.schema.query)
      }
      that.initFormHref();
      if (that.schema.show) {
        that.GetDataList()
      }
      that.bus.$on("toggle-datatable", (enable) => {
        that.schema.show = enable;
      });
      that.bus.$off("export-datatablegroup");
      that.bus.$on("export-datatablegroup", (code) => {
        if(code === this.schema.name || code === ""){
          that.exportDatatablegroupdialog = true;
        }
      });
    },
  };

</script>
<style>
  .v-card {
    margin-right: 0px;
  }

  .loadMore {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }

  .vc-datatable-group .v-data-table__wrapper::-webkit-scrollbar {
    width: 4px !important;
    height: 4px !important;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .vc-datatable-group .v-data-table__wrapper::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }

  .vc-datatable-group .v-data-table__wrapper::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  .datatable-group-td {
    padding: 0px !important;
  }

  .theme--light.v-data-table>.v-data-table__wrapper>table>.datatable-group-tbody>tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
    background-color: #fff;
  }
  .theme--dark.v-data-table>.v-data-table__wrapper>table>tbody.datatable-group-tbody>tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
    background: none;
  }

  .datatable-group-mobile-container {
    margin: 10px;
    border: 1px solid #DEDEDE;
  }

  .preview-wrapper .datatable-group-mobile-container .v-data-table {
    padding-top: 0px;
  }

</style>
