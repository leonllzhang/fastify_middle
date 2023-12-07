<template>
  <v-dialog
    max-width="746"
    v-model="exportDatatabledialog"
    :persistent="true"
    :no-click-animation="true"
  >
    <!-- <v-form ref="variableForm" lazy-validation> -->
    <v-card class="export-dialog">
      <v-card-title class="primary white--text fix-title" primary-title>
        <v-row>
          <v-col cols="6">
            {{ $t("view.dynamicbtn.Export") }}
          </v-col>
          <v-col cols="6" style="text-align: right">
            <v-btn icon @click="toParent">
              <v-icon class="pwc-icon" color="#fff">pwc-close-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-container fluid class="pt70">
        <v-card-text class="export-title">{{
          $t("view.dynamicbtn.specificationtipsTitle")
        }}</v-card-text>
        <v-card-text class="export-tips">
          <ul>
            <li>
              <span>{{ $t("view.dynamicbtn.specificationtipsOne") }}</span>
              {{
                schema.maxExportRows ||
                $store.state.exportRows.maxExportRows / 2 ||
                5000
              }}
              <span>{{ $t("view.dynamicbtn.specificationtipsTwo") }}</span>
            </li>
            <li>
              <span>{{ $t("view.dynamicbtn.specificationtipsThree") }}</span>
              {{
                schema.maxExportRows ||
                $store.state.exportRows.maxExportRows / 2 ||
                5000
              }}
              <span>{{ $t("view.dynamicbtn.specificationtipsFour") }}</span>
            </li>
            <li>{{ $t("view.dynamicbtn.specificationtipsFive") }}</li>
            <li>{{ $t("view.dynamicbtn.specificationtipsSix") }}</li>
            <li>{{ $t("view.dynamicbtn.specificationtipsSeven") }}</li>
          </ul>
        </v-card-text>
        <v-row style="padding: 0 8px">
          <v-col cols="12" style="position: relative">
            <v-radio-group
              v-model="selectType"
              row
              class="export-select-radio"
              v-show="schema.component === 'vc-datatable'"
            >
              <v-radio
                class="local-Resource"
                key="0"
                :label="exportSelectedData"
                value="exportSomeData"
                :disabled="!selected.length"
              ></v-radio>
              <v-radio
                class="local-Resource"
                key="1"
                :label="exportAllData"
                value="whetherToExportAllTheData"
              ></v-radio>
            </v-radio-group>
            <!--扩大radio选择区域-->
            <span
              v-if="selected.length"
              @click="selectType = 'exportSomeData'"
              class="enlarge-selection-area"
            ></span>
            <span
              @click="selectType = 'whetherToExportAllTheData'"
              class="enlarge-selection-area area-left"
            ></span>
            <v-checkbox
              v-model="whetherToIncludeLink"
              :label="$t('view.dynamicbtn.whetherToIncludeLink')"
            ></v-checkbox>
            <span
              @click="whetherToIncludeLink = !whetherToIncludeLink"
              class="enlarge-selection-area area-top"
            ></span>
          </v-col>
          <v-col cols="12" style="margin-top: -10px">
            <div class="export-des">
              {{ $t("view.dynamicbtn.exportDes") }}
            </div>
            <v-text-field
              outlined
              color="primary"
              class="export-des-textarea"
              v-model="explain"
              :rules="[explainRules]"
            ></v-text-field>
          </v-col>
        </v-row>
        <!-- <v-alert dense text type="error" v-model="isDisplayTips.exportTip">
          {{ message.exportInfo }}
        </v-alert>
        <v-alert dense text type="error" v-model="isDisplayTips.detailTip">
          {{ message.detailInfo }}
        </v-alert> -->
        <v-card-actions>
          <v-spacer alt-labels color="#043"></v-spacer>
          <v-btn
            outlined
            tile
            @click="exportClick"
            :loading="buttonLoading.exportLoading"
            :class="[
              selectType ? 'primary--text' : 'dis-classes',
              result ? 'primary--text' : 'dis-classes',
            ]"
          >
            {{ $t("button.confirm") }}
          </v-btn>
          <v-btn
            outlined
            tile
            color="primary"
            @click="detailClick"
            :loading="buttonLoading.detailLoading"
          >
            {{ $t("button.viewDetails") }}
          </v-btn>
        </v-card-actions>
      </v-container>
      <v-container
        v-show="viewDetail.isClick"
        :loading="buttonLoading.detailLoading"
        class="export-detail-container"
      >
        <!---noData-->
        <div v-show="!detailItems.length">
          <v-card-text class="export-detail-title">{{
            $t("view.dynamicbtn.detailTipsOne")
          }}</v-card-text>
        </div>
        <!---hasData-->
        <div v-show="detailItems.length">
          <div class="layout">
            <v-card-text class="export-detail-title" style="width: 93%">{{
              $t("view.dynamicbtn.exportDetail")
            }}</v-card-text>
            <v-btn icon v-bind="attrs" v-on="on" @click="expandCollapse">
              <v-icon v-show="expandCollapseFlag"
                >pwc-icon pwc-chevronup-outline</v-icon
              >
              <v-icon v-show="!expandCollapseFlag"
                >pwc-icon pwc-chevrondown-outline</v-icon
              >
            </v-btn>
          </div>

          <v-item-group v-show="expandCollapseFlag">
            <v-row>
              <v-col v-for="item in detailItems" :key="item.Id" cols="12">
                <v-item>
                  <v-card class="align-center ptb6" color="#ccc" height="200">
                    <v-container class="export-state">
                      <v-card-text v-if="item.status !== 'Completed'">{{
                        item.creationTime | fileName(that)
                      }}</v-card-text>
                      <div
                        v-else
                        class="layout"
                        @click="downLoadZip(item.code)"
                        style="cursor: pointer"
                      >
                        <v-card-text>{{ item.fileName }}</v-card-text>
                        <v-btn icon light v-bind="attrs" v-on="on">
                          <v-icon>pwc-icon pwc-arrowdown</v-icon>
                        </v-btn>
                      </div>
                    </v-container>
                    <v-container class="export-state">
                      <v-card-text style="color: #666; font-size: 14px"
                        >{{ $t("view.dynamicbtn.exportDes2") }} :
                        {{ item.remark }}</v-card-text
                      >
                    </v-container>
                    <v-container class="export-state">
                      <v-card-text style="color: #666; font-size: 14px"
                        >{{ $t("view.dynamicbtn.creatBy") }} :
                        {{ item.creatorName }}</v-card-text
                      >
                    </v-container>
                    <!--progress--->
                    <div
                      class="export-progress"
                      v-if="
                        item.status === 'BeQueuing' ||
                        item.status === 'Processing' ||
                        item.status === 'Uploading'
                      "
                    >
                      <v-stepper alt-labels color="primary">
                        <v-stepper-header>
                          <v-stepper-step step="1">
                            <span>{{ $t("view.dynamicbtn.line") }}</span>
                          </v-stepper-step>
                          <v-divider
                            :style="{
                              background:
                                item.status === 'Processing' ||
                                item.status === 'Uploading'
                                  ? '#d04a02'
                                  : '',
                            }"
                          ></v-divider>
                          <v-stepper-step
                            step="2"
                            :complete="
                              item.status === 'Processing' ||
                              item.status === 'Uploading'
                            "
                            :style="{
                              'padding-bottom':
                                item.status === 'Processing' ? '59px' : '0px',
                              position: 'relative',
                            }"
                          >
                            <span>{{ $t("view.dynamicbtn.prepare") }}</span>
                            <div
                              class="export-process-detail"
                              v-if="item.status === 'Processing'"
                            >
                              <div class="">
                                {{ $t("view.dynamicbtn.totalSelect")
                                }}{{ progressData.dataCount
                                }}{{ $t("view.dynamicbtn.recordExport")
                                }}{{ progressData.processedDataCount
                                }}{{ $t("view.dynamicbtn.record") }}
                              </div>
                              <div class="">
                                {{ $t("view.dynamicbtn.willGenerate")
                                }}{{ progressData.fileCount
                                }}{{ $t("view.dynamicbtn.filesGenerated")
                                }}{{ progressData.processedFileCount
                                }}{{ $t("view.dynamicbtn.files") }}
                              </div>
                            </div>
                          </v-stepper-step>
                          <v-divider
                            :style="{
                              background:
                                item.status === 'Uploading' ? '#d04a02' : '',
                            }"
                          ></v-divider>
                          <v-stepper-step
                            step="3"
                            :complete="item.status === 'Uploading'"
                          >
                            <span>{{ $t("view.dynamicbtn.transform") }}</span>
                          </v-stepper-step>
                          <v-divider></v-divider>
                          <v-stepper-step step="4">
                            <span>{{ $t("view.dynamicbtn.complete") }}</span>
                          </v-stepper-step>
                        </v-stepper-header>
                      </v-stepper>
                    </div>
                    <v-container
                      class="export-state"
                      v-else-if="item.status === 'Completed'"
                    >
                      <v-card-text style="color: #666; font-size: 14px"
                        >{{ $t("view.dynamicbtn.will") }}
                        {{
                          item.completionTime
                            | timeFilter("expirationTime", that)
                        }}
                        {{ $t("view.dynamicbtn.expired") }}</v-card-text
                      >
                    </v-container>
                    <v-container
                      class="export-state"
                      v-else-if="item.status === 'Failed'"
                    >
                      <v-card-text
                        style="color: #666; font-size: 14px; color: #d04a02"
                        >{{ $t("view.dynamicbtn.reason") }}
                        {{ item.statusMessage }}</v-card-text
                      >
                    </v-container>
                    <v-container
                      class="export-state"
                      v-else-if="item.status === 'Canceled'"
                    >
                      <v-card-text style="color: #666; font-size: 14px">{{
                        $t("view.dynamicbtn.cancelExport")
                      }}</v-card-text>
                    </v-container>
                  </v-card>
                </v-item>
              </v-col>
              <v-col>
                <div
                  ref="load_more_task"
                  v-show="!task.pageEnd"
                  class="text-center"
                  style="height: 50px; line-height: 50px"
                ></div>
              </v-col>
            </v-row>
          </v-item-group>
          <!-- <v-alert dense text type="error" v-model="isDisplayTips.cancelTip">
            {{ message.cancelInfo }}
          </v-alert>
          <v-alert dense text type="error" v-model="isDisplayTips.refreshTip">
            {{ message.refreshInfo }}
          </v-alert> -->
          <v-card-actions>
            <v-spacer alt-labels color="#043"></v-spacer>
            <v-btn
              outlined
              tile
              color="primary"
              @click="cancelClick"
              :class="[
                code ? '' : 'dis-classes',
                expandCollapseFlag ? '' : 'dis-classes',
              ]"
              :loading="buttonLoading.cancelLoading"
            >
              {{ $t("button.cancelTask") }}
            </v-btn>
            <v-btn
              outlined
              tile
              color="primary"
              @click="refreshClick"
              :class="[
                code ? '' : 'dis-classes',
                expandCollapseFlag ? '' : 'dis-classes',
              ]"
              :loading="buttonLoading.refreshLoading"
              >{{ $t("button.refreshResult") }}</v-btn
            >
          </v-card-actions>
        </div>
      </v-container>
    </v-card>
    <!-- </v-form> -->
    <!-- snackbar -->
    <snackbar
      v-show="snackbarMessage != ''"
      :isShowSnackbar="isShowSnackbar"
      :snackbarMessage="snackbarMessage"
      :snackbarTimeout="snackbarTimeout"
      :snackbarColor="snackbarColor"
    />
  </v-dialog>
</template>

<script>
import appInfo from "../../utils/appInfo";
import {
  download_export_task_error_cn,
  download_export_task_error_tw,
  download_export_task_error_en,
} from "../../utils/const";
import { exportEnvUrl, getEnv } from "../../utils/appBaseMethods";
import snackbarComponent from "../snackbar";
export default {
  components: {
    snackbar: snackbarComponent,
  },
  data() {
    return {
      that: this,
      selectType:
        this.schema.component !== "vc-datatable"
          ? "whetherToExportAllTheData"
          : "",
      explain: "",
      viewDetail: {
        isWhetherTask: false,
        isClick: false,
      },
      detailItems: [],
      code: "",
      result: true,
      progressData: {},

      message: {
        exportInfo: "",
        detailInfo: "",
        cancelInfo: "",
        refreshInfo: "",
      },
      buttonLoading: {
        exportLoading: false,
        detailLoading: false,
        cancelLoading: false,
        refreshLoading: false,
      },
      isDisplayTips: {
        exportTip: false,
        detailTip: false,
        cancelTip: false,
        refreshTip: false,
      },
      task: {
        pageEnd: false,
        loadMore: true,
        loadMoreObserveTask: null,
        pageIndex: 1,
        pageSize: 10,
      },
      whetherToIncludeLink: false,
      isShowSnackbar: false,
      snackbarMessage: "",
      snackbarTimeout: 3000,
      snackbarColor: "",
      expandCollapseFlag: true,
    };
  },
  props: {
    currentQueryResult: {
      type: Object,
      require: true,
      default: {},
    },
    selected: {
      default: [],
    },
    optionsSync: {
      type: Object,
      require: true,
      default: {
        page: 1,
        itemsPerPage: 25,
        collation: "",
      },
    },
    formHref: {
      default: "",
    },
    schema: {
      type: Object,
      require: true,
      default: {},
    },
    pageView: {
      default: "",
    },
    exportDatatabledialog: {
      type: Boolean,
      default: false,
    },
    searchValues: {
      type: Object,
      default: {},
    },
  },
  filters: {
    timeFilter(val, type, that) {
      if (!val) return val;
      if (type === "exportTime") {
        return that
          .moment(val)
          .format(
            that.$store.state.app.appPerference.GlobalDateFormat ||
              "DD/MM/YYYY HH:mm"
          );
      } else {
        let expirationTime = Number(val) + 72 * 60 * 60 * 1000;
        return that
          .moment(expirationTime)
          .format(that.$store.state.app.appPerference.GlobalDateFormat);
      }
    },
    fileName(val, that) {
      if (!val) return val;
      const app = appInfo();
      return (
        app.tenantId +
        "_" +
        app.appCode +
        "_" +
        that.pageView.toLowerCase() +
        "_" +
        that.moment(val).format("YYYYMMDD") +
        "_" +
        that.moment(val).format("hhmmss") +
        ".zip"
      );
    },
  },
  watch: {
    exportDatatabledialog: {
      handler(val, oldVal) {
        const that = this;
        if (val === true) {
          that.whetherToIncludeLink = false;
          that.selectType =
            that.schema.component !== "vc-datatable"
              ? "whetherToExportAllTheData"
              : "";
          that.explain = "";
          that.viewDetail.isClick = false;
          that.task = {
            pageEnd: false,
            loadMore: true,
            loadMoreObserveTask: that.task.loadMoreObserveTask,
            pageIndex: 1,
            pageSize: 10,
          };
        }
      },
    },
  },
  computed: {
    exportAllData() {
      return (
        this.$t("view.dynamicbtn.ExportAllData") +
        this.currentQueryResult.totalDesserts +
        " " +
        this.$t("view.dynamicbtn.totalRows")
      );
    },
    exportSelectedData() {
      return (
        this.$t("view.dynamicbtn.exportSelectedData") +
        " " +
        this.selected.length +
        " " +
        this.$t("view.dynamicbtn.rows")
      );
    },
    // selectedLength() {
    //   let flag = true ;
    //   if(this.selectType == "exportSomeData" && !this.selected.length){
    //     flag = false;
    //   }
    //   return flag;
    // },
  },
  methods: {
    //...mapMutations("app", ["setbuttonLoading", "setFloatingButtonItems"]),
    explainRules(v) {
      const pattern = /[!@#$%^&*(){}<>?"']/;
      let resultTest = true,
        resultLength = false;
      if (v) {
        resultLength = v.length < 2 || v.length > 40;
        resultTest = !pattern.test(v);
      }
      let result = resultTest && !resultLength;
      this.result = result;
      return result || this.$t("view.dynamicbtn.explainTips");
    },
    toParent() {
      this.$emit("closeExportdialog", false);
    },
    expandCollapse() {
      let flag = this.expandCollapseFlag;
      this.expandCollapseFlag = !flag;
    },
    // export
    exportClick() {
      let that = this,
        //page = that.optionsSync.page,
        url = "",
        idArr = [];
      // pageSize = 1;
      const component = this.schema.component;
      if (component === "vc-datatable") {
        if (!that.selectType) {
          return;
        }
      }
      if (!that.result) {
        return;
      }
      that.buttonLoading.exportLoading = true;
      //that.setbuttonLoading(true);
      // if (this.filterSearchValues) {
      //   this.filterSearchValues();
      // }
      const { sortBy, sortDesc } = that.optionsSync;
      //增加id导出条件
      if (component === "vc-datatable") {
        idArr = that.selected.map((v) => {
          return v._id;
        });
      }
      if (that.whetherToIncludeLink) {
        url = exportEnvUrl(window.location.origin + that.formHref + "{dataId}");
      }
      //如果勾选全量数据，id值清空
      if (that.selectType === "whetherToExportAllTheData") {
        //pageSize = -1;
        idArr = [];
      }
      //不勾选数据与和弹框的导出全量数据，导出的数据以加载到哪条数据为准。
      // if(!that.whetherToExportAllTheData && idArr.length === 0){
      //   pageSize = page * pageSize;
      //   page = 1;
      //   console.log(pageSize,page,that.currentQueryResult.totalDesserts)
      // }
      let exportHeader = [],
        index = 0,
        columnCollation = "",
        dataFormat = "";
      if (component === "vc-view-card-list") {
        that.schema.cardHeader.forEach(function (item) {
          let dataFormat = "";
          switch (item.dataType) {
            case "DateTime":
              dataFormat = item.dataFormat
                ? item.dataFormat
                : that.$store.state.app.appPerference.GlobalDateFormat;
              dataFormat = dataFormat
                .replace(/Y/g, "y")
                .replace(/D/g, "d")
                .replace(/H/g, "h");
              break;
            default:
              dataFormat = item.dataFormat ? item.dataFormat : "";
              break;
          }
          let newJson = {
            column: item.value,
            header: item.title,
            order: index,
            dataFormat: dataFormat,
          };
          index++;
          exportHeader.push(newJson);
        });
      } else {
        that.schema.datatableHeader.forEach(function (item) {
          //依据当前排序的列名，找出header中的collation规则
          switch (item.dataType.toLowerCase()) {
            case "datetime":
            case "datetimerange":
              dataFormat = item.dataFormat
                ? item.dataFormat
                : that.$store.state.app.appPerference.GlobalDateFormat;
              dataFormat = dataFormat
                .replace(/Y/g, "y")
                .replace(/D/g, "d")
                .replace(/H/g, "h");
              break;
            default:
              dataFormat = item.dataFormat ? item.dataFormat : "";
              break;
          }
          let newJson = {
            column: item.value,
            header: item.text,
            order: index,
            dataFormat: dataFormat,
          }; 
          index++;
          exportHeader.push(newJson);
          if (sortBy && sortBy.length > 0) {
            sortBy.forEach(function (e, index) {
              if (e == item.value) {
                columnCollation = item.collation ? item.collation : "";
              }
            });
          }
        });
      }
      let parameter = {
        requestURL: "exportdata/CreateTask",
        env: getEnv(),
        pageCode:
          that.pageView && that.pageView ? that.pageView.toLowerCase() : "",
        tableCode: that.schema.name,
        queryCode: that.schema.query.code,
        taskRemark: that.explain,
        threshold: that.schema.maxExportRows
          ? Number(that.schema.maxExportRows)
          : Number(that.$store.state.exportRows.maxExportRows) / 2,
        docIds: idArr,
        searchValues: that.searchValues,
        //Index: page,
        //size: component !== "vc-datatable-group" ? pageSize : 9999,
        orders: {},
        columns: exportHeader,
        url: url,
        timeDeviation: 0 - new Date().getTimezoneOffset() / 60,
        collation: columnCollation,
        defaultDateFormat: that.$store.state.app.appPerference.GlobalDateFormat,
      };
      if (sortBy) {
        sortBy.forEach(function (e, index) {
          if (e != "") {
            parameter.orders[e] = sortDesc[index] == false ? 1 : -1;
          }
        });
      }
      that.$axios
        .post("/api/PostJObjectResult", parameter)
        .then((res) => {
          let code = res.data.statusCode;
          const errorMsg = that.getlanguage();
          if (code !== 0) {
            //错误提示
            let msg = "";
            switch (code) {
              case 121101:
                msg = errorMsg[5];
                break;
              default:
                msg = `${errorMsg[8]}`;
                break;
            }
            that.snackbarMessage = msg;
            that.snackbarColor = "error";
            that.isShowSnackbar = true;
            setTimeout(() => {
              that.snackbarMessage = "";
            }, that.snackbarTimeout);
          } else {
            that.snackbarMessage = errorMsg[7];
            that.snackbarColor = "success";
            that.isShowSnackbar = true;
            setTimeout(() => {
              that.snackbarMessage = "";
            }, that.snackbarTimeout);
          }

          that.buttonLoading.exportLoading = false;
          //that.setbuttonLoading(false);
        })
        .catch((err) => {
          // console.log(err);
          that.buttonLoading.exportLoading = false;
        });
    },
    loadMoreTask(obj) {
      var isIntersecting = obj[0].isIntersecting;
      var target = obj[0].target;
      if (isIntersecting) {
        const ul = target.offsetParent;
        const scrollTop = target.offsetParent.scrollTop;
        if (!this.task.pageEnd) this.loadData();
        this.$nextTick(function () {
          ul.scrollTop = scrollTop;
        });
      }
    },
    detailClick() {
      let that = this;
      that.viewDetail.isClick = true;
      that.buttonLoading.detailLoading = true;
      let parameter = {
        requestURL: "exportdata/GetTaskList",
        pageCode:
          that.pageView && that.pageView ? that.pageView.toLowerCase() : "",
        tableCode: that.schema.name,
        queryCode: that.schema.query.code,
        status: [],
        pageIndex: 1,
        pageSize: that.task.pageSize,
      };
      that.$axios
        .post("/api/PostJObjectResult", parameter)
        .then((res) => {
          const data = res.data;
          if (data.statusCode == 0) {
            that.code = "";
            that.detailItems = data.data.items;
            if (!that.detailItems.length) {
              that.buttonLoading.detailLoading = false;
              return;
            }
            that.detailItems.forEach((v) => {
              if (
                v.status === "BeQueuing" ||
                v.status === "Processing" ||
                v.status === "Uploading"
              ) {
                that.code = v.code;
                if (v.status === "Processing") {
                  that.getPreparationData();
                }
              }
            });
            if (data.data.items.length < that.task.pageSize) {
              that.task.pageEnd = true;
            } else {
              that.task.pageEnd = false;
            }
          } else {
            // const errorMsg = that.getlanguage();
            // that.snackbarMessage = errorMsg[9];
            // that.snackbarColor = "error";
            // that.isShowSnackbar = true;
            // setTimeout(() => {
            //   that.snackbarMessage = "";
            // }, that.snackbarTimeout);
          }
          that.buttonLoading.detailLoading = false;
        })
        .catch((err) => {
          // console.log(err);
          that.buttonLoading.detailLoading = false;
        });

      that.$nextTick(function () {
        that.task.loadMoreObserveTask.observe(that.$refs.load_more_task);
      });
    },
    //加载更多task数据
    loadData() {
      let that = this;
      that.buttonLoading.detailLoading = true;
      that.task.pageIndex += 1;
      that.task.loadMore = false;
      let parameter = {
        requestURL: "exportdata/GetTaskList",
        pageCode:
          that.pageView && that.pageView ? that.pageView.toLowerCase() : "",
        tableCode: that.schema.name,
        queryCode: that.schema.query.code,
        status: [],
        pageIndex: that.task.pageIndex,
        pageSize: that.task.pageSize,
      };
      that.$axios
        .post("/api/PostJObjectResult", parameter)
        .then((res) => {
          const data = res.data;
          if (data.statusCode == 0) {
            that.detailItems = that.detailItems.concat(data.data.items);
            if (data.data.items.length < that.task.pageSize) {
              that.task.pageEnd = true;
            } else {
              that.task.pageEnd = false;
            }
          } else {
            // const errorMsg = that.getlanguage();
            // that.snackbarMessage = errorMsg[9];
            // that.snackbarColor = "error";
            // that.isShowSnackbar = true;
            // setTimeout(() => {
            //   that.snackbarMessage = "";
            // }, that.snackbarTimeout);
          }
          that.buttonLoading.detailLoading = false;
        })
        .catch((err) => {
          that.buttonLoading.detailLoading = false;
          // console.log(err);
        });
      that.task.loadMore = true;
    },
    refreshClick() {
      let that = this;
      if (!that.code) {
        return;
      }
      if (!that.expandCollapseFlag) {
        return;
      }
      that.buttonLoading.refreshLoading = false;
      that.$axios
        .post("/api/GetResult", {
          requestURL: "exportdata/GetTaskByCode/" + that.code,
        })
        .then((res) => {
          const data = res.data.data;
          if (res.data.statusCode == 0) {
            let _index = 1;
            that.detailItems.forEach(function (item, index) {
              if (item.code === data.code) {
                _index = index;
                if (data.status === "Processing") {
                  that.getPreparationData();
                }
                if (
                  data.status === "Completed" ||
                  data.status === "Failed" ||
                  data.status === "Canceled"
                ) {
                  that.code = "";
                }
              }
            });
            that.$set(that.detailItems, _index, data);
          } else {
            const errorMsg = that.getlanguage();
            that.snackbarMessage = `${res.data.statusCode}：${errorMsg[10]}`;
            that.snackbarColor = "error";
            that.isShowSnackbar = true;
            setTimeout(() => {
              that.snackbarMessage = "";
            }, that.snackbarTimeout);
          }
          that.buttonLoading.refreshLoading = false;
        })
        .catch((err) => {
          // console.log(err);
          that.buttonLoading.refreshLoading = false;
        });
    },
    cancelClick() {
      let that = this;
      if (!that.code) {
        return;
      }
      if (!that.expandCollapseFlag) {
        return;
      }
      that.buttonLoading.cancelLoading = true;
      that.$axios
        .post("/api/PostJObjectResult", {
          requestURL: "exportdata/CancelTask",
          taskCode: that.code,
        })
        .then((res) => {
          const data = res.data.data;
          if (res.data.statusCode == 0) {
            let _index = 1;
            that.detailItems.forEach(function (item, index) {
              if (item.code === data.code) {
                _index = index;
              }
            });
            that.$set(that.detailItems, _index, data);
            that.code = "";
          } else {
            //错误提示
            const errorMsg = that.getlanguage();
            let msg = "";
            switch (res.data.statusCode) {
              case 121202:
                msg = errorMsg[6];
                break;
              default:
                msg = `${errorMsg[11]}`;
                break;
            }
            that.snackbarMessage = msg;
            that.snackbarColor = "error";
            that.isShowSnackbar = true;
            setTimeout(() => {
              that.snackbarMessage = "";
            }, that.snackbarTimeout);
          }
          that.buttonLoading.cancelLoading = false;
        })
        .catch((err) => {
          // console.log(err);
          that.buttonLoading.cancelLoading = false;
        });
    },
    downLoadZip(code) {
      let that = this;
      that.$axios
        .get(
          "/api/DownloadExportTaskResult/" + code,
          {},
          { responseType: "blob" }
        )
        .then((res) => {
          var type = res.headers["content-type"];
          if (type == "application/x-zip-compressed") {
            const app = appInfo();
            let appHost = window.urlMode == 'NOTENANTAPPCODE' ? '' :"/" + app.tenantId + "/" + app.appCode;
            window.open(`${appHost}/api/DownloadExportTaskResult/${code}`);
          } else {
            //失败content-type为application/json; charset=utf-8，结果为Json
            const errorMsg = that.getlanguage();
            that.snackbarMessage = errorMsg[9];
            that.snackbarColor = "error";
            that.isShowSnackbar = true;
            setTimeout(() => {
              that.snackbarMessage = "";
            }, that.snackbarTimeout);
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    },
    //language
    getlanguage() {
      const locale = this.$i18n.locale;
      let downloadLanguage = [];
      switch (locale) {
        case "zh-cn":
          downloadLanguage = download_export_task_error_cn;
          break;
        case "zh-tw":
          downloadLanguage = download_export_task_error_tw;
          break;
        case "en":
          downloadLanguage = download_export_task_error_en;
          break;
        default:
          downloadLanguage = download_export_task_error_en;
          break;
      }
      return downloadLanguage;
    },
    //获取导出进度
    getPreparationData() {
      let that = this;
      that.$axios
        .post("/api/GetResult", {
          requestURL: "exportdata/GetTaskProgress/" + that.code,
        })
        .then(({ data }) => {
          if (data.statusCode == 0) {
            that.progressData = data.data;
          }
        });
    },
  },
  mounted() {
    this.task.loadMoreObserveTask = new IntersectionObserver(this.loadMoreTask);
  },
  beforeDestroy() {
    this.task.loadMoreObserveTask.disconnect();
  },
};
</script>
<style scoped>
.fix-title {
  position: fixed;
  width: 746px;
  z-index: 66;
}
@media (max-width: 600px) {
  .fix-title {
    position: fixed;
    width: 360px;
  }
  .export-tips {
    height: 450px !important;
  }
}
.pt70 {
  padding-top: 70px;
}
.export-tips {
  padding: 16px 8px;
  border: 1px solid #dedede;
  width: 94%;
  height: 248px;
  margin: 8px 16px;
}
.export-detail-container {
  background: #f5f5f5 0% 0% no-repeat padding-box;
}
.theme--dark.v-application .export-detail-container {
  background: #161616;

}
.export-detail-container .v-sheet {
  margin: 0 16px;
  background-color: #fff !important;
  border: 1px solid #dedede !important;
  height: auto !important;
}
.export-detail-title {
  font: normal normal normal 18px/24px Source Han Sans CN;
  padding: 10px 22px;
}
.export-tips ul {
  padding-left: 0;
  margin-left: 20px;
}
.export-tips ul li {
  position: relative;
  font: normal normal normal 14px/24px Source Han Sans CN;
  /* color: #000; */
  line-height: 2.6rem;
}
.export-progress .v-stepper__heade,
.export-progress .v-stepper {
  box-shadow: none;
}
.export-state {
  padding: 3px 12px;
  display: flex;
  justify-content: space-between;
  color: #666;
}
.ptb6 {
  padding-top: 6px;
  padding-bottom: 6px;
}
.export-state .v-card__text {
  padding: 2px 0;
  width: auto;
  color: #000;
  font-size: 16px;
  display: flex;
  align-items: center;
}
.v-dialog .export-dialog .v-card__title {
  padding: 0 24px;
}
.export-title {
  color: #2d2d2d;
  font-size: 18px;
}
.theme--dark.v-application .export-title {
  color: #f2f2f2;
}
.export-select-radio {
  position: relative;
  font-size: 18px;
  color: #2d2d2d;
}
.export-dialog .v-input--selection-controls {
  margin-top: 0px;
}
.export-des {
  margin-top: -5px;
  margin-bottom: 5px;
  color: #7d7d7d;
  font-size: 14px;
  padding-left: 4px;
}
.export-des-textarea .v-input__slot {
  border: 1px solid rgb(222, 222, 222);
  height: 99px;
}
/*因runtime.css覆盖，故对按钮disabled状态增加classname */
.v-dialog .v-card .dis-classes {
  background-color: rgba(0, 0, 0, 0.12) !important;
  color: rgba(0, 0, 0, 0.26) !important;
  border: none !important;
}

.v-dialog .theme--dark.v-card .dis-classes {
  color: rgba(255,255,255,0.3) !important;
}

.export-process-detail {
  position: absolute;
  width: 300px;
  top: 79px;
  left: 0;
  line-height: 1.4rem;
  color: #d04a02;
  font-size: 14px;
}
.enlarge-selection-area {
  width: 31%;
  height: 40px;
  position: absolute;
  left: 4%;
  top: 0;
  z-index: 88;
  cursor: pointer;
}
.area-left {
  left: 40%;
}
.area-top {
  top: 48%;
}
.primary--text {
  color: var(--v-primary-base) !important;
  caret-color: var(--v-primary-base) !important;
}
/*export style end */
</style>
