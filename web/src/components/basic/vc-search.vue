<template>
  <v-card class="vcSearch" flat tile :class="{'dark-search':$vuetify.theme.dark}">
    <!-- 【Filter--fiter show/hide小箭头】 -->
    <v-card class="sidebar-toggle" flat tile v-bind:class="{ active: !isFilterIcon }">
      <span class="text ">{{
        $te(this.localeKey + ".filter")
          ? $t(this.localeKey + ".filter")
          : $t("search.filter")
      }}</span>
      <v-icon style="cursor: pointer" @click="isFilterIcon = !isFilterIcon">{{
        iconText
      }}</v-icon>
    </v-card>
    <v-layout>
      <!-- 【Filter section】 -->
      <div class="filter-left-wrap" v-show="isFilterIcon" style="margin-top: 113px">
        <!-- type section -->
        <v-list dense>
          <h6 class="subtitle-1 mt-3 ml-3 title-tip mb-3">
            {{
              $te(this.localeKey + ".type")
                ? $t(this.localeKey + ".type")
                : $t("search.type")
            }}
          </h6>
          <v-list-item-group>
            <v-list-item v-for="(item, index) in typeItems" :key="index" @click="checkType(item)">
              <v-list-item-action class="mr-2">
                <v-checkbox @click="checkType(item)" :input-value="isCurrentType(item.searchCode)" color="primary">
                </v-checkbox>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title class="search-type">{{ item.displayName }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-content>
                <v-list-item-title class="text-right" v-show="numFormat(item.count) !=0">{{
                  numFormat(item.count)
                }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-list dense v-show="currentSearchCode == ''" style="padding: 0">
          <v-list-item>
            <v-list-item-content>
              <v-img :src="appAd"></v-img>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <!-- filter section -->
        <div v-if="isFlag">
          <div v-for="(filterItem, index) in filterItems" :key="index" v-show="currentSearchCode != ''">
            <!-- filter>>树级结构 -->
            <div v-if="filterItem.DropDownTypeName == 'Simpledropdown'">
              <h6 class="subtitle-1 mt-3 ml-3 title-tip mb-3">
                {{ filterItem.DisplayName }}
              </h6>
              <v-treeview selection-type="leaf" activatable selectable selected-color="primary"
                :items="treeviewItems(filterItem)" item-children="Mapping" item-text="Value"
                v-model="filterItem.treeModel" return-object open-on-click :open-all="isOpenAll(filterItem.treeModel)"
                @input="
                  treeSelect(
                    $event,
                    filterItem.treeModel,
                    filterItem.DisplayName
                  )
                " class="treeview-wrap">
                <template v-slot:append="{ item }">
                  <span>{{ numFormat(item.Count) }}</span>
                </template>
              </v-treeview>
              <span class="more-filter primary--text" v-if="filterItem.isLessData && filterItem.data.length > 10"
                @click="filterItem.isLessData = !filterItem.isLessData">{{ showMoreTip }}</span>
              <span class="more-filter primary--text" v-if="!filterItem.isLessData"
                @click="filterItem.isLessData = !filterItem.isLessData">{{ showLessTip }}</span>
              <v-divider></v-divider>
            </div>

            <!-- filter>>range结构 -->
            <!-- Rangedropdown -->
            <v-list v-if="filterItem.DropDownTypeName == 'Rangedropdown'">
              <h6 class="subtitle-1 mt-3 ml-3 title-tip mb-3">
                {{ filterItem.DisplayName }}
              </h6>
              <v-list-item class="px-2">
                <v-list-item-content style="
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    max-height: 60px;
                  ">
                  <v-row class="mx-0">
                    <v-col cols="10" sm="5" class="px-0 py-0 pl-4">
                      <v-text-field v-model="filterItem.Rangedropdown.from" prepend-icon="mdi mdi-pencil-plus-outline"
                        class="input-wrap py-0" type="number" min="0"></v-text-field>
                    </v-col>
                    <v-col cols="10" sm="5" class="px-0 py-0">
                      <v-text-field v-model="filterItem.Rangedropdown.to" prepend-icon="mdi mdi-minus"
                        class="input-wrap py-0" type="number" min="0"></v-text-field>
                    </v-col>
                    <v-col cols="4" sm="2" class="px-0 py-0">
                      <v-btn text icon @click="clickRange(filterItem)">
                        <v-icon>mdi mdi-magnify</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-list-item-content>
              </v-list-item>
              <span v-show="filterItem.rangeTip" class="px-3"
                style="font-size: 12px; color: #ff5252; display: block">{{ rangeErrorTip }}</span>
              <v-treeview activatable selectable selected-color="primary" :items="filterItem.data"
                item-children="Mapping" item-text="Value" v-model="filterItem.treeModel" return-object @input="
                  treeSelect(
                    $event,
                    filterItem.treeModel,
                    filterItem.DisplayName
                  )
                " class="treeview-wrap">
                <template v-slot:append="{ item }">
                  <span>{{ numFormat(item.Count) }}</span>
                </template>
              </v-treeview>
              <v-divider></v-divider>
            </v-list>

            <!-- RangeDatedropdown -->
            <v-list v-if="filterItem.DropDownTypeName == 'RangeDatedropdown'">
              <h6 class="subtitle-1 mt-3 ml-3 title-tip mb-3">
                {{ filterItem.DisplayName }}
              </h6>
              <v-list-item class="px-2 mb-3">
                <v-list-item-content class="px-1 py-2" style="max-height: 60px">
                  <v-menu v-model="filterItem.RangeDatedropdown.toggleMenu" transition="scale-transition"
                    :close-on-content-click="false" offset-y>
                    <template v-slot:activator="{ on }">
                      <v-text-field :label="rangeDateTip" :value="currentDate(filterItem.RangeDatedropdown)" v-on="on"
                        solo prepend-inner-icon="mdi mdi-calendar-text-outline"></v-text-field>
                    </template>
                    <v-date-picker range no-title v-model="filterItem.RangeDatedropdown.datePicker" color="primary"
                      @click:date="date(filterItem)" style="width: 100%"></v-date-picker>
                  </v-menu>
                </v-list-item-content>
              </v-list-item>
              <v-treeview activatable selectable selected-color="primary" :items="filterItem.data"
                item-children="Mapping" item-text="Value" v-model="filterItem.treeModel" return-object @input="
                  treeSelect(
                    $event,
                    filterItem.treeModel,
                    filterItem.DisplayName
                  )
                " class="treeview-wrap">
                <template v-slot:append="{ item }">
                  <span>{{ numFormat(item.Count) }}</span>
                </template>
              </v-treeview>
              <v-divider></v-divider>
            </v-list>
          </div>
        </div>
      </div>
      <v-flex class="filter-right-wrap" md12 v-bind:style="{ 'padding-left': activeResultPaddingLeft }">
        <!-- 【tag section】 -->
        <v-card tile class="py-1 only-wrap" v-bind:style="{ 'padding-left': activeTagPaddingLeft }">
          <span v-show="chipItems && chipItems.length > 0">{{
              $te(this.localeKey + ".showOnly")
                ? $t(this.localeKey + ".showOnly")
                : $t("search.showOnly")
            }}
            :&nbsp;&nbsp;</span>
          <template v-for="(item, index) in chipItems">
            <v-chip :key="index" class="my-1" outlined close color="darken-4 mr-3" @click:close="closeChip(item)">
              {{ item.labels }}</v-chip>
          </template>
          <span v-show="chipItems && chipItems.length > 0">
            <v-btn text color="primary" class="px-0" @click="clearAll()">{{
                $te(this.localeKey + ".clearAll")
                  ? $t(this.localeKey + ".clearAll")
                  : $t("search.clearAll")
              }}</v-btn>
          </span>
        </v-card>
        <!-- 【result section】 -->
        <div style="padding-right: 20px;">
          <!-- 【no result tip】 -->
          <div class="pt-2 subtitle-1 mt-3 ml-3 mb-3" v-show="typeItems && typeItems[0] && typeItems[0].count == 0">{{nodataTip}}</div>
          <div class="resultBar-wrap" v-for="(resultItem, index) in resultItems" :key="index">
            <div v-show="
                (currentSearchCode == '' ||
                  resultItem.searchCode == currentSearchCode) &&
                resultItem.data &&
                resultItem.data.length > 0
              ">
              <h3 class="my-1 py-1 mb-4 mt-4" v-html="
                  getDisplayName(resultItem.displayName, resultItem.total)
                "></h3>
              <v-divider class="mb-4"></v-divider>
              <v-layout class="apps-wrap" v-if="resultItem.displayType == 'Apps'">
                <v-flex xs12 sm3 md3 lg2 xl1 v-for="(item, index) in resultItem.data" :key="index"
                  v-show="isShowResult(index, resultItem.resultNum)" style="cursor: pointer"
                  @click="goInfoUrl(item.NoNotesExternalSourceURL)">
                  <v-card pa-2 mx-2 flat style="border-radius: 0" class="app-card">
                    <v-img class="white--text" width="78px" height="78px"
                      :src="getCompleteUrl(item.IconSrc) || defaultApp"></v-img>
                    <v-card-text class="primary--text pl-0">
                      <div v-html="clearBrackets(item.Title)" class="app-title"></div>
                    </v-card-text>
                  </v-card>
                </v-flex>
                <div style="width: 100%; text-align: center">
                  <v-btn v-if="
                      currentSearchCode == '' &&
                      resultItem.total >
                        (resultItem.resultNum || resultItem.data.length)
                    " class="ml-2 mb-2" outlined tile small color="primary" @click="checkType(resultItem)">
                    {{ showMoreResult(resultItem.displayName) }}</v-btn>
                  <v-btn v-if="
                      currentSearchCode != '' &&
                      resultItem.total > resultItem.data.length
                    " class="ml-2 mb-2" outlined tile small color="primary" @click="
                      showMore(resultItem.searchCode, resultItem.data.length)
                    ">{{ showMoreTip }}</v-btn>
                </div>
              </v-layout>

              <v-layout class="people-wrap" v-if="resultItem.displayType == 'People'">
                <v-flex xs12 sm6 md6 lg6 xl4 v-for="(item, index) in resultItem.data" :key="index"
                  v-show="isShowResult(index, resultItem.resultNum)" style="cursor: pointer"
                  @click="goInfoUrl(item.NoNotesExternalSourceURL)">
                  <v-card class="card-wrap ma-3 rounded-0" 
                    :style="styleObject" flat
                    @mouseleave="wrapStatus = 'leave'"
                    @mouseover="wrapStatus = 'over'">
                    <v-list-item three-line>
                      <v-list-item-avatar tile size="80">
                        <v-img class="white--text" width="78px" height="78px"
                          :src="getCompleteUrl(item.IconSrc) || defaultPerson"></v-img>
                      </v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title class="mb-1 primary--text" style="white-space: normal"
                          v-html="clearBrackets(item.Title)"></v-list-item-title>
                        <v-list-item-subtitle style="white-space: normal; -webkit-line-clamp: unset"
                          v-html="clearBrackets(item.ExtField1)"></v-list-item-subtitle>
                        <v-list-item-subtitle style="white-space: normal; -webkit-line-clamp: unset"
                          v-html="clearBrackets(item.ExtField2)"></v-list-item-subtitle>
                        <v-list-item-subtitle style="white-space: normal; -webkit-line-clamp: unset"
                          v-html="clearBrackets(item.ExtField3)"></v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-card>
                </v-flex>
                <div style="width: 100%; text-align: center">
                  <v-btn v-if="
                      currentSearchCode == '' &&
                      resultItem.total >
                        (resultItem.resultNum || resultItem.data.length)
                    " class="ml-2 mb-2" outlined tile small color="primary" @click="checkType(resultItem)">
                    {{ showMoreResult(resultItem.displayName) }}</v-btn>
                  <v-btn v-if="
                      currentSearchCode != '' &&
                      resultItem.total > resultItem.data.length
                    " class="ml-2 mb-2" outlined tile small color="primary" @click="
                      showMore(resultItem.searchCode, resultItem.data.length)
                    ">{{ showMoreTip }}</v-btn>
                </div>
              </v-layout>

              <v-layout class="documents-wrap" v-if="resultItem.displayType == 'Documents'">
                <v-list style="width: 100%">
                  <v-list-item v-for="(item, index) in resultItem.data" :key="index"
                    v-show="isShowResult(index, resultItem.resultNum)" class="py-0" style="
                      width: 100%;
                      border-bottom: 1px solid #ddd;
                      cursor: pointer;
                    " @click="goInfoUrl(item.NoNotesExternalSourceURL)">
                    <v-list-item-content>
                      <v-list-item-title class="primary--text my-1 py-1" style="white-space: normal"
                        v-html="clearBrackets(item.Title)"></v-list-item-title>
                      <v-list-item-title style="white-space: normal" v-html="clearBrackets(item.Content)">
                      </v-list-item-title>
                      <v-list-item-subtitle style="white-space: normal; -webkit-line-clamp: unset"
                        v-html="clearBrackets(item.ExtField1)"></v-list-item-subtitle>
                      <div class="high-wrap">
                        <img v-if="item.DMSystem_HighlightInMainDoc == true" :src="docOnSrc" />
                        <img v-if="item.DMSystem_HighlightInMainDoc == false" :src="docSrc" />
                        <img v-if="item.DMSystem_HighlightInAttachment == true" :src="fileOnSrc" />
                        <img v-if="item.DMSystem_HighlightInAttachment == false" :src="fileSrc" />
                        <span v-if="item.Hightlight" style="vertical-align: middle"
                          v-html="clearBracketsOne(item.Hightlight)"></span>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <div style="width: 100%; text-align: center; margin-top: 20px">
                  <v-btn v-if="
                      currentSearchCode == '' &&
                      resultItem.total >
                        (resultItem.resultNum || resultItem.data.length)
                    " class="ml-2 mb-2" outlined tile small color="primary" @click="checkType(resultItem)">
                    {{ showMoreResult(resultItem.displayName) }}</v-btn>
                  <v-btn v-if="
                      currentSearchCode != '' &&
                      resultItem.total > resultItem.data.length
                    " class="ml-2 mb-2" outlined tile small color="primary" @click="
                      showMore(resultItem.searchCode, resultItem.data.length)
                    ">{{ showMoreTip }}</v-btn>
                </div>
              </v-layout>
            </div>
          </div>
        </div>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
  import base from "../utils/form-base";
  import {
    Base64
  } from "js-base64";
  import moment from "moment";
  import {
    exportEnvUrl,
  } from "../../utils/env";
  import getAppInfo from "../../utils/appInfo";
  let appInfo = getAppInfo()
  export default {
    mixins: [base],
    data() {
      return {
        wrapStatus: 'leave',
        requestURL:"search",
        defaultApp: this.$store.getters.cdnHostAndVersionPath +
          "/static/images/blank_image.svg",
        defaultPerson: this.$store.getters.cdnHostAndVersionPath +
          "/static/images/user.svg",
        isFlag: true,
        searchCodeAutoComplete: "",
        select: "",
        QueryKeywords: "",
        activeResultPaddingLeft: "300px", //tag展示区域左侧padding
        activeTagPaddingLeft: "300px", //result展示区域左侧padding
        isFilterIcon: true, //是否展示 filter右侧对应的小箭头
        appAd: this.$store.getters.cdnHostAndVersionPath +
          "/static/images/vsearch_ad1.gif",
        filterItems: [], //Filter--对应的数据list（tree、range、date）
        filterItemsBox: [], //保存reSearch之后最新获取的filterItems数据
        resultItems: [], //result--数据展示对象
        defaultSrc: this.$store.getters.cdnHostAndVersionPath + "/static/images/user.svg",
        docSrc: this.$store.getters.cdnHostAndVersionPath + "/static/images/doc.png",
        docOnSrc: this.$store.getters.cdnHostAndVersionPath + "/static/images/doc-on.png",
        fileSrc: this.$store.getters.cdnHostAndVersionPath + "/static/images/file.png",
        fileOnSrc: this.$store.getters.cdnHostAndVersionPath +
          "/static/images/file-on.png",
        items: [], //tree树形结构 数据对象
        chipItems: [], //【tag section】显示的filter条件
        typeItems: [], //【Filter section】对应的type list
        currentSearchCode: "", //【Filter section】当前选中的type对应的searchCode,默认为空，展示所有数据
        id: 0, //treeView独特的item-key，唯一，方便选项勾选
        allCount: 0, //type-all对应的总数量
        showMoreSearchCode: "", //点击showmore操作，记录的当前需要show more的searchCode
        pageSize: 12, //当type为all时默认pageSize为12
      };
    },
    computed: {
      styleObject() {
        if(this.wrapStatus =='leave'){
          return '';
        }else {
          return { 
            border:`1px ${this.$vuetify.theme.themes.light.primary} solid`
          };
        }
      },
      /**
       * @description: treeview对应的数据源
       * @param {obj} filterItem
       * @return {obj}
       */
      treeviewItems() {
        return function (filterItem) {
          return filterItem.isLessData ? filterItem.lessData : filterItem.data;
        };
      },
      /**
       * @description: 获取result上方的displayName
       * @param {string} displayName
       * @param {number} total
       * @return void
       */
      getDisplayName() {
        return function (name, count) {
          return name + "&nbsp;&nbsp;(" + this.numFormat(count) + ")";
        };
      },
      /**
       * @description: 当前tree有勾选，呈打开状态
       * @param {array} 当前tree结构的勾选
       * @return void
       */
      isOpenAll() {
        return function (treeModel) {
          return treeModel && treeModel.length > 0;
        };
      },
      /**
       * @description: rangecount Error Tip
       * @return void
       */
      rangeErrorTip() {
        return this.$te(this.localeKey + ".rangeErrorTip") ?
          this.$t(this.localeKey + ".rangeErrorTip") :
          this.$t("search.rangeErrorTip");
      },
      /**
       * @description: no data tip
       * @return void
       */
      nodataTip() {
        return this.$t("search.nodatatip");
      },
      /**
       * @description: rangeDate label
       * @return void
       */
      rangeDateTip() {
        return this.$te(this.localeKey + ".rangeDateTip") ?
          this.$t(this.localeKey + ".rangeDateTip") :
          this.$t("search.rangeDateTip");
      },
      /**
       * @description: 根据user设置的number of result控制show/hide
       * @param {number} index
       * @param {number} resultNum,user设置的number result
       * @return {Boolean}
       */
      isShowResult() {
        return function (index, resultNum) {
          if (this.currentSearchCode == "") {
            return index + 1 <= resultNum;
          } else {
            return true;
          }
        };
      },
      /**
       * @description: 给数字添加千字分隔符
       * @return {Number}
       */
      numFormat() {
        return function (num) {
          if(num){
            var res = num.toString().replace(/\d+/, function (n) {
              // 先提取整数部分
              return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                return $1 + ",";
              });
            });
            return res;
          }
        };
      },
      /**
       * @description: show more result btn 多语
       * @return void
       */
      showMoreResult() {
        return function (displayName) {
          let showMoreStr = this.$te(this.localeKey + ".showMore") ?
            this.$t(this.localeKey + ".showMore") :
            this.$t("search.showMore");
          let resultStr = this.$te(this.localeKey + ".result") ?
            this.$t(this.localeKey + ".result") :
            this.$t("search.result");

          return showMoreStr + " " + displayName + " " + resultStr;
        };
      },
      /**
       * @description: show less btn
       * @return void
       */
      showLessTip() {
        return this.$te(this.localeKey + ".showLess") ?
          this.$t(this.localeKey + ".showLess") :
          this.$t("search.showLess");
      },
      /**
       * @description: show more btn
       * @return void
       */
      showMoreTip() {
        return this.$te(this.localeKey + ".showMore") ?
          this.$t(this.localeKey + ".showMore") :
          this.$t("search.showMore");
      },
      /**
       * @description: 从design里获取的schema数据：用于type/result数据的展示
       * @return void
       */
      typeList() {
        return this.schema.typeList;
      },
      /**
       * @description: 将所选日期展示在daterange里
       * @param {obj} 选择日期范围
       * @return {string} 日期显示字符串
       */
      currentDate() {
        let _this = this;
        return function (obj) {
          if (obj.start && obj.end) {
            return obj.start + " to " + obj.end;
          } else {
            return this.rangeDateTip;
          }
        };
      },
      /**
       * @description: 选中当前已选的type
       * @param {string} 当前选项的searchCode
       * @return {boolean} 是否是当前选中项
       */
      isCurrentType() {
        let _this = this;
        return function (searchCode) {
          return searchCode == _this.currentSearchCode;
        };
      },
      /**
       * @description: 切换展示filer右侧的不同箭头
       * @return {string} icon对应的text
       */
      iconText() {
        if (this.isFilterIcon) {
          this.activeResultPaddingLeft = "300px";
          this.activeTagPaddingLeft = "8px";
          return "mdi mdi-arrow-left";
        } else {
          this.activeResultPaddingLeft = "0px";
          this.activeTagPaddingLeft = "134px";
          return "mdi mdi-arrow-right";
        }
      },
      /**
       * @description: search接口请求参数
       * @return {obj}
       */
      parameter() {
        return {
          PageSize: this.pageSize,
          QueryKeyword: this.select || "",
          SearchSettingId: this.schema.AppSearchId,
          SearchCodeArray: [],
          PageNo: 1,
          FilterConditions: [],
          SortConditions: [],
        };
      },
    },
    watch: {
      /**
       * @description: 当chipItems发生改变，拼接相对应的请求参数
       * @param {}
       * @return void
       */
      chipItems(val) {
        let result = []; //获取参数 FilterConditions
        if (val && val.length >= 2) {
          this.chipItems.forEach((el) => {
            let obj = {};
            if (el.DropDownTypeName == "Simpledropdown") {
              let FieldLabelsArr = el.FieldLabels.split(">>");
              let ValuesLabelsArr = el.ValuesLabels.split(">>");
              let length = FieldLabelsArr.length;

              let i = 0;
              obj = {
                GroupKey: el.DisplayName,
                Field: FieldLabelsArr[i],
                Operator: el.Operator,
                Values: [ValuesLabelsArr[i]],
                Type: el.Type,
                SubFilters: [],
              };

              if (length - 1 > i) {
                obj.SubFilters = [this.getSubFilters(i + 1, el)];
              }

              //子对象去重，联合
              /*
               *如果第一层的values值相同，则判断是否存在子二级，依次判断子二级是否存在相同的，如果子二级
               *  有相同的，则将其子三级值添加到一起即可。如果没有，则将子二级值添加到一起。
               * 如果第一层的values值没有相同的，则直接添加即可。
               */

              if (result && result.length > 0) {
                let flag = true;
                result.forEach((item, index) => {
                  if (obj.Values[0] == item.Values[0]) {
                    flag = false;
                    let secondFlag = true;

                    obj.SubFilters.forEach((objEl) => {
                      item.SubFilters.forEach((itemEl) => {
                        if (objEl.Values[0] == itemEl.Values[0]) {
                          secondFlag = false;

                          if (
                            objEl.SubFilters[0] &&
                            Object.keys(objEl.SubFilters[0]).length > 0
                          ) {
                            //将子三级值添加到一个数组里
                            itemEl.SubFilters.push(objEl.SubFilters[0]);
                          }
                        }
                      });
                    });

                    if (secondFlag) {
                      //将子二级值添加到一个数组里
                      if (
                        obj.SubFilters[0] &&
                        Object.keys(obj.SubFilters[0]).length > 0
                      ) {
                        item.SubFilters.push(obj.SubFilters[0]);
                      }
                    }
                  }
                });

                if (flag) {
                  result.push(obj);
                }
              } else {
                result.push(obj);
              }
            } else if (
              el.DropDownTypeName == "Rangedropdown" ||
              el.DropDownTypeName == "RangeDatedropdown"
            ) {
              obj = {
                GroupKey: el.DisplayName,
                Field: el.Field,
                Operator: el.Operator,
                Values: [el.Values[0]],
                Type: el.Type,
                SubFilters: [],
              };

              //将同一组displayName，整合成一个Values数组格式【在同一个displyName下，对应的ESName值相同】
              if (result && result.length > 0) {
                let flag = true;
                result.forEach((item) => {
                  if (obj.Field == item.Field) {
                    flag = false;
                    item.Values.push(obj.Values[0]);
                  }
                });

                if (flag) {
                  result.push(obj);
                }
              } else {
                result.push(obj);
              }
            }
          });

          //如果勾选了父级，则只展示到父级，不传递子级勾选
          result.forEach((firstEl) => {
            if (firstEl.Type == "Terms") {
              //针对参数第一级
              let filterId = firstEl.GroupKey + " >> " + firstEl.Values[0];
              let firstFlag = true;

              if (firstEl.SubFilters.length > 0) {
                this.filterItems.forEach((filterItem) => {
                  if (filterItem.DisplayName == firstEl.GroupKey) {
                    let data = filterItem.data;
                    data.forEach((firstData) => {
                      if (firstData.id == filterId) {
                        //拿到该Filter 父级下--根子级的数量
                        let filterCount = 0;
                        let selectCount = 0;

                        firstData.Mapping.forEach((fd) => {
                          if (fd.Mapping && fd.Mapping.length > 0) {
                            //当前是三级结构
                            filterCount += fd.Mapping.length;
                          } else {
                            //是二级结构
                            filterCount += 1;
                          }
                        });

                        //拿到已选的所有子级的个数
                        firstEl.SubFilters.forEach((selfd) => {
                          if (selfd.SubFilters && selfd.SubFilters.length) {
                            selectCount += selfd.SubFilters.length;
                          } else {
                            selectCount += 1;
                          }
                        });

                        if (filterCount == selectCount) {
                          //一级/二级：勾选了父级===子级全部得到勾选
                          firstEl.SubFilters = [];
                          firstFlag = false;
                        }
                      }
                    });
                  }
                });
              }

              if (firstFlag) {
                if (firstEl.SubFilters.length > 0) {
                  firstEl.SubFilters.forEach((secondEl) => {
                    //针对参数第二级
                    let sencondId = filterId + " >> " + secondEl.Values[0];
                    let secondFlag = true;

                    if (secondEl.SubFilters.length > 0) {
                      this.filterItems.forEach((filterItem) => {
                        if (filterItem.DisplayName == firstEl.GroupKey) {
                          filterItem.data.forEach((firstData) => {
                            firstData.Mapping.forEach((secondData) => {
                              if (secondData.id == sencondId) {
                                if (
                                  secondData.Mapping.length ==
                                  secondEl.SubFilters.length
                                ) {
                                  //三级下的二级：勾选了二级父级===子三级全部得到勾选
                                  secondEl.SubFilters = [];
                                  secondFlag = false;
                                }
                              }
                            });
                          });
                        }
                      });
                    }
                  });
                }
              }
            }
          });
        }

        this.parameter.FilterConditions = result;
      },
    },
    methods: {
      /**
       * @description:对后台返回的IconSrc进行文件处理，转化成可识别的url
       * @param {string} 
       * @return {string} 
       */
      getCompleteUrl(src) {
        if (src && src.Value && src.Value.length > 0) {
          let url = location.origin +
          ((window.urlMode == 'NOTENANTAPPCODE') ? '' : `/${appInfo.tenantId}/${appInfo.appCode}`) +
            src.Value;

          return url;
        }
      },
      /**
       * @description:去掉：字符串中的[]和["",""]
       * @param {string} 字符串
       * @return {string} 去掉之后的字符串
       */
      clearBrackets(str) {
        if (str && str.Type && str.Type == 'datetime') {
          let currentGlobalDateFormat = this.$store.state.app.appPerference.GlobalDateFormat;
          if (!currentGlobalDateFormat) {
            currentGlobalDateFormat = "YYYY/MM/DD HH:mm";
          }
          return this.$options.filters["dateformat"](parseInt(str.Value), currentGlobalDateFormat);
        } else {
          if(str && str.Value) {
            return this.clearBracketsOne(str.Value);
          }          
        }
      },
      /**
       * @description:去掉：字符串中的[]和["",""]
       * @param {string} 字符串
       * @return {string} 去掉之后的字符串
       */
      clearBracketsOne(str) {
        let result = "";
        //数组情况        
        if (str instanceof Array) {
          return str.join(',');
        } else {
          //非数组情况，处理数组格式的字符串
          if (str && str && str.length) {
            let flag = 0;
            for (let i = 0; i < str.length; i++) {
              let tmp = str.charAt(i);
              if (tmp == "[") {
                flag = 1;
                continue;
              }

              if (tmp == "]") {
                flag = 2;
                continue;
              }

              if ((flag == 1 && tmp == "'") || (flag == 1 && tmp == '"')) {
                continue;
              }
              result += tmp;
            }
            return result;
          }
          return result;
        }
      },
      /**
       * @description:数组对象根据指定属性值进行排序
       * @param {string} 属性key
       * @return {obj} 排序之后的数组对象
       */
      compare(property) {
        return function (a, b) {
          var value1 = a[property];
          var value2 = b[property];
          return value1 - value2;
        };
      },
      /**
       * @description:跳转到详情
       * @param {string} url
       * @return void
       */
      goInfoUrl(itemUrl) { 
        let _str = itemUrl.Value.indexOf("?") > 0 ? '' : '?', _route = (window.urlMode == 'NOTENANTAPPCODE') ? '' : `/${appInfo.tenantId}/${appInfo.appCode}`
        let url = `${location.origin}${_route}${itemUrl.Value}${_str}&search_q=${encodeURIComponent(Base64.encode(this.select))}`
          
        window.open(url, "_blank");
      },
      /**
       * @description:刷新页面
       * @param {string} 加密过的search-key
       * @return void
       */
      openHref(key) {
        let url = `${location.origin}${window.location.pathname}?${key}`;
        window.top.location.href = exportEnvUrl(url);
      },
      /**
       * @description: 将querykeyword添加到tag
       * @return {obj} SubFilters子对象
       */
      addQueryKeyWordsToChip() {
        let searchChipItems = {
          id: "autoComplete",
          searchCode: this.searchCodeAutoComplete,
          labels: this.select,
        };

        this.addChipItem(searchChipItems.id, searchChipItems);
      },
      /**
       * @description: 获取参数--FilterConditions
       * @param {Number} index
       * @param {obj} el
       * @return {obj} SubFilters子对象
       */
      getSubFilters(index, el) {
        let FieldLabelsArr = el.FieldLabels.split(">>");
        let ValuesLabelsArr = el.ValuesLabels.split(">>");
        let length = FieldLabelsArr.length;

        let child = {
          Field: FieldLabelsArr[index],
          Operator: el.Operator,
          Values: [ValuesLabelsArr[index]],
          Type: el.Type,
          SubFilters: [],
        };
        if (length - 1 > index) {
          child.SubFilters = [this.getSubFilters(index + 1, el)];
        }
        return child;
      },
      /**
       * @description: 日期格式化
       * @param {string} date
       * @return {string} date
       */
      formatDate(date) {
        return moment(date).format("DD/MM/YYYY");
      },
      /**
       * @description: 点击日期操作
       * @param {obj} 当前filterItem对象
       * @return void
       */
      date(el) {
        if (el.RangeDatedropdown.datePicker.length >= 2) {
          //判断日期大小：从小到大
          let time1 = new Date(el.RangeDatedropdown.datePicker[0]);
          let time2 = new Date(el.RangeDatedropdown.datePicker[1]);

          if (time1.getTime() > time2.getTime()) {
            el.RangeDatedropdown.start = this.formatDate(
              el.RangeDatedropdown.datePicker[1]
            );

            el.RangeDatedropdown.end = this.formatDate(
              el.RangeDatedropdown.datePicker[0]
            );
          } else {
            el.RangeDatedropdown.start = this.formatDate(
              el.RangeDatedropdown.datePicker[0]
            );

            el.RangeDatedropdown.end = this.formatDate(
              el.RangeDatedropdown.datePicker[1]
            );
          }

          let chipItem = {
            Field: el.ESName || el.DisplayName,
            Operator: "Equal",
            Type: "RDate",
            DisplayName: el.DisplayName,
            Values: [el.RangeDatedropdown.start + "-" + el.RangeDatedropdown.end],
            DropDownTypeName: el.DropDownTypeName,
            id: el.id,
            labels: el.DisplayName +
              " >> " +
              (el.RangeDatedropdown.start + "-" + el.RangeDatedropdown.end),
          };

          this.addChipItem(el.id, chipItem);

          setTimeout(() => {
            el.RangeDatedropdown.toggleMenu = false;
          }, 1000);

          this.reSearch();
        }
      },
      /**
       * @description: 【type、filter、chip改变时，重新search】重新search,渲染数据
       * @return void
       */
      reSearch() {
        this.isFlag = false;
        this.parameter.QueryKeyword = this.select;
        this.parameter.SearchCodeArray = [this.currentSearchCode];
        this.parameter.PageNo = 1;
        this.getResultData(this.parameter);
      },
      /**
       * @description: 提取公共添加tag区域
       * @param {string} 结构id
       * @param {obj} 要添加的tag 对象
       * @return void
       */
      addChipItem(id, chipItem) {
        let newChipItems = [];
        if (this.chipItems && this.chipItems.length > 0) {
          newChipItems = this.chipItems.filter((v) => v.id !== id);
          newChipItems.push(chipItem);
        } else {
          newChipItems.push(chipItem);
        }

        this.chipItems = newChipItems;
      },
      /**
       * @description: 点击当前的range,将其展示在tag区域
       * @param {obj} 当前操作项
       * @return void
       */
      clickRange(el) {
        if (el && el.Rangedropdown.from >= 0 && el.Rangedropdown.to >= 0) {
          if (parseInt(el.Rangedropdown.to) < parseInt(el.Rangedropdown.from)) {
            el.rangeTip = true;
            return;
          } else {
            el.rangeTip = false;
          }

          let chipItem = {
            Field: el.ESName,
            Operator: "Equal",
            Type: "Range",
            DropDownTypeName: el.DropDownTypeName,
            DisplayName: el.DisplayName,
            Values: [el.Rangedropdown.from + "-" + el.Rangedropdown.to],
            id: el.id,
            labels: el.DisplayName +
              " >> " +
              (el.Rangedropdown.from + "-" + el.Rangedropdown.to),
          };

          this.addChipItem(el.id, chipItem);

          this.reSearch();
        }
      },
      /**
       * @description: 选中/取消当前的tree结构：显示在tag区域
       * @param {obj} 当前选中的层级项
       * @return void
       */
      treeSelect(el, treeModel, DisplayName) {
        let newChipItems = [];
        let rangeChipItem = [];

        if (this.chipItems && this.chipItems.length > 0) {
          //拿到displayName 对应的range结构对象
          this.chipItems.forEach((list) => {
            if (
              list.DisplayName == DisplayName &&
              Object.keys(list).length == 8
            ) {
              rangeChipItem.push(list);
            }
          });

          newChipItems = this.chipItems.filter(
            (v) => v.DisplayName != DisplayName
          );

          if (rangeChipItem && rangeChipItem.length > 0) {
            newChipItems = newChipItems.concat(el).concat(rangeChipItem);
          } else {
            newChipItems = newChipItems.concat(el);
          }
        } else {
          newChipItems = el;
        }

        this.chipItems = newChipItems;

        this.reSearch();
      },
      /**
       * @description: 将当前选中的type,显示在tag section;同时清空其他type类型的已选数据
       * @param {obj} 当前选中的Filter--type
       * @return void
       */
      checkType(item) {
        if (this.select == "" && this.currentSearchCode == item.searchCode) {
          return;
        }

        this.currentSearchCode = encodeURIComponent(
          Base64.encode(item.searchCode)
        );

        let queryKey = this.getUrlParam("q");
        this.openHref("q=" + queryKey + "&t=" + this.currentSearchCode);
      },
      /**
       * @description: 清空所有已选的filter 条件,默认选择type-all
       * @return void
       */
      clearAll() {
        this.openHref("");
      },
      /**
       * @description: 关闭chip item，并将对应的filter、type选中状态取消
       * @param {obj} 点击关闭对应的chip item
       * @return void
       */
      closeChip(item) {
        //存在searchCode字段，则为Filter--type类型
        //清空type
        if (item.searchCode) {
          //close querykeyword
          if (item.searchCode == this.searchCodeAutoComplete) {
            this.select = "";
            this.QueryKeywords = "";
            this.currentSearchCode = encodeURIComponent(
              Base64.encode(this.currentSearchCode)
            );
          } else {
            //close type
            this.currentSearchCode = "";
            this.select = this.getUrlParam("q");
          }

          this.openHref("q=" + this.select + "&t=" + this.currentSearchCode);
        } else {
          let id = item.id;

          if (Object.keys(item).length > 8) {
            this.chipItems = this.chipItems.filter((el) => {
              return el.id != id;
            });

            //tree结构
            //当treeModel有改动时，会自动去触发 treeSelect事件
            this.filterItems.forEach((el) => {
              let treeModel = [];
              treeModel = el.treeModel.filter((elChild) => {
                return elChild.id != id;
              });

              el.treeModel = treeModel;
              return;
            });
          } else {
            //range结构
            this.chipItems = this.chipItems.filter((el) => {
              return el.id != id;
            });

            this.filterItems.forEach((el) => {
              if (el.id == id) {
                if (item.DropDownTypeName == "Rangedropdown") {
                  el.Rangedropdown.from = Number;
                  el.Rangedropdown.to = Number;
                } else if (item.DropDownTypeName == "RangeDatedropdown") {
                  el.RangeDatedropdown.start = "";
                  el.RangeDatedropdown.end = "";
                  el.RangeDatedropdown.datePicker = [
                    new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
                    .toISOString()
                    .substr(0, 10),
                    new Date().toISOString().substr(0, 10),
                  ];
                }
              }
            });
          }
        }

        this.reSearch();
      },
      /**
       * @description: 给树级结构添加唯一id,用于勾选;添加已勾选项 展示在tag上的label信息
       * @param {array}
       * @return void
       */
      addKey(
        arr,
        labels,
        DisplayName,
        DropDownTypeName,
        FieldLabels,
        ValuesLabels
      ) {
        arr.forEach((el) => {
          // el.id = this.id++;
          el.labels = labels + " >> " + el.Value;
          el.id = el.labels;
          el.DisplayName = DisplayName;
          el.DropDownTypeName = DropDownTypeName;

          //仅为传参使用
          el.Field = el.ESName || el.DisplayName;

          if (DropDownTypeName == "Simpledropdown") {
            el.Operator = "Equal";
            el.Type = "Terms";
            el.Values = [el.Value];
          } else if (DropDownTypeName == "Rangedropdown") {
            el.Operator = "Equal";
            el.Type = "Range";
            el.Values = [el.From + "-" + el.To];
          } else if (DropDownTypeName == "RangeDatedropdown") {
            el.Operator = "Equal";
            el.Type = "RDate";
            el.Values = [el.FromAsString + "-" + el.ToAsString];
          }

          let currentFieldLabels = FieldLabels || "";
          let currentValuesLabels = ValuesLabels || "";

          el.FieldLabels = currentFieldLabels ?
            currentFieldLabels + ">>" + el.Field :
            el.Field;
          el.ValuesLabels = currentValuesLabels ?
            currentValuesLabels + ">>" + el.Value :
            el.Value;

          if (!el.Mapping || el.Mapping.length == 0) {
            return;
          }

          this.addKey(
            el.Mapping,
            el.labels,
            DisplayName,
            DropDownTypeName,
            el.FieldLabels,
            el.ValuesLabels
          );
        });
      },
      /**
       * @description: 获取展示数据
       * @param {obj}  el
       * @return void
       */
      getResult(el, resultList, total) {
        let obj = this.getDisplayInfo(el.searchCode);

        if (obj) {
          this.resultItems.push({
            displayName: obj.displayName,
            displayType: obj.displayType,
            order: obj.order,
            resultNum: obj.resultNum,
            searchCode: el.searchCode,
            typepageSize: obj.typepageSize,
            total: total,
            data: resultList || [],
          });
        }
      },
      /**
       * @description: reSearch()之后获取最新的Filter-fiter列表
       * @param {obj}  数据源对象
       * @return void
       */
      getNewFilter(filterList) {
        filterList.forEach((filterItem) => {
          //单个filerItem渲染数据对象
          let obj = {
            DisplayName: filterItem.DisplayName,
            DropDownTypeName: filterItem.DropDownTypeName,
            data: [],
            lessData: [],
            isLessData: true, //默认最多展示10条filter数据
            treeModel: [],
            ESName: filterItem.SubTitle,
          };

          if (filterItem.DropDownTypeName == "Simpledropdown") {
            this.addKey(
              filterItem.Mapping,
              filterItem.DisplayName,
              filterItem.DisplayName,
              filterItem.DropDownTypeName
            );
            obj.data = filterItem.Mapping;

            obj.lessData = obj.data.filter((el, index) => {
              return index < 10;
            });
          } else if (filterItem.DropDownTypeName == "Rangedropdown") {
            obj.Rangedropdown = {
              from: Number,
              to: Number,
            };
    
            obj.id = obj.DisplayName + " >> range";
            obj.rangeTip = false;

            this.addKey(
              filterItem.Mapping,
              filterItem.DisplayName,
              filterItem.DisplayName,
              filterItem.DropDownTypeName
            );
            obj.data = filterItem.Mapping;
          } else if (filterItem.DropDownTypeName == "RangeDatedropdown") {
            obj.RangeDatedropdown = {
              toggleMenu: false,
              start: "",
              end: "",
              datePicker: [
                new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
                .toISOString()
                .substr(0, 10),
                new Date().toISOString().substr(0, 10),
              ],
            };
            obj.id = obj.DisplayName + " >> date";

            this.addKey(
              filterItem.Mapping,
              filterItem.DisplayName,
              filterItem.DisplayName,
              filterItem.DropDownTypeName
            );
            obj.data = filterItem.Mapping;
          }

          this.filterItemsBox.push(obj);
        });
      },
      /**
       * @description: 获取Filter-fiter列表
       * @param {obj}  数据源对象
       * @return void
       */
      getFilter(filterList) {
        filterList.forEach((filterItem) => {
          //单个filerItem渲染数据对象
          let obj = {
            DisplayName: filterItem.DisplayName,
            DropDownTypeName: filterItem.DropDownTypeName,
            data: [], //全部filter数据
            lessData: [], //默认展示10条filter数据，add show more btn
            isLessData: true, //默认最多展示10条filter数据
            treeModel: [],
            ESName: filterItem.SubTitle,
          };

          if (filterItem.DropDownTypeName == "Simpledropdown") {
            this.addKey(
              filterItem.Mapping,
              filterItem.DisplayName,
              filterItem.DisplayName,
              filterItem.DropDownTypeName
            );
            obj.data = filterItem.Mapping;

            obj.lessData = obj.data.filter((el, index) => {
              return index < 10;
            });
          } else if (filterItem.DropDownTypeName == "Rangedropdown") {
            obj.Rangedropdown = {
              from: Number,
              to: Number,
            };
         
            obj.id = obj.DisplayName + " >> range";
            obj.rangeTip = false;

            this.addKey(
              filterItem.Mapping,
              filterItem.DisplayName,
              filterItem.DisplayName,
              filterItem.DropDownTypeName
            );
            obj.data = filterItem.Mapping;
          } else if (filterItem.DropDownTypeName == "RangeDatedropdown") {
            obj.RangeDatedropdown = {
              toggleMenu: false,
              start: "",
              end: "",
              datePicker: [
                new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
                .toISOString()
                .substr(0, 10),
                new Date().toISOString().substr(0, 10),
              ],
            };
   
            obj.id = obj.DisplayName + " >> date";

            this.addKey(
              filterItem.Mapping,
              filterItem.DisplayName,
              filterItem.DisplayName,
              filterItem.DropDownTypeName
            );
            obj.data = filterItem.Mapping;
          }

          this.filterItems.push(obj);
        });
      },
      /**
       * @description: 对已选的Filter-type，将已选数据显示在tag区域
       * @param {}
       * @return void
       */
      currentTypeToTag() {
        if (this.select) {
          this.addQueryKeyWordsToChip();
        }

        if (this.currentSearchCode == "") {
          return;
        }

        let chipItems = this.typeItems.filter((el) => {
          return el.searchCode == this.currentSearchCode;
        });

        this.chipItems = this.chipItems.concat(chipItems);
      },
      /**
       * @description: 根据searchCode获取displayName,displayType
       * @param {string} searchCode
       * @return {obj}
       */
      getDisplayInfo(searchCode) {
        if (!this.typeList.length) {
          return;
        }
        let currentType = this.typeList.filter((item) => {
          return item.name == searchCode;
        });

        let displayName = currentType[0].displayName || "document";
        let displayType = currentType[0].displayType || "Document";
        let order = currentType[0].order || 0;
        let resultNum = currentType[0].sizeInAll || this.pageSize;
        let typepageSize = currentType[0].sizeInNonAll || this.pageSize;

        let obj = {
          displayName: displayName,
          displayType: displayType,
          order: order,
          resultNum: resultNum,
          typepageSize: typepageSize,
        };
        return obj;
      },
      /**
       * @description: 默认添加type-all
       * @param {}
       * @return void
       */
      addAllType() {
        let typeItemAll = {
          searchCode: "",
          displayName: "All",
          displayType: "All",
          count: this.allCount,
          labels: "All",
          order: 0,
          resultNum: this.pageSize,
        };

        this.typeItems.unshift(typeItemAll);
      },
      /**
       * @description: 获取filter-typelist
       * @param {obj} el
       * @return void
       */
      getType(el) {
        let total = 0;
        if (el.searchResultItem) {
          let searchResultItem = JSON.parse(el.searchResultItem);
          total = searchResultItem.Total;
        }

        let obj = this.getDisplayInfo(el.searchCode);

        if (obj) {
          let typeItem = {
            searchCode: el.searchCode,
            displayName: obj.displayName,
            displayType: obj.displayType,
            order: obj.order,
            resultNum: obj.resultNum,
            typepageSize: obj.typepageSize,
            count: total,
            labels: obj.displayName,
          };

          this.allCount += total;
          this.typeItems.push(typeItem);
        }
      },
      /**
       * @description: 展示更多
       * @param {}
       * @return void
       */
      showMore(searchCode, count) {
        this.parameter.QueryKeyword = this.select;
        this.showMoreSearchCode = searchCode;
        this.parameter.SearchCodeArray = [this.showMoreSearchCode];
        let obj = this.getDisplayInfo(searchCode);
        if (obj) {
          this.parameter.PageSize = obj.typepageSize;
        }
        this.parameter.PageNo = count / this.parameter.PageSize + 1;
        this.getMoreData(this.parameter);
      },
      /**
       * @description: 展示更多,获取more数据
       * @param {obj} parameter
       * @return void
       */
      getMoreData(parameter) {
        parameter.requestURL = this.requestURL
        this.$axios
        .post("/api/PostJObjectResult",parameter).then((res) => {
          let items = res.data.items;
          if (items && items.length > 0) {
            items.forEach((el) => {
              el.searchCode = el.searchCode || el.name;
              //单独处理每次都返回的：searchCodeAutoComplete 数据
              if (el.searchCode == this.searchCodeAutoComplete) {
                return;
              }

              if (el.searchResultItem) {
                let searchResultItem = JSON.parse(el.searchResultItem);
                let resultList = searchResultItem.ResultList;

                if (el.searchCode == this.showMoreSearchCode) {
                  this.resultItems.forEach((item) => {
                    if (item.searchCode == this.showMoreSearchCode) {
                      item.data = item.data.concat(resultList);
                    }
                  });
                }
              }
            });
          }
        });
      },
      /**
       * @description: 根据filter条件，获取result数据
       * @param {}
       * @return void
       */
      getResultData(parameter) {
        parameter.requestURL = this.requestURL
        this.$axios
        .post("/api/PostJObjectResult", parameter).then((res) => {
          let items = res.data.items;

          this.resultItems = [];
          this.filterItemsBox = [];
          this.allCount = 0;
          this.typeItems = [];

          if (items && items.length > 0) {
            items.forEach((el) => {
              el.searchCode = el.searchCode || el.name;
              //单独处理每次都返回的：searchCodeAutoComplete 数据
              if (el.searchCode == this.searchCodeAutoComplete) {
                return;
              }

              this.getType(el);

              if (el.searchResultItem) {
                let searchResultItem = JSON.parse(el.searchResultItem);
                let filterList = searchResultItem.StatisticResult ?
                  searchResultItem.StatisticResult : [];

                let resultList = searchResultItem.ResultList;
                let total = searchResultItem.Total;

                if (filterList && filterList.length > 0) {
                  this.getNewFilter(filterList);
                }

                this.getResult(el, resultList, total);
              }
            });
          }

          //替换成最新filter：将filterItemsBox里的data赋值给filterItems
          this.filterItemsBox.forEach((box) => {
            this.filterItems.forEach((itemEl) => {
              if (itemEl.DisplayName == box.DisplayName) {
                itemEl.data = box.data;

                if (itemEl.DropDownTypeName == "Simpledropdown") {
                  itemEl.lessData = itemEl.data.filter((el, index) => {
                    return index < 10;
                  });
                }
              }
            });
          });

          this.isFlag = true;

          this.addAllType();

          //根据order进行排序
          this.typeItems = this.typeItems.sort(this.compare("order"));
          this.resultItems = this.resultItems.sort(this.compare("order"));
        });
      },
      /**
       * 获取url中携带参数
       * @param {}
       * @return {void}
       */
      getUrlParam: function (name) {
        let href = window.top.location.href
        let regexp = new RegExp('[?&]' + name + '=([^&#]*)', 'i')
        let qString = regexp.exec(href)
        return qString ? qString[1] : ""
      },
      /**
       * @description: 获取search接口数据
       * @param {}
       * @return void
       */
      getData() {
        let queryKey = Base64.decode(decodeURIComponent(this.getUrlParam("q")));
        let typeKey = Base64.decode(decodeURIComponent(this.getUrlParam("t")));
  
        queryKey = queryKey.trim();
        typeKey = typeKey.trim();

        if (queryKey == "undefined" || queryKey == "null") {
          queryKey = "";
        }

        if (typeKey == "undefined" || typeKey == "null") {
          typeKey = "";
        }

        this.select = queryKey;
        this.parameter.QueryKeyword = this.select;
        this.currentSearchCode = typeKey;

        this.parameter.SearchCodeArray = [typeKey];

        if (this.currentSearchCode) {
          let obj = this.getDisplayInfo(this.currentSearchCode);
          if (obj) {
            this.parameter.PageSize = obj.typepageSize;
          }
        }

        this.parameter.requestURL = this.requestURL

        this.$axios
        .post("/api/PostJObjectResult", this.parameter).then((res) => {
          let items = res.data.items;
          this.searchCodeAutoComplete = res.data.autoCompleteSearchName;

          if (items && items.length > 0) {
            items.forEach((el) => {
              el.searchCode = el.searchCode || el.name;
              //单独处理每次都返回的：searchCodeAutoComplete 数据
              if (el.searchCode == this.searchCodeAutoComplete) {
                return;
              }

              this.getType(el);

              if (el.searchResultItem) {
                //获取 每个searchCode对应的searchResultItem 数据对象【Filter/Result】
                let searchResultItem = JSON.parse(el.searchResultItem);
                let filterList = searchResultItem.StatisticResult ?
                  searchResultItem.StatisticResult : [];
                let resultList = searchResultItem.ResultList;
                let total = searchResultItem.Total;
                this.getFilter(filterList);
                this.getResult(el, resultList, total);
              }
            });

            this.addAllType();

            //根据order进行排序
            this.typeItems = this.typeItems.sort(this.compare("order"));
            this.resultItems = this.resultItems.sort(this.compare("order"));

            this.currentTypeToTag();
          }
        });
      },
    },
    mounted() {
      // this.schema.AppSearchId = "6006a0ea05775803a44f159c";
      // this.schema.typeList = [
      //   {
      //     name: "document",
      //     displayName: "Document",
      //     displayType: "Documents",
      //     order: 0,
      //     sizeInAll: 2,
      //     sizeInNonAll: 3,
      //   },
      //   {
      //     name: "defect",
      //     displayName: "People",
      //     displayType: "People",
      //     order: 0,
      //     sizeInAll: 4,
      //     sizeInNonAll: 2,
      //   },
      //   {
      //     name: "apps",
      //     displayName: "Apps",
      //     displayType: "Apps",
      //     order: 0,
      //     sizeInAll: 3,
      //     sizeInNonAll: 2,
      //   },
      // ];

      this.getData();
    },
  };

</script>

<style lang="scss">
  .vcSearch {
    position: relative;
    height: calc(100vh - 40px);
  }

  .vcSearch {

    .v-list--dense .v-list-item .v-list-item__subtitle,
    .v-list--dense .v-list-item .v-list-item__title,
    .v-list-item--dense .v-list-item__subtitle,
    .v-list-item--dense .v-list-item__title {
      font-size: 14px;
    }

    .v-treeview-node__root {
      min-height: 32px;
      margin-bottom: 8px;
      align-items: flex-start;
      padding-right: 15px;

      .v-treeview-node__content {
        align-items: flex-start;

        .v-treeview-node__label {
          white-space: pre-wrap;
        }

        .v-treeview-node__append {
          text-align: right;
        }
      }

    }

  }

  .vcSearch .treeview-wrap .v-treeview-node__label,
  .vcSearch .treeview-wrap .v-treeview-node__append span {
    font-size: 14px;
  }

  .v-menu__content {
    // background: #fff;
  }

  .vcSearch .sidebar-toggle {
    position: absolute;
    top: 64px;
    left: 0;
    z-index: 2;
    width: 300px;
    height: 49px;
    line-height: 48px;
    padding-left: 12px;
    padding-top: 0 !important;
    border-bottom: 1px solid rgb(226, 226, 227);
    border-right: 1px solid rgb(226, 226, 227);
  }

  .vcSearch .sidebar-toggle .text {
    display: inline-block;
    width: 87%;
  }

  .vcSearch .sidebar-toggle.active {
    width: 120px;
  }

  .vcSearch .sidebar-toggle.active .text {
    width: 56%;
  }

  .vcSearch .filter-left-wrap {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    overflow-y: auto;
    margin-top: 46px;
    z-index: 2;
    width: 300px;
    border-right: 1px solid rgb(226, 226, 227);
  }

  .vcSearch .filter-left-wrap::-webkit-scrollbar,
  .vcSearch .only-wrap::-webkit-scrollbar {
    width: 6px;
    height: 6px !important;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .vcSearch .filter-left-wrap::-webkit-scrollbar-thumb,
  .vcSearch .only-wrap::-webkit-scrollbar-thumb {
    border-radius: 10px;
    /* -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  }

  .vcSearch .filter-left-wrap::-webkit-scrollbar-track,
  .vcSearch .only-wrap::-webkit-scrollbar-track {
    /* -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
    border-radius: 0;
  }

  .vcSearch .filter-right-wrap {
    position: absolute;
    top: 64px;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: auto;
    z-index: 1;
  }

  .vcSearch .only-wrap {
    padding-right: 8px;
    padding-left: 8px;
    min-height: 49px;
    max-height: 125px;
    overflow-y: auto;
    border-bottom: 1px solid rgb(226, 226, 227);
  }

  .vcSearch .apps-wrap .v-list--dense .v-list-item,
  .v-list-item--dense {
    min-height: 20px;
  }

  .vcSearch .apps-wrap .v-list-item {
    height: 30px;
  }

  .vcSearch .title-tip {
    font-size: 14px;
  }

  .resultBar-wrap {
    margin-left: 20px;
  }

  @media screen and (max-width: 600px) {
    .resultBar-wrap {
      margin: 0 10px;
    }

    .resultBar-wrap .card-wrap {
      flex: none;
      max-width: 100%;
    }
  }

  .vcSearch .documents-wrap {
    width: 100%;
  }

  .vcSearch .documents-wrap .high-wrap {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .vcSearch .documents-wrap .high-wrap img {
    vertical-align: middle;
    margin-right: 4px;
    width: 24px;
    height: 18px;
  }
  .vcSearch .people-wrap .card-wrap {
    border: 1px solid #c5c5c6;
  }

  .vcSearch .people-wrap .card-wrap .image {
    width: 78px;
    height: 78px;
    background-position: top center;
    background-repeat: no-repeat;
    background-size: cover;
    background-color: #c5c5c6;
    padding-bottom: 100%;
  }

  .vcSearch .more-filter {
    font-size: 14px;
    cursor: pointer;
    margin-left: 40px;
    height: 32px;
    display: block;
    font-weight: 500;
  }

  .vcSearch .search-type {
    font-size: 14px !important;
  }

</style>
