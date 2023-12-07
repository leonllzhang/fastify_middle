<template>
  <div :class="['layout', 'datapicker-box', classes, { 'py-2': pageMode == 'preview','dark-data-picker': $vuetify.theme.dark}]" ref="peo">
    <v-tooltip right :disabled="isHorizontal || !schema.tooltip">
      <template v-slot:activator="{ on }">
        <v-icon v-show="isVertical && schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
      </template>
      <span>{{ tooltipLabel }}</span>
    </v-tooltip>
    <v-layout :column="isVertical" :style="{ 'flex-wrap': isControl && isHorizontal ? 'nowrap' : 'wrap' }">
      <div v-show="!schema.disableLabel" class="vc-label"
        :class="{ horizontal: isHorizontal, required: isEdit ? schema.required : '' }">
        <span :style="computeStyle('Label',schema)">{{ label }}</span>
        <v-tooltip right :disabled="isVertical || !schema.tooltip">
          <template v-slot:activator="{ on }">
            <v-icon v-show="isHorizontal && schema.tooltip" v-on="on" color="primary">mdi-message-alert</v-icon>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
      </div>
      <div class="layout">
        <div class="input-box" :class="{ 'preview-text': !isEdit,'vc-datapicker-custom-style': (schema.revampSchema && schema.revampSchema[0].members) && (isEdit || (!isEdit && schema.customPreviewStyle)) }"
          :style="[{ 'border-width': pageMode == 'preview' && !schema.customPreviewStyle ? '0px !important' : '' },
          (isEdit || (!isEdit && schema.customPreviewStyle)) ? returnComputeStyle : '']">
          <div class="chip-box">
            <!-- 显示已经选择的 -->
            <template v-if="schema.dataSourceType === undefined">
              <v-chip color="primary" class="ma-1" outlined v-for="showItem in transferVal" tabindex="0" :aria-label="showItem[schema.dataCode]"
                :key="showItem._id" close :close-icon="isCloseIcon"
                :disabled="isDisabled" @click:close="close(showItem)">
                <span>{{ showItem[schema.displayField] || showItem[schema.dataCode] }}</span>
              </v-chip>
            </template>
            <template v-else>
              <v-chip class="ma-1" color="primary" outlined v-for="showItem in transferVal" tabindex="0" :aria-label="showItem[schema.displayField]"
                :key="showItem._id" close :close-icon="isCloseIcon"
                :disabled="isDisabled" @click:close="close(showItem)">
                <span>{{ showItem[schema.displayField] | timeFilter(" ", that) }}</span>
              </v-chip>
            </template>
            <v-flex class="input-wrap" v-show="!isDisabled" style="flex: 1;">
              <input class="auto-input" tabindex="0" :aria-label="label + $dm_arialabel(rules, value)" :aria-required="schema.required"
                ref="inputEl" type="text" @keydown.delete="inputDel" @input="input" @blur="validate" v-model="inputVal"
                :disabled="isDisabled" @keydown.enter.prevent style="min-height: 28px;"/>
              <!-- 下拉组件 -->
              <div class="mx-auto" v-show="isOpen" ref="cardEl">
                <span class="arrow"></span>
                <v-list flat class="list-box">
                  <v-list-item-group color="indigo">
                    <v-list-item v-show="isLoad">
                      <i class="mdi mdi-reload"></i>&nbsp;Loading
                    </v-list-item>
                    <v-list-item tabindex="0" :aria-label="item.DataCode" role="option" @keydown.enter.prevent
                      @submit.native.prevent v-for="item in Newitems" :key="item._id" class="list-item"
                      @click="getList(item)" v-html="item.FirstLineDesc" style="line-height:24px;margin-bottom:10px">
                    </v-list-item>
                  </v-list-item-group>
                  <v-list-item v-show="isNewItems">
                    {{
                        $t("peoplepicker-base.inputSearchTip")
                    }}
                  </v-list-item>
                </v-list>
              </div>
            </v-flex>
          </div>
          <span v-show="pageMode != 'preview'" class="icon-box" @click="openDialog"
            :class="{ iconError: isDisabled, iconActive: !isDisabled }">
            <v-icon :color="$vuetify.theme.dark ? '' :'pwcDarkGrey'" size="28" class="pwc-icon pwc-database"></v-icon>
          </span>
        </div>
        <v-text-field v-if="(schema.required && isEdit)" class="validationModule" height="0px" v-model="value" :rules="rules">
        </v-text-field>
      </div>
    </v-layout>
    <!--dialog begin--->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="primary" primary-title>{{ title }}</v-card-title>
        <v-container>
          <v-layout>
            <v-text-field class="rounded-0" outlined flat v-model="keyWord" solo :label="inputBoxPrompt"
              append-icon="mdi mdi-magnify" @keyup.enter="search" @click:append="search"></v-text-field>
          </v-layout>
          <!-- dialog data -->
          <v-layout class="detail-wrap">
            <div ref="list" class="detail-list-box" v-on="inputListeners">
              <v-list three-line>
                <template v-for="(item, index) in filterData">
                 <v-list-item :key="index" @click="toggleItem(item, index)">
                    <!---老数据 -->
                    <v-list-item-content v-if="schema.dataSourceType == undefined">
                      <v-list-item-title  v-html="item[schema.dataCode]"></v-list-item-title >
                      <v-list-item-subtitle v-html="item[schema.displayField]"></v-list-item-subtitle>
                      <v-list-item-subtitle></v-list-item-subtitle>
                    </v-list-item-content>
                    <!---master data 数据源-->
                    <v-list-item-content v-else-if="schema.dataSourceType == 'masterData'">
                      <!---设置了firstLineDescriptionConfig-->
                      <template v-if="item.FirstLineDesc">
                        <v-list-item-subtitle v-html="item.FirstLineDesc"></v-list-item-subtitle>
                      </template>
                      <template v-else>
                        <!---设置了line，但未设置firstLineDescriptionConfig-->
                        <template
                          v-if="schema.secondLineDescriptionConfig.length || schema.thirdLineDescriptionConfig.length">
                          <v-list-item-subtitle></v-list-item-subtitle>
                        </template>
                        <!---所有line都未设置，读取dataCode-->
                        <template v-else>
                          <v-list-item-subtitle v-html="item[schema.dataCode]"></v-list-item-subtitle>
                        </template>
                      </template>
                      <!---设置了secondLineDescriptionConfig-->
                      <template v-if="item.SecondLineDesc">
                        <v-list-item-subtitle v-html="item.SecondLineDesc"></v-list-item-subtitle>
                      </template>
                      <template v-else>
                        <!---设置了line，但未设置secondLineDescriptionConfig-->
                        <template
                          v-if="schema.firstLineDescriptionConfig.length || schema.thirdLineDescriptionConfig.length">
                          <v-list-item-subtitle></v-list-item-subtitle>
                        </template>
                        <!---所有line都未设置，读取displayFields-->
                        <template v-else>
                          <v-list-item-subtitle v-html="item[schema.displayField]"></v-list-item-subtitle>
                        </template>
                      </template>
                      <v-list-item-subtitle v-html="item.ThirdLineDesc"></v-list-item-subtitle>
                    </v-list-item-content>
                    <!---query数据源-->
                    <v-list-item-content v-else>
                     <v-list-item-title>
                        {{ item.FirstLineDesc | timeFilter(that.schema.firstLineSeparator, that) }}
                     </v-list-item-title>
                      <!---设置了secondLineDescriptionConfig-->
                      <template v-if="item.SecondLineDesc">
                        <v-list-item-subtitle style="line-height:1.4;">
                          {{ item.SecondLineDesc | timeFilter(that.schema.secondLineSeparator, that) }}
                        </v-list-item-subtitle>
                      </template>
                      <template v-else>
                        <!---设置了line，但未设置secondLineDescriptionConfig-->
                        <template
                          v-if="schema.query.firstLineDescriptionConfig.length || schema.query.thirdLineDescriptionConfig.length">
                          <v-list-item-subtitle></v-list-item-subtitle>
                        </template>
                        <!---所有line都未设置，读取displayFields-->
                        <template v-else>
                          <v-list-item-title style="line-height:1.4;">
                            {{ item[schema.displayField] | timeFilter(that.schema.secondLineSeparator, that) }}
                          </v-list-item-title>
                        </template>
                      </template>
                      <v-list-item-subtitle>
                        {{ item.ThirdLineDesc | timeFilter(that.schema.thirdLineSeparator, that) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-icon color="primary" v-show="item.isSelected" class="mdi mdi-check-circle"
                      style="font-size:34px;"></v-icon>
                  </v-list-item>
                  <v-divider :key="item._id"></v-divider>
                </template>

                <v-list-item v-show="this.filterData.length == 0 && trueData">
                  <span style="margin:70px auto;font-size:20px ">
                    {{
                        $t("peoplepicker-base.dialogSearchTip")
                    }}
                  </span>
                </v-list-item>
              </v-list>
            </div>
          </v-layout>
        </v-container>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="primary" tile @click="visibility = `selected`" v-show="visibility == `all`">
            {{ $t("peoplepicker-base.selected") }}</v-btn>
          <v-btn color="primary" tile class="ml-0" @click="backToSearch"  v-show="visibility == `selected`">
            {{ $t("peoplepicker-base.backtosearch") }}</v-btn>
          <v-spacer></v-spacer>

          <v-btn color="primary" tile outlined class="close-btn mr-1" @click="cancelSel">
            {{
                $t("peoplepicker-base.close")
            }}
          </v-btn>
          <v-badge v-show="num" class="align-self-center">
            <template v-slot:badge>
              <span>{{ num }}</span>
            </template>
          </v-badge>
          <v-btn color="primary" tile class="save-btn" @click="sure">
            {{
                $t("peoplepicker-base.ok")
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import base from "../utils/form-base";
import appInfo from "../../utils/appInfo";

var filters = {
  all: function (data) {
    return data;
  },
  selected: function () {
    return this.selectedFakeData;
  },
};

let app = appInfo();

export default {
  mixins: [base],
  props: {
    isShowDefault: Boolean,
  },
  data() {
    return {
      that: this,
      index: 0,
      isLoad: false,
      top: "68px",
      keyWord: "",
      truekeyWord: "", //真正点击了回车，才会保存
      dialog: false,
      isNewItems: false,
      inputVal: "",
      isOpen: false, //控制input实时搜索时下拉组件是否展开
      isLoadData: true,
      visibility: "all",
      loadMore: true, //当load请求成功之后，才可以发送第二个
      Newitems: [],
      data: [], //保存正常获取到的数据
      forSearch: [], //保存已选项的_id + 还木有点击ok,但是已选的
      transferVal: [], //真选数据，已经选择的数据
      selectedFakeData: [], //假选数据，还没有点击ok
      searchData: [], //保存弹框内search到的数据
      staffIds: [],
      assignValues: [],
      apiUrl: "/api/Picker",
      displayField: this.schema.displayField
        ? this.schema.displayField
        : this.displayField,
      getRelationskey: this.schema.storageFields ?
        this.schema.storageFields.join(",") : '',//save
      trueData: false,
      isControl: false,
      isOpenDialog: false,
      callbackFn: null,
      hasCallBackFn: false,
    };
  },
  filters: {
    //时间过滤器
    timeFilter(val, separator, that) {
      if (!val) return val
      let valFilter = val.toString().split(separator),
        arr = [];
      valFilter.forEach((el) => {
        if (isNaN(el)) {
          arr.push(el);
          return
        };
        if (el.length === 13) {
          el = Number(el)
          if (new Date(el).getFullYear() > 1970) {
            el = that.moment(el).format("YYYY-MM-DD HH:mm"); //时间格式
            arr.push(el);
          }
        } else {
          arr.push(el);
        }
      });
      return arr.join(separator)
    }
  },
  watch: {
    //传给后台字段
    postEndVal(val, oldVal) {
      this.$set(this.model, this.schema.model, val);
      if (this.hasCallBackFn) {
        this.callbackFn();
      }
    },
    value: {
      handler(val, oldVal) {

        if (val && Object.prototype.toString.call(val) == "[object Array]") {
          ////支持DataCode赋值：
          if (val && val.length > 0) {
            let valIndex = val[0];
            if (typeof valIndex != "object") {
              this.setValue(val);
            }
          } else if (val && val.length == 0 && oldVal && oldVal.length > 0) {
            this.transferVal = [];
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    //获取父元素的className
    let className = this.$el.parentElement.className;
    if (className.length > 0) {
      let classes = className.split(" ");

      classes.forEach((el) => {
        let elSub = el.slice(0, 2);
        if (elSub.toLowerCase() == "sm") {
          let elEnd = el.slice(2);

          if (
            elEnd &&
            12 / elEnd < 5 &&
            !this.$vuetify.breakpoint.name == "xs"
          ) {
            this.isControl = true;
          }
        }
      });
    }
  },
  created() {
    if (
      this.value &&
      Object.prototype.toString.call(this.value) == "[object Array]"
    ) {
      this.value.forEach((el) => {
        this.transferVal.push(el);
      });
    }

    if (this.isDisabled) return

    this.register();
    this.$watch("transferVal", (val, oldVal) => {
      //执行onchange事件
      this.onchange();
      this.initShowItems();
      this.validate();
    });
    //注册common method
    let currentComponentCode = this.schema.name + this.pageView.toLowerCase()
    this.bus.$on(`open_datapicker_${currentComponentCode}`, (event) => {
      if (event.callbackFn) {
        this.hasCallBackFn = true;
        this.callbackFn = event.callbackFn;
      }
      this.isOpenDialog = false;
      if (event.data) {
        this.$set(this.model, this.schema.model, event.data);
        //设置值后再弹窗
        this.isOpenDialog = true;
      } else {
        //直接弹窗
        this.openDialog();
      }
    });
  },
  methods: {
    backToSearch(){
      this.visibility = "all";
      //回去更新数据选择状态
      this.loadData()
    },
    changeColor(resultsList) {
      resultsList.map((item, index) => {
        if (this.inputVal && this.inputVal.length > 0) {
          // 匹配关键字正则
          let inputStr = this.inputVal;
          let reg = new RegExp(inputStr, "g");

          // 高亮替换v-html值
          let replaceString =
            this.inputVal;

          let str = item.FirstLineDesc.replace(
            reg,
            replaceString
          );

          resultsList[index].FirstLineDesc = str;
        }
      });
      this.Newitems = resultsList;
    },
    //del
    inputDel() {
      if (this.inputVal == "") {
        this.transferVal.pop();
      }
    },
    onchange() {
      if (this.schema.onChange) {
        this.eval(...this.schema.onChange);
      }
    },
    initShowItems() {
      if (this.transferVal.length) {
        this.transferVal.forEach((o) => this.$set(o, "isSelected", true));
      }
    },
    toggleItem(item, index) {
      //设置可以显示的最大个数
      if (
        this.maxSelectCount != 0 &&
        this.selectedFakeData.length >= this.maxSelectCount
      ) {
        if (item.isSelected == false) {
          return;
        }
      }
      item.isSelected = !item.isSelected;

      if (item.isSelected) {
        this.selectedFakeData.push(item);
      } else {
        this.selectedFakeData.map((el, index) => {
          if (el._id == item._id) {
            this.selectedFakeData.splice(index, 1);
          }
        });
      }
    },
    openDialog() {
      if (this.isDisabled) return;
      let transferVal = [];
      this.selectedFakeData = [];
      this.trueData = false;
      this.index = 1;
      this.$store.commit("DISABLE_LOADING", true);
      //如果有selected
      if (this.transferVal.length) {
        //edit模式下，如果之前有select  走查询接口
        if (this.pageMode === 'edit') {
          //目前id只支持query作为数据源查询,masterData是以dataCode作为查询key
          transferVal = this.transferVal.map(function (v) {
            return v._id;
          })
          let parameter = this.getParameter('', transferVal);
          parameter.pageSize = this.transferVal.length;
          this.$axios.post(this.apiUrl, parameter).then((res) => {
            this.selectedFakeData = res.data.Data;
            this.topData(this.selectedFakeData);
          });
        } else {
          this.selectedFakeData = [].concat(this.transferVal) || [];
          this.topData(this.selectedFakeData);
        }
      }

      //请求拿取第一页数据，做一个延时处理
      setTimeout(() => {
        let parameterAll = this.getParameter();
        this.$axios.post(this.apiUrl, parameterAll).then((res) => {
          this.$store.commit("DISABLE_LOADING", false);
          this.trueData = true;
          this.initSelMarkData(res.data.Data);
        });
      }, 500);

      //数据清空
      this.isOpen = false;
      this.dialog = true;
      this.keyWord = "";
      this.inputVal = "";
      this.isLoadData = false;
      this.searchData = [];
      this.visibility = this.transferVal.length == 0 ? "all" : "selected";
    },

    //关闭dialog
    cancelSel() {
      this.dialog = false;
      this.data.forEach((item) => {
        item.isSelected = false;
        this.transferVal.forEach((showItem) => {
          if (item._id == showItem._id) {
            item.isSelected = true;
          }
        });
      });

      this.searchData = [];
      this.selectedFakeData = [];
    },
    //置顶已选中元素,*只有前5条请求到的数据才置顶~
    topData(obj) {
      let topArr = [];
      if (obj.length) {
        obj.forEach((showItem) => {
          showItem.isSelected = true;
          this.data.forEach((item, index) => {
            if (item._id == showItem._id) {
              this.$set(item, "isSelected", true);
              topArr.push(item);
              this.data.splice(index, 1);
            } else {
              this.$set(item, "isSelected", false);
            }
          });
        });
        this.data = [].concat(topArr).concat(this.data);
      }
    },
    //参数集合
    getParameter(queryContent, selectedDatas, IgnoreStaffs) {
      //做新旧数据兼容判断，所以代码有点啰嗦
      let isDesc = false,
        orderFieldName = "",
        filters = [],
        displayField = "",
        additionalSearchKey = [];
      if (this.schema.dataSourceType === undefined) { //代表是老数据
        displayField = this.schema.displayField || this.schema.dataCode;
        additionalSearchKey = [displayField, this.schema.dataCode];
      } else {
        let Desc = this.schema.resultSorting.sortParas[0] ? this.schema.resultSorting.sortParas[0].sortOperate : [];
        isDesc = Desc == 0 ? false : true;
        orderFieldName = this.schema.resultSorting.sortParas[0]
          ? this.schema.resultSorting.sortParas[0].field
          : "";
        filters = this.schema.QueryParas.length ? this.schema.QueryParas : []; //design用到的
        displayField = this.displayField || "";
        additionalSearchKey = this.schema.CustomSearchKey.length ? this.schema.CustomSearchKey : [displayField, this.schema.dataCode];
      }
      const dataType =
        this.schema.dataSourceType === "masterData" || this.schema.dataSourceType === undefined ? "data" : "query";
      let parameter;
      if (this.schema.dataSourceType === "masterData" || this.schema.dataSourceType === undefined) { //兼容老数据
        parameter = {
          pickertype: dataType,
          selectedDatas: selectedDatas || [],
          IgnoreDatas: IgnoreStaffs || [],
          queryContent: queryContent || "",
          index: this.index,
          pageSize: 5,
          filters: filters,
          orderFieldName: orderFieldName,
          isDesc: isDesc,
          appCode: app.appCode,
          organizationCode: app.tenantId,
          categoryName: this.schema.dataPickerSource || "", //dataPickerSource---根据masterSite data中不同的tableName返回不同的数据
          dataCode: this.schema.dataCode || "", //table对应的主键名称，提供的默认的FirstLineDesc
          dataName: displayField, // 对应的列名，也是secondLineDesc的默认数据
          firstLineDesc: this.schema.firstLineDescriptionConfig || [],
          firstLineSeparator: this.schema.firstLineSeparator || " ",
          secondLineDesc: this.schema.secondLineDescriptionConfig || [],
          secondLineSeparator: this.schema.secondLineSeparator || " ",
          thirdLineDesc: this.schema.thirdLineDescriptionConfig || [],
          thirdLineSeparator: this.schema.thirdLineSeparator || " ",
          additionalSearchKey: additionalSearchKey, //搜索字段
          searchRelation: this.schema.searchRelation || "OR", //搜索字段关系
          enableAdvancedSearch: true,
          advancedQuery: "",
          exactQuery: false,
          dynamicFilter: ""
        };
      } else {
        parameter = {
          pickertype: dataType,
          queryCode: this.schema.dataPickerSource,
          searchValues: this.schema.query.searchValues,
          additionalSearch: {
            searchFields: this.schema.query.searchFields.length
              ? this.schema.query.searchFields
              : [
                {
                  name: this.displayField,
                  value: '',
                  type: '',
                },
              ],
            relationstring: this.schema.searchRelation || "Or",
            searchKey: queryContent || "",
          },
          pageIndex: this.index,
          pageSize: 5,
          orders: {},
          collation: "",
          selectedDatas: selectedDatas || [],
          IgnoreDatas: IgnoreStaffs || [],
          organizationCode: app.tenantId,
          appCode: app.appCode,
          dataName: this.displayField || "",
          dataCode: "_id",
          firstLineDesc:
            this.schema.query.firstLineDescriptionConfig || [],
          firstLineSeparator: this.schema.firstLineSeparator || " ",
          secondLineDesc:
            this.schema.query.secondLineDescriptionConfig || [],
          secondLineSeparator: this.schema.secondLineSeparator || " ",
          thirdLineDesc:
            this.schema.query.thirdLineDescriptionConfig || [],
          thirdLineSeparator: this.schema.thirdLineSeparator || " ",
          additionalSearchKey: this.schema.CustomSearchKey || this.displayField || []
        };
      }
      return parameter;
    },
    getData() {
      this.trueData = false;
      this.index = 1;
      let parameterAll = this.getParameter();
      this.$axios.post(this.apiUrl, parameterAll).then((res) => {
        this.$store.commit("DISABLE_LOADING", false);
        this.trueData = true;
        this.initSelMarkData(res.data.Data);
      });
    },
    initSelMarkSearchData(arrData) {
      //对获取的数据，如果在fakeData里则对其进行对勾标记
      this.searchData = arrData.map((o) => {
        o.isSelected = false;
        return o;
      });
      let fakeCodes = this.getFakes_id();

      if (fakeCodes.length) {
        this.searchData.forEach((item) => {
          if (fakeCodes.indexOf(item._id) != -1) {
            this.$set(item, "isSelected", true);
          } else {
            this.$set(item, "isSelected", false);
          }
        });
      }
    },
    initSelMarkData(arrData) {
      //对获取的数据，如果在fakeData里则对其进行对勾标记
      this.data = arrData.map((o) => {
        o.isSelected = false;
        return o;
      });

      let fakeCodes = this.getFakes_id();
      if (fakeCodes.length) {
        this.data.forEach((item) => {
          if (fakeCodes.indexOf(item._id) != -1) {
            this.$set(item, "isSelected", true);
          } else {
            this.$set(item, "isSelected", false);
          }
        });
      }
    },
    inputFocus() {
      this.$refs.inputEl.focus();
    },
    getFakes_id() {
      let selectedFakes_id = [];
      if (this.selectedFakeData.length) {
        this.selectedFakeData.forEach((item) => {
          selectedFakes_id.push(item._id);
        });
      }

      return [...new Set(selectedFakes_id)];
    },
    search() {
      this.trueData = false;
      this.index = 1;
      this.isLoadData = true;
      this.truekeyWord = this.keyWord;

      this.$store.commit("DISABLE_LOADING", true);
      let parameter = this.getParameter(this.keyWord);
      this.$axios.post(this.apiUrl, parameter).then((res) => {
        this.$store.commit("DISABLE_LOADING", false);
        this.trueData = true;
        let getData = res.data.Data;

        if (getData.length) {
          this.initSelMarkSearchData(getData);
        } else {
          this.data = [];
          this.searchData = [];
        }
        this.visibility = "all";
      });
    },
    getList(item) {
      if (
        this.maxSelectCount != 0 &&
        this.transferVal.length >= this.maxSelectCount
      ) {
        return;
      }
      this.isOpen = false;
      let arr = this.transferVal;
      this.inputVal = "";
      //不添加重复项
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]._id == item._id) {
          return;
        }
      }

      item.isSelected = true;
      this.transferVal.push(item);
      this.forSearch.push(item._id);
      this.inputFocus();
    },
    sure() {
      this.keyWord = "";
      this.inputVal = "";
      this.isOpen = false;
      this.dialog = false;
      this.searchData = [];

      this.transferVal.splice(
        0,
        this.transferVal.length,
        ...this.selectedFakeData.map((o) => {
          return o;
        })
      );
    },
    input() {
      if (
        this.maxSelectCount != 0 &&
        this.transferVal.length >= this.maxSelectCount
      ) {
        return;
      }
      let _this = this;

      let inputEl = _this.$refs.inputEl;
      let cardEl = _this.$refs.cardEl;

      _this.isLoad = _this.Newitems.length == 0 ? true : false;

      _this.clearTimer();
      if (_this.inputVal != "") {
        //走search接口,现在先用getData();
        _this.timer = setTimeout(() => {
          _this.inputSearch();
        }, 300);

        //获取绝对位置
        let top = _this.getElementTop(inputEl) + 74;

        cardEl.style.top = top + "px";

        _this.isOpen = true;
      } else {
        _this.isOpen = false;
      }
    },
    getElementTop(element) {
      var actualTop = element.offsetTop;
      var current = element.offsetParent;

      return actualTop;
    },
    inputSearch() {
      this.index = 1;
      let _this = this;
      _this.Newitems = [];
      this.$store.commit("DISABLE_LOADING", true);
      let IgnoreStaffs = [];
      if (this.transferVal.length) {
        this.transferVal.forEach((item) => {
          IgnoreStaffs.push(item._id);
        });
      }
      let parameter = this.getParameter(this.inputVal, [], IgnoreStaffs);

      this.$axios.post(this.apiUrl, parameter).then((res) => {
        _this.isLoad = false;

        this.$store.commit("DISABLE_LOADING", false);

        let getData = res.data.Data;

        this.changeColor(getData);

        if (getData.length) {
          _this.isNewItems = false;

          getData.forEach((o) => this.$set(o, "isSelected", true));
          if (getData.length == 1) {
            //后台添加去重逻辑，这样方便实时搜索，否则感觉像bug
            //添加前端去重逻辑
            let data = res.data.Data[0];
            if (_this.transferVal && this.transferVal.length > 0) {
              let _id = _this.transferVal.map((e) => {
                return e._id;
              });
              if (_id.indexOf(data._id) == -1) {
                _this.transferVal.push(data);
              }
            } else {
              _this.transferVal.push(data);
            }
            _this.inputVal = "";
            _this.isOpen = false;
            return;
          }
        } else {
          _this.isNewItems = true;
        }
      });
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    },
    close(showItem) {
      showItem.isSelected = false;
      this.transferVal.forEach((item, index) => {
        if (showItem._id == item._id) {
          this.transferVal.splice(index, 1);
          return;
        }
      });
    },
    loadData() {
      this.trueData = false;
      this.index += 1;
      let _this = this;
      _this.loadMore = false;
      this.$store.commit("DISABLE_LOADING", true);
      let parameter = this.getParameter(this.truekeyWord);
      this.$axios.post(this.apiUrl, parameter).then((res) => {
        this.$store.commit("DISABLE_LOADING", false);
        this.trueData = true;
        if (this.isLoadData) {
          //已经执行了search
          let getData = this.searchData.concat(res.data.Data);
          this.initSelMarkSearchData(getData);
        } else {
          let getData = this.data.concat(res.data.Data);
          this.initSelMarkData(getData);
        }

        _this.loadMore = true;
      });
    },
    getValue() {
      this.staffIds = [];
      this.transferVal.map((item) => {
        this.staffIds.push(item._id);
      });
      return this.staffIds;
    },
    getAssignValue(val) {
      this.assignValues = [];
      this.transferVal.map((item) => {
        this.assignValues.push(item[val]);
      });
      return this.assignValues;
    },
    setValue(values) {
      if (values && values.length > 0) {
        let val = values[0];
        if (typeof val == "object") return;
      } else {
        return;
      }

      values = [...new Set(values)];

      //let selectedDatas = ["190709102213221","8888888"];

      let queryContent = "";
      let parameter = this.getParameter(queryContent, values);
      this.$axios.post(this.apiUrl, parameter).then((res) => {
        this.$store.commit("DISABLE_LOADING", false);
        // fix res.data.Data 返回 Undefined 使用 map方法报错。
        let getData = res.data.Data || [];

        getData = getData.map((o) => {
          o.isSelected = true;
          return o;
        });

        this.transferVal = getData;
        if (this.isOpenDialog) {
          this.openDialog();
          this.isOpenDialog = false;
        }
      });

    },
    addValue(values) {
      // let selectedDatas = [
      //   "##190709102213221"
      // ];
      let queryContent = "";
      let parameter = this.getParameter(queryContent, values);
      this.$axios.post(this.apiUrl, parameter).then((res) => {
        this.$store.commit("DISABLE_LOADING", false);

        let getData = res.data.Data;

        getData = getData.map((o) => {
          o.isSelected = true;
          return o;
        });
        this.transferVal = [].concat(this.transferVal).concat(getData);
      });
    },
  },
  computed: {
    returnComputeStyle() {
      if(this.computeStyle('Field',this.schema) && JSON.stringify(this.computeStyle('Field',this.schema)) !== '{}'){
        return this.computeStyle('Field',this.schema)
      }else {
        let dark = this.$store.state.app.appPerference.theme.currentTheme.dark;
        let color =  `${this.$vuetify.theme.themes[dark ? 'dark' : 'light'].primary}`;
        return{'--c-borderWidth': '1px','--c-borderStyle':'solid','--c-borderColor': '#000000','--c-color':color}
      }
    },
    isDisabled() {
      if (this.pageMode == "preview") {
        return true;
      }
      return this.schema.disabled != undefined
        ? this.schema.disabled
        : !this.isEdit;
    },
    isCloseIcon() {
      if (this.$route.name.toLowerCase() == "preview") {
        return "";
      } else {
        return "pwc-icon pwc-close-outline";
      }
    },
    rules() {
      var rules = [];
      let schema = this.schema;

      if (schema.show != false) {
        if (this.schema.required) {
          rules.push((val) => {
            return (
              (val && val.length > 0) || this.$t("schema-base.rules.required")
            );
          });
        }
      }

      return rules;
    },
    // transferVal() {  //去掉同名属性
    //   return this.transferVal;
    // },
    postEndVal() {
      //传给后台的字段
      this.getRelationskey =
        this.getRelationskey +
        "," +
        this.displayField +
        "," +
        this.schema.dataCode +
        ",_id";
      // console.log(999, this.getRelationskey)
      let endArr = Array.from(new Set(this.getRelationskey.split(",")));
      let arr = [];
      arr.splice(
        0,
        arr.length,
        ...this.transferVal.map((o) => {
          var r = {};
          endArr.forEach((s) => {
            r[s] = o[s]
          });
          return r;
        })
      );

      return arr


    },
    title() {
      return this.$te(this.localeKey + ".title") &&
        this.$t(this.localeKey + ".title") ?
        this.$t(this.localeKey + ".title") :
        this.schema.title || "Data Picker";
    },
    inputBoxPrompt() {
      return this.$te(this.localeKey + ".inputBoxPrompt") &&
        this.$t(this.localeKey + ".inputBoxPrompt") ?
        this.$t(this.localeKey + ".inputBoxPrompt") :
        this.schema.inputBoxPlaceHolder ||
        "Input key word here";
    },
    maxSelectCount() {
      let schema = this.schema;
      return schema.maxCount || "";
    },
    inputListeners() {
      var vm = this;
      return Object.assign({}, this.$listeners, {
        scroll: function (event) {
          if (vm.visibility == "selected") {
            return;
          }

          let listEl = vm.$refs.list;
          //获得滚动的高度
          let scrollHeight = listEl.scrollTop;
          //获得滚动窗口的高度
          let windowScrollHeight = listEl.clientHeight;
          //获得文档高度
          let domHeight = listEl.scrollHeight;

          if (scrollHeight + 10 >= domHeight - windowScrollHeight) {
            if (vm.loadMore) {
              vm.loadData();
            }
          }
        },
      });
    },
    num() {
      return this.selectedFakeData.length;
    },
    filterData() {
      if (this.visibility == "all") {
        if (this.searchData.length) {
          return this.searchData;
        } else {
          return this.data;
        }
      } else if (this.visibility == "selected") {
        return this.selectedFakeData;
      }

    },
    loading() {
      return this.schema.loading;
    },
  },
};
</script>

<style scoped>
.vc-datapicker-custom-style .chip-box> span.v-chip{
  font-size: var(--c-fontSize) !important;
  line-height: var(--c-lineHeight) !important;
  font-family: var(--c-fontFamily) !important;
  font-weight: var(--c-fontWeight) !important;
  letter-spacing: var(--c-letterSpacing) !important;
  color: var(--c-color) !important;
  border-color: var(--c-color) !important;
}
.datapicker-box .input-box.vc-datapicker-custom-style {
  border-width: var(--c-borderWidth) !important;
  border-style: var(--c-borderStyle) !important;
  border-color: var(--c-borderColor) !important;
  border-radius: var(--c-borderRadius) !important;
  background: var(--c-background) !important;
  box-shadow: var(--c-shadow) !important;
  margin: var(--c-margin) !important;
}
.datapicker-box .input-box {
  position: relative;
  min-height: 48px;
  width: 100%;
  padding: 3px 40px 3px 4px;
  box-shadow: none;
}
.datapicker-box .require-tip {
  font-style: normal;
  font-size: 14px;
  color: red;
  margin-left: 6px;
  vertical-align: middle;
}

.datapicker-box .v-subheader {
  padding-right: 10px;
}

.datapicker-box .line {
  text-decoration: line-through;
}

.datapicker-box .marBot {
  margin-bottom: 10px;
}

.datapicker-box .label {
  display: inline-block;
  font-size: 14px;
  line-height: 35px;
  /* color: rgba(0, 0, 0, 0.54); */
}



@keyframes move {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes move {
  from {
    -webkit-transform: rotate(0deg);
  }

  to {
    -webkit-transform: rotate(360deg);
  }
}

.fa-spinner {
  -webkit-animation: move 1s linear 1s 5 alternate;
  animation: move 1s linear infinite;
}

.v-list-item-group {
  padding-top: 4px;
}

.iconError .icon {
  cursor: default;
}

.iconError {
  background: lightgrey !important;
}

.detail-list-box {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}


.type-input {
  min-height: 28px;
}

/* .v-chip.v-size--default {
  height: 24px;
} */

.chip-box {
  width: 100%;
  margin-bottom: 0;
  line-height: 0;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
}

.icon-box {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  position: absolute;
  right: 4px;
  border-radius: 6px;
  margin: 1px;
  top: 2px;
}

.icon-box .v-icon {
  font-size: 24px;
  line-height: none;
  vertical-align: none;
}

.iconTop {
  margin-top: -22px !important;
}

.v-badge {
  left: 34px;
  top: -15px;
}

.v-list {
  width: 100%;
}

.detail-wrap {
  height: 296px;
  overflow-y: auto;
  margin-top: -24px !important;
}

.v-card__title {
  font-weight: 300;
  color: #fff !important;
  padding: 16px;
}
.v-list-item__subtitle{
  min-height: 10px;
}

.v-list-item {
  min-height: 30px !important;
}

.list-item:hover {
  background: #efefef;
  color: #000;
}
.dark-data-picker .list-item:hover {
  background: #333;
}
.flex input {
  display: inline-block;
  width: 100%;
  height: 100%;
  padding: 0 4px;
}

.icon {
  font-size: 16px;
  cursor: pointer;
  color: #fff;
}

.mx-auto {
  position: absolute;
  top: 68px;
}

.arrow {
  position: absolute;
  width: 16px;
  height: 16px;
  background: #fff;
  border-top: 1px solid #efefef;
  border-left: 1px solid #efefef;
  z-index: 100;
  left: 12px;
  top: -48px;
  transform: rotate(45deg);
}
.dark-data-picker .arrow {
  background: #1e1e1e;

}

.list-box {
  position: absolute;
  width: 400px;
  /* background: #fff; */
  z-index: 99;
  top: -40px;
  max-width: 600px;
  overflow-y: auto;
  border: 1px solid #efefef;
}

.dark-data-picker .auto-input{
  color: #fff;
}

</style>
