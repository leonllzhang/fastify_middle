<template>
  <div v-if="!(isAnonymousUser && (schema.model == 'RestrictedReader' || schema.model == 'RestrictedEditor'))"
    id="peoplepicker-box" :class="['layout', 'peoplepicker-box', classes, { 'py-2': pageMode == 'preview','dark-people-picker': $vuetify.theme.dark}]"
    :style="schema.style">
    <v-layout>
      <div v-show="!schema.disableLabel" class="vc-label"
        :class="{ horizontal: isHorizontal,required: isEdit ? schema.required : '' }">
        <span :style="computeStyle('Label', schema)">{{ label }}</span>
        <v-tooltip idright :disabled="!schema.tooltip">
          <template v-slot:activator="{ on }">
            <v-icon v-show="schema.tooltip" v-on="on" color="disabled">mdi-message-alert</v-icon>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
      </div>
      <div class="flex">
        <div class="input-box" :class="{ 'preview-text': !isEdit, 'vc-peoplepicker-custom-style': (schema.revampSchema && schema.revampSchema[0].members) && (isEdit || (!isEdit && schema.customPreviewStyle))}"
          :style="[{ 'border-width': pageMode == 'preview' && !schema.customPreviewStyle ? '0px !important' : '' },
          (isEdit || (!isEdit && schema.customPreviewStyle)) ? returnComputeStyle : '']">
          <div class="chip-box">
            <!-- 显示已经选择的 -->
            <v-chip class="ma-1 people-content" v-for="showItem in transferVal" tabindex="0" :aria-label="showItem.UserName"
              :key="showItem.StaffCode" :close-icon="isCloseIcon" close color="primary" outlined :disabled="isDisabled"
              @click:close="close(showItem)">
              <span :class="{
                line: showItem.ActiveFlag && showItem.ActiveFlag == 'False',
              }">{{ showItem.UserName }}</span>
            </v-chip>
            <v-flex v-show="!isDisabled" style="flex:1">
              <input class="auto-input" tabindex="0" :aria-label="label + $dm_arialabel(rules, value)" :aria-required="schema.required"
                ref="inputEl" type="text" @keydown.delete="inputDel" @input="input" @blur="validate"
                @keydown.enter.prevent v-model="inputVal" :disabled="isDisabled" style="min-height: 28px;"/>
              <!-- 下拉组件 -->
              <div class="mx-auto" max-width="400" v-show="isOpen" ref="cardEl">
                <span class="arrow"></span>
                <v-list flat class="list-box">
                  <v-list-item-group color="indigo">
                    <v-list-item v-show="isLoad">
                      <i class="mdi mdi-reload"></i>&nbsp;Loading
                    </v-list-item>
                    <v-list-item tabindex="0" :aria-label="item.UserName" role="option" @keydown.enter.prevent
                      @submit.native.prevent v-for="item in Newitems" :key="item.StaffCode" class="list-item"
                      @click="getList(item)" v-html="item.FirstLineDesc"></v-list-item>
                  </v-list-item-group>
                  <v-list-item v-show="isNewItems">
                    {{ $t("peoplepicker-base.inputSearchTip") }}
                  </v-list-item>
                </v-list>
              </div>
            </v-flex>
            <v-btn v-show="pageMode != 'preview'" class="icon-box" text
              :class="{ iconError: isDisabled, iconActive: !isDisabled }" @click="openDialog">
              <v-icon :color="$vuetify.theme.dark ? '' :'pwcDarkGrey'" size="28">pwc-icon pwc-partnership</v-icon>
            </v-btn>
          </div>
        </div>
        <v-text-field v-if="schema.required" style="padding-top:2px;padding-left:12px;" class="validationModule" height="0px" v-model="value" :rules="rules">
        </v-text-field>
      </div>
    </v-layout>
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="primary" primary-title>{{ title }}</v-card-title>
        <v-container>
          <v-layout>
            <v-text-field class="rounded-0" flat outlined v-model="keyWord" solo :label="inputBoxPrompt"
              append-icon="mdi mdi-magnify" @keyup.enter="search" @click:append="search"></v-text-field>
          </v-layout>
          <!-- 弹窗里的数据 -->
          <v-layout class="detail-wrap">
            <div ref="list" class="detail-list-box" v-on="inputListeners">
              <v-list three-line>
                <template v-for="(item, index) in filterData">
                  <v-list-item :key="index" @click="toggleItem(item, index)">
                    <v-list-item-avatar>
                      <img v-if="item.Type == 1" :src="userAvatar(item)" />
                      <img v-else-if="item.Type == 2" :src="
                        $store.getters.cdnHostAndVersionPath +
                        '/static/images/group.svg'
                      " />
                      <img v-else :src="userAvatar(item)" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title style="line-height: 1.4" v-html="item.FirstLineDesc || item.UserName">
                      </v-list-item-title>
                      <v-list-item-subtitle v-html="item.SecondLineDesc || item.Phone"></v-list-item-subtitle>
                      <v-list-item-subtitle v-html="item.ThirdLineDesc || item.Email"></v-list-item-subtitle>
                    </v-list-item-content>

                    <v-icon color="primary" v-show="item.isSelected" class="mdi mdi-check-circle"
                      style="font-size: 34px;"></v-icon>
                  </v-list-item>
                  <v-divider :key="item.id"></v-divider>
                </template>

                <v-list-item v-show="this.filterData.length == 0 && trueData">
                  <span style="margin: 70px auto; font-size: 20px">
                    {{ noUserMsg }}
                  </span>
                </v-list-item>
              </v-list>
            </div>
          </v-layout>
        </v-container>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="primary" tile @click="setVisibility(`selected`)" v-show="visibility == `all`">
            {{ $t("peoplepicker-base.selected") }}</v-btn>
          <v-btn color="primary" class="ml-0" tile @click="setVisibility(`all`)" v-show="visibility == `selected`">
            {{ $t("peoplepicker-base.backtosearch") }}</v-btn>
          <v-spacer></v-spacer>

          <v-btn color="primary" tile outlined class="close-btn mr-1" @click="cancelSel">
            {{ $t("peoplepicker-base.close") }}
          </v-btn>
          <v-badge v-show="num" class="align-self-center">
            <template v-slot:badge>
              <span>{{ num }}</span>
            </template>
          </v-badge>
          <v-btn color="primary" tile class="save-btn" @click="sure">
            {{ $t("peoplepicker-base.ok") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  mapActions,
  mapMutations
} from "vuex";
import base from "../utils/form-base";
import appInfo from "../../utils/appInfo";
import schemaBase from "../utils/schema-base";
import cloneDeep from "lodash/cloneDeep";

let app = appInfo();

  export default {
    mixins: [base],
    props: {
      displayCurrentPeopleByDefault: Boolean,
    },
    data() {
      return {
        imgSrc: "",
        index: 0,
        size: 50,//update the size to 50 for initial count
        isLoad: false, //控制input框下方的下拉组件是否展示loading效果
        top: "68px",
        keyWord: "", //弹窗里的search--input,搜素关键字
        truekeyWord: "", //click 回车或click search icon
        dialog: false,
        isNewItems: false, //input 下拉搜索时，是否有新的数据
        inputVal: "", //input model
        isOpen: false, //控制input实时搜索时下拉组件是否展开
        visibility: "all",
        loadMore: true, //当load请求成功之后，才可以发送第二个
        Newitems: [], //下拉组件实时显示内容
        data: [], //保存正常获取到的数据
        selectedFakeData: [], //假选数据，还没有点击ok
        searchData: [], //保存弹框内search到的数据
        apiUrl: "/api/Picker",
        isLoadData: true, //判断用户是否点击了search btn       
        transferVal: [], //真正的value
        trueData: false, //控制弹窗内部，暂无数据的提示 是否展示
        isControl: false, //控制picker是水平展示还是垂直展示
        isOpenDialog: false,
        callbackFn: null,
        hasCallBackFn: false,
        selectedType: "userId", //给picker赋值时 设置赋值类型
        sliceSelectedData: [], //对已勾选数据做下拉下载，数据源为：selectedFakeData
        getCurrentUserGroupUrl: "api/vp/GetGroupsByOrgCodeStaffCodeWithPaging"
      };
    },
    watch: {
      postEndVal(val, oldVal) {     
        this.$set(this.model, this.schema.model, val);
        //回调不是一个好的方式，我们还是推荐使用数据驱动，而不是事件驱动的方式。
        if (this.hasCallBackFn) {
          this.callbackFn();
        }
      },
      value: {
        handler(val, oldVal) {
          if (
            val &&
            Object.prototype.toString.call(val) == "[object Array]"
          ) {
            if (val && val.length > 0) {
              let valIndex = val[0];
              if (typeof valIndex == "string") {
                this.selectedType = "searchUserDataByApi"; // support userid, staffcode, email, groupName(@groupName)
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
      getRelationskey() {
        //DB中的数据结构是整合User和Group的
        //save真正保存的值
        let relationKeys = undefined;
        switch (this.schema.dataSourceType.toLowerCase()) {
          case 'user': 
            relationKeys = this.schema.storageFields ? this.schema.storageFields.join(",") : "StaffCode,UserName,Email,OrganizationCode,UserID,Phone";
            break;
          case 'group':
            let defaultKeys = ['StaffCode','UserName','Email','OrganizationCode','UserID','Phone'];
            //Group 显示为Name,但是实际上的存储跟User的默认属性一致
            if (this.schema.groupStorageFields && this.schema.groupStorageFields.hasOwnProperty('Name')) {
              delete this.schema.groupStorageFields['Name'];
              relationKeys = defaultKeys.concat(this.schema.groupStorageFields);
            } else {
              relationKeys = defaultKeys;
            }
            relationKeys = relationKeys.join(',')

            break;
          default:
            //type为All,合并用户属性和组的属性
            let userKeys = this.schema.storageFields ? this.schema.storageFields : ["StaffCode", "UserName", "Email", "OrganizationCode", "UserID", "Phone"];
            //Group 显示为Name,但是实际上的存储跟User的默认属性一致
            if (this.schema.groupStorageFields && this.schema.groupStorageFields.hasOwnProperty('Name')) {
              delete this.schema.groupStorageFields['Name'];
              relationKeys = userKeys.concat(this.schema.groupStorageFields);
            } else {
              relationKeys = userKeys;
            }
            relationKeys = relationKeys.join(',')
            break;
        }

        return relationKeys;
      },
      isAnonymousUser() {
        let userInfo = this.$store.state.userInfo
        if (
          userInfo &&
          userInfo.roles.length == 1 &&
          userInfo.roles[0] == "AnonymousRole"
        ) {
          return true;
        } else {
          return false;
        }
      },
      isCloseIcon() {
        if (this.options.pageMode) {
          //embebed or pop
          if (this.options.pageMode.toLowerCase() == "preview") {
            return ""
          } else {
            return "pwc-icon pwc-close-outline"
          }
        } else {
          if (this.$route.name.toLowerCase() == "preview") {
            return ""
          } else {
            return "pwc-icon pwc-close-outline"
          }
        }
      },
      isDisabled() {
        if (this.pageMode == "preview") {
          return true
        }
        return this.schema.disabled != undefined ?
          this.schema.disabled :
          !this.isEdit;
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
    inputBoxPrompt() {
      return this.$te(this.localeKey + ".inputBoxPrompt") &&
        this.$t(this.localeKey + ".inputBoxPrompt") ?
        this.$t(this.localeKey + ".inputBoxPrompt") :
        this.schema.inputBoxPlaceHolder ||
        this.$t("peoplepicker-base.inputBoxPrompt");
    },
    postEndVal() {
      //传给后台的字段
      let endArr = this.getRelationskey.split(",");
      
      let arr = [];
      arr.splice(
        0,
        arr.length,
        ...this.transferVal.map((o) => {
          var r = {};
          endArr.forEach((s) => {
            r[s] = (o[s]) ? o[s] : (o.UserInfos && o.UserInfos[s]) ? o.UserInfos[s] : null;
          });
          return r;
        })
      );
      return arr;
    },
    title() {
      return this.$te(this.localeKey + ".title") &&
        this.$t(this.localeKey + ".title") ?
        this.$t(this.localeKey + ".title") :
        this.schema.title || this.$t("peoplepicker-base.title");
    },
    maxSelectCount() {
      let schema = this.schema;
      return schema.maxSelectCount || "";
    },
    inputListeners() {
      var vm = this;
      return Object.assign({}, this.$listeners, {
        scroll: function (event) {
          let listEl = vm.$refs.list;
          //获取或设置一个元素的内容垂直滚动的像素数
          let scrollTop = listEl.scrollTop;
          //获得元素盒子的高度[height+(包含padding，不包括margin和border)]
          let clientHeight = listEl.clientHeight;
          //获得文档内容的真实高度
          let scrollHeight = listEl.scrollHeight;
          //距离底部100时，开始滚动
          if (scrollTop + 100 >= scrollHeight - clientHeight) {
            if (vm.loadMore) {

              if (vm.visibility == "all") {
                vm.loadData();
              } else {

                if (vm.sliceSelectedData.length < vm.selectedFakeData.length)
                  vm.loadSelectedData()
              }
            }
          }
        },
      });
    },
    num() {
      return this.selectedFakeData.length;
    },
    noUserMsg() {
      if (this.visibility == "all") {
        return this.$t("peoplepicker-base.dialogSearchTip");
      }
      if (this.visibility == "selected") {
        return this.$t("peoplepicker-base.dialogSelectedTip");
      }
    },
    filterData() {
      if (this.visibility == "all") {
        if (this.searchData.length) {
          return this.searchData;
        } else {
          return this.data;
        }
      } else if (this.visibility == "selected") {
        return this.sliceSelectedData;
      }
    },
    loading() {
      return this.schema.loading;
    },
  },
  methods: {
    setVisibility(type) {
      this.visibility = type
      this.setListElScrollTop()
    },
    setListElScrollTop() {
      let listEl = this.$refs.list
      listEl.scrollTop = 0
    },
    userAvatar(item) {
      if (item && item.Email && item.Email == this.$store.state.userInfo.email) {
        return this.getAvatar(this.$store.state.userInfo.avatar);
      } else {
        return (
          this.to(`/api/GetUserAvarta?userid=${item.UserID}`) || this.$store.getters.cdnHostAndVersionPath +
          "/static/images/user.svg"
        );
      }
    },
    /**
     * @description:通过邮箱获取到user对应的staffCode值
     * @param {Array} 邮箱数组
     * @return {Array} staffCode数组
     */
    getStaffCodes(emails) {
      let data = {
        SourceData: emails
      };
      this.$store.commit("DISABLE_LOADING", true);
      this.$axios.post("/api/queryStaffCodeWithEmail", data).then((res) => {
        this.$store.commit("DISABLE_LOADING", true);
        let resData = res.data.Data;
        let staffCodes = [];

        if (resData && resData.length > 0) {
          resData.forEach(el => {
            if (el.StatusMsg == "Success") {
              staffCodes.push(el.TargetData);
            }
          });
        }

        if (staffCodes && staffCodes.length > 0) {
          this.setValue(staffCodes);
        }
      });
    },
    changeColor(resultsList) {
      //对搜索关键字进行高亮显示
      resultsList.map((item, index) => {
        this.$set(item, "trueFirstLineDesc", item.FirstLineDesc);
        if (this.inputVal && this.inputVal.length > 0) {
          // 匹配关键字正则
          let reg = new RegExp(this.inputVal.toLowerCase(), "g");
          // 高亮替换v-html值
          let replaceString =
            '<span style="color:#ee5126">' + this.inputVal + "</span>";

          let str = item.FirstLineDesc.toLowerCase().replace(
            reg,
            replaceString
          );

          resultsList[index].FirstLineDesc = str;
        }
      });
      this.Newitems = resultsList;
    },
    inputDel() {
      if (this.inputVal == "") {
        this.transferVal.pop();
      }
    },
    showDefaultData() {
      if (this.schema.displayCurrentPeopleByDefault) {
        let currentUser = this.$store.state.userInfo;
        let avatarUrl = this.getAvatar(currentUser.avatar);

        let defaultVal = {
          Type: 1,
          StaffCode: currentUser.staffCode, //"CN507453"
          UserName: currentUser.userName,
          UserID: currentUser.userID,
          AvatarUrl: avatarUrl,
          Email: currentUser.email,
          Phone: currentUser.phone,
          FirstLineDesc: currentUser.userName,
          SecondLineDesc: currentUser.phone,
          ThirdLineDesc: currentUser.email,
        };

        //判断在已选数据里是否已经存在当前默认值--不存在，在添加
        let arrCodes = [];
        this.transferVal.forEach((o) => {
          arrCodes.push(o.StaffCode);
        });

          if (arrCodes.indexOf(defaultVal.StaffCode) == -1) {
            this.transferVal.push(defaultVal);
          }
        }
        //default group data: groups including current user
        if (this.schema.displayGroupIncludingCurrentPeople) {
          let currentUser = this.$store.state.userInfo;

          //get current user group
          let parameter = {
            organizationCode: app.tenantId,
            StaffCode: currentUser.staffCode,
            WithParentGroups: false,
            attribute1: this.schema.attribute1 || "",
            attribute2: this.schema.attribute2 || "",
            attribute3: this.schema.attribute3 || ""
          };
         
          this.$axios.post(this.getCurrentUserGroupUrl, parameter).then((groupData) => {
            groupData.data.Data.Groups.forEach((g) => {
              this.transferVal.push({
                Type: 2,
                StaffCode: `@${g.GroupName}`, 
                UserName: g.GroupName,
                UserID: g.GroupID                
              });
            });
          });
        }
      },
      getAvatar(Avatar) {
        if (Avatar && Avatar != null) {
          return "data:image/png;base64," + Avatar;
        } else {
          return (
            this.$store.getters.cdnHostAndVersionPath + "/static/images/user.svg"
          );
        }
      },
      onchange() {
        if (this.schema.onChange) {
          this.eval(...this.schema.onChange);
        }
      },
      initShowItems() {
        //实时勾选已选数据
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

      //实时更新selectedFakeData里的数据值
      if (item.isSelected) {
        this.selectedFakeData.push(item);
        this.sliceSelectedData.push(item)
      } else {
        this.selectedFakeData.map((el, index) => {
          if (el.UserID == item.UserID) {
            this.selectedFakeData.splice(index, 1);
          }
        });

        this.sliceSelectedData.map((el, index) => {
          if (el.UserID == item.UserID) {
            this.sliceSelectedData.splice(index, 1);
          }
        });
      }

    },
    openDialog() {
      if (this.isDisabled) {
        return;
      }

      this.selectedFakeData = [].concat(this.transferVal) || [];

      this.sliceSelectedData = this.selectedFakeData.length <= this.size ? [].concat(this.selectedFakeData) : this
        .selectedFakeData.slice(0, this.size)

      this.getData();

      this.isOpen = false;
      this.dialog = true;
      this.keyWord = "";
      this.inputVal = "";
      this.isLoadData = false;
      this.searchData = [];

      if (this.transferVal && this.transferVal.length > 0) {
        this.topData(this.transferVal);
        this.visibility = "selected"
      } else {
        this.visibility = "all"
      }

    },
    cancelSel() {
      this.dialog = false;

      this.data.forEach((item) => {
        item.isSelected = false;
        this.transferVal.forEach((showItem) => {
          if (item.UserID == showItem.UserID) {
            item.isSelected = true;
          }
        });
      });

      this.searchData = [];
      this.selectedFakeData = [];
    },
    topData(obj) {
      //置顶已选中元素,*只有前5条请求到的数据才置顶~
      let topArr = [];
      obj.forEach((showItem) => {
        showItem.isSelected = true;
        this.data.forEach((item, index) => {
          if (item.UserID == showItem.UserID) {
            this.$set(item, "isSelected", true);
            topArr.push(item);
            this.data.splice(index, 1);
          } else {
            this.$set(item, "isSelected", false);
          }
        });
      });
      this.data = [].concat(topArr).concat(this.data);
    },
    getParameter(queryContent, selectedDatas, IgnoreStaffs) {
      let currentUserData = this.$store.state.userInfo;

        var parameter = {
          pickertype: "people", //传递给apiController.cs的参数类型，区分peoplePicer和dataPicker
          Method: this.schema.dataSourceType || "all", //获取数据类型：all,staff,group
          selectedDatas: selectedDatas || [],
          selectedType: this.selectedType,
          IgnoreStaffs: IgnoreStaffs || [],
          queryContent: queryContent || "",
          index: this.index,
          size: this.size,
          organizationCode: app.tenantId,
          appCode: app.appCode,
          range: [],
          displayGroupIncludingCurrentPeople: this.schema.displayGroupIncludingCurrentPeople || false,
          GroupNameIncludeSubGroups: this.schema.GroupNameIncludeSubGroups || false,
          isGetRootGroup: this.schema.isGetRootGroup || false,
          searchByGroup: this.schema.enableSearchByGroup || false,
          searchByRole: this.schema.enableSearchByRole || false,
          groupName: this.schema.groupName,
          roleName: this.schema.roleName,
          attribute1: this.schema.attribute1 || "",
          attribute2: this.schema.attribute2 || "",
          attribute3: this.schema.attribute3 || "",
          currentStaffCode: currentUserData.staffCode,
          firstLineDesc: this.schema.firstLineDescriptionConfig || [],
          firstLineSeparator: this.schema.firstLineSeparator || " ",
          secondLineDesc: this.schema.secondLineDescriptionConfig || [],
          secondLineSeparator: this.schema.secondLineSeparator || " ",
          thirdLineDesc: this.schema.thirdLineDescriptionConfig || [],
          thirdLineSeparator: this.schema.thirdLineSeparator || " ",
          additionalSearchKey: this.schema.CustomSearchKey || [],
          withExtendData: this.schema.enableExtendMetaData || false,
          relationskey: this.getRelationskey, //用户需要真正保存到后台的数据，这个值从design里传过来
          showTermUser: this.schema.displayDimission || false,
          filters: this.schema.queryPara ? [this.schema.queryPara] : [],
        };
        return parameter;
      },
      getData() {
        this.trueData = false;
        this.index = 1;
        this.$store.commit("DISABLE_LOADING", true);
        let parameter = this.getParameter();
        this.$axios.post(this.apiUrl, parameter).then((res) => {
          this.$store.commit("DISABLE_LOADING", true);
          this.trueData = true;
          this.initSelMarkData(res.data.Data);
        });
      },
      initSelMarkSearchData(arrData) {
        //对获取的数据，如果在 selectedFakeData：已选+假选数据，里则对其进行对勾标记
        //对获取的数据对象添加isSelected属性
        this.searchData = arrData.map((o) => {
          o.isSelected = false;
          return o;
        });

      this.getFakesUserID(this.searchData);
    },
    initSelMarkData(arrData) {
      //将获取到的数据，完全覆盖给transferVal
      // if (arrData && arrData.length > 0) {
      //   this.data = arrData.map((o) => {
      //     o.isSelected = false;
      //     if (this.transferVal && this.transferVal.length) {
      //       this.transferVal.forEach((item, index) => {
      //         if (item.UserID == o.UserID) {
      //           this.transferVal[index] = o;
      //         }
      //       });
      //     }
      //     return o;
      //   });
      // }

      if (arrData && arrData.length > 0) {
        this.data = arrData.map((o) => {
          o.isSelected = false;
          return o;
        });
      }

      this.getFakesUserID(this.data); //获取所有勾选数据：已选+假选---进行勾选标记
    },
    inputFocus() {
      this.$refs.inputEl.focus();
    },
    getFakesUserID(data) {
      //selectedFakeData---记录已选数据 + 假选数据，还没有点击OK
      //返回弹窗内所有已选的数据的code值，包括还没有点击OK的
      let selectedFakesStaffCode = [];
      if (this.selectedFakeData.length) {
        this.selectedFakeData.forEach((item) => {
          selectedFakesStaffCode.push(item.UserID);
        });
      }

      selectedFakesStaffCode = [...new Set(selectedFakesStaffCode)]

      if (selectedFakesStaffCode.length > 0) {
        data.forEach((item) => {
          if (selectedFakesStaffCode.indexOf(item.UserID) != -1) {
            this.$set(item, "isSelected", true);
          } else {
            this.$set(item, "isSelected", false);
          }
        });
      }

    },
    search() {
      this.trueData = false;
      this.index = 1;
      this.isLoadData = true;
      this.truekeyWord = this.keyWord;

      this.$store.commit("DISABLE_LOADING", true);
      let parameter = this.getParameter(this.keyWord);

      this.setListElScrollTop()

      this.$axios.post(this.apiUrl, parameter).then((res) => {
        this.$store.commit("DISABLE_LOADING", false);
        this.trueData = true;
        let getData = res.data.Data;

        if (getData && getData.length) {
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
        if (arr[i].UserID == item.UserID) {
          return;
        }
      }

      item.isSelected = true;
      this.transferVal.push(item);
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

      let inputEl = this.$refs.inputEl; //input框
      let cardEl = this.$refs.cardEl; //下拉组件

      this.isLoad = this.Newitems.length == 0 ? true : false;
      this.clearTimer();

      let _this = this;
      if (this.inputVal != "") {
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
      let data = [];
      this.Newitems = [];
      this.$store.commit("DISABLE_LOADING", true);
      //为了将搜索去重--将已展示的数据给接口，接口此时不返回
      let IgnoreStaffs = [];
      if (this.transferVal.length) {
        this.transferVal.forEach((item) => {
          IgnoreStaffs.push(item.StaffCode);
        });
      }
      let parameter = this.getParameter(this.inputVal, [], IgnoreStaffs);

      this.$axios.post(this.apiUrl, parameter).then((res) => {
        this.isLoad = false;
        this.$store.commit("DISABLE_LOADING", false);

        let getData = res.data.Data;

        this.changeColor(getData);
        if (getData.length) {
          this.isNewItems = false;

          getData.forEach((o) => this.$set(o, "isSelected", true));

          //只有一条数据时，直接显示
          if (getData.length == 1) {
            //后台添加去重逻辑，这样方便实时搜索，否则感觉像bug
            //添加前端去重逻辑
            let user = res.data.Data[0];
            if (this.transferVal && this.transferVal.length > 0) {
              let userIds = this.transferVal.map((e) => {
                return e.UserID;
              });

              if (userIds.indexOf(user.UserID) == -1) {
                this.transferVal.push(user);
              }
            } else {
              this.transferVal.push(user);
            }

            this.inputVal = "";
            this.isOpen = false;
            return;
          }
        } else {
          this.isNewItems = true;
        }
      });
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    },
    close(showItem) {
      //input框---tooltip的关闭btn
      this.$set(showItem, "isSelected", false);

      this.transferVal.forEach((item, index) => {
        if (showItem.UserID == item.UserID) {
          this.transferVal.splice(index, 1);
          return;
        }
      });
    },
    loadData() {
      this.trueData = false;
      this.index += 1;
      this.loadMore = false;
      let data = [];
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

        this.loadMore = true;
      });
    },
    loadSelectedData() {
      this.loadMore = false

      let len = this.sliceSelectedData.length
      let size = len + this.size
      let fakeLen = this.selectedFakeData.length
      size = fakeLen > size ? size : fakeLen
      this.sliceSelectedData = this.sliceSelectedData.concat(this.selectedFakeData.slice(len, size))

      this.loadMore = true
    },
    setValue(values) {
      if (values && values.length > 0) {
        let val = values[0];
        if (typeof val != "string") return;
      } else {
        return;
      }

      values = [...new Set(values)];

        //对外暴露方法：可直接设置已选数据
        // let selectedDatas = [
        // "##210119045222775","##210202095827551","##210202095807672"
        // ];
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
        this.selectedType = "";
        if (this.isOpenDialog) {
          this.openDialog();
          this.isOpenDialog = false;
        }
      });
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

          if (elEnd && 12 / elEnd < 5) {
            this.isControl = true;
          }
        }
      });
    }
  },
  created() {
    //模拟数据
    // this.transferVal = [
    //   {
    //     Email: "alice@dev.com",
    //     OrganizationCode: "alicej",
    //     Phone: 111,
    //     StaffCode: "##210119045222775",
    //     UserID: "228dabd4-dc1d-4ef7-a0a7-1b4fd94989cc",
    //     UserName: "alice",
    //   },
    // ];

    if (
      this.value &&
      Object.prototype.toString.call(this.value) == "[object Array]" && this.value.length > 0
    ) {
      this.value.forEach((el) => {
        if (el.UserName && el.UserName.length > 0) {
          this.transferVal.push(el);
        }
      });
    }

    if (this.pageMode == "add") {
      //只有在Add模式下，才会展示
      this.showDefaultData();
    }

    if (this.isDisabled) {
      return;
    }

    this.register();

    this.$watch("transferVal", (val, oldVal) => {
      this.onchange();
      this.initShowItems();
      this.validate();
    });

    let currentComponentCode = this.schema.name + this.pageView.toLowerCase()
    this.bus.$on(`toggle_peoplepicker_${currentComponentCode}`,
      (event) => {
        if (event.callbackFn) {
          this.hasCallBackFn = true;
          this.callbackFn = event.callbackFn;
        }
        this.isOpenDialog = false
        if (event.data && event.data.length>0) {
          this.$set(this.model, this.schema.model, event.data);
          //设置值后再弹窗
          this.isOpenDialog = true
        } else {
          //直接弹窗
          this.transferVal = []
          this.openDialog();
        }
      })
  }
};

</script>

<style scoped>
.vc-peoplepicker-custom-style .chip-box > span{
  font-size: var(--c-fontSize);
  line-height: var(--c-lineHeight);
  font-family: var(--c-fontFamily);
  font-weight: var(--c-fontWeight);
  letter-spacing: var(--c-letterSpacing);
  color: var(--c-color);
  border-color: var(--c-color);
}
.peoplepicker-box .input-box.vc-peoplepicker-custom-style {
  border-width: var(--c-borderWidth) !important;
  border-style: var(--c-borderStyle) !important;
  border-color: var(--c-borderColor) !important;
  border-radius: var(--c-borderRadius) !important;
  background: var(--c-background) !important;
  box-shadow: var(--c-shadow) !important;
  background: var(--c-background) !important;
  margin: var(--c-margin) !important;
}

.peoplepicker-box .require-tip {
  font-style: normal;
  font-size: 14px;
  color: red;
  margin-left: 6px;
  vertical-align: middle;
}

.peoplepicker-box .v-subheader {
  padding-right: 10px;
}

.peoplepicker-box .line {
  text-decoration: line-through;
}

.peoplepicker-box .marBot {
  margin-bottom: 10px;
}

.peoplepicker-box {
  position: relative;
}

.peoplepicker-box .label {
  display: inline-block;
  font-size: 14px;
  line-height: 38px;
  /* color: rgba(0, 0, 0, 0.54); */
}

.peoplepicker-box .input-box {
  position: relative;
  min-height: 48px;
  padding: 3px 45px 3px 4px;
  box-shadow: none;
  border: solid 1px rgba(0, 0, 0, 0.42);
  flex: 1 1 auto;
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
  cursor: default;
  background: lightgrey !important;
}

.detail-list-box {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}

.chip-box {
  width: 100%;
  margin-bottom: 0;
  line-height: 0;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
}

.v-btn.icon-box {
  font-size: inherit;
  padding: 0 8px;
  min-width: 40px;
  position: absolute;
  right: 4px;
  margin: 1px;
  top: 4px;
  color: #fff;
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

.v-list-item {
  min-height: 30px !important;
}

.list-item:hover {
  background: #efefef;
  color: #000;
}
.dark-people-picker .list-item:hover {
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
  border-top: 1px solid #efefef !important;
  border-left: 1px solid #efefef !important;
  z-index: 100;
  left: 12px;
  top: -48px;
  transform: rotate(45deg);
}
.dark-people-picker .arrow {
  background: #1e1e1e;

}

.list-box {
  position: absolute !important;
  width: 400px;
  /* background: #fff; */
  z-index: 99;
  top: -40px;
  max-width: 600px;
  overflow-y: auto;
  border: 1px solid #efefef !important;
}
.people-content{
  margin-bottom: 2px !important;
  margin-top: 2px !important;
}


.dark-people-picker .auto-input{
  color: #fff;
}
</style>
