<template>
  <div>
    <v-dialog v-model="delegationDialog" max-width="900px" persistent scrollable>
      <v-card flat :dark="dark" class="preferencesCard" height="714px">
        <v-card-title class="headline card-title primary flex pl-4">
          <div class="white--text">{{$t("delegationuser.Delegationcenter")}}</div>
          <v-spacer></v-spacer>
          <v-btn icon class="white--text close-btn mr-2" @click="closeDelegation">
            <v-icon>pwc-icon pwc-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-tabs v-model="tab" bg-color="primary" class="flex-grow-0">
          <v-tab value="one" style="text-transform: none;">{{$t("delegationuser.Delegation")}}</v-tab>
          <v-tab value="two" style="text-transform: none;">
            {{$t("delegationuser.Assignment")}}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-card-text style="overflow-y: auto;height: 585px;" class="pt-0 delegation-scroll-bar">
              <v-data-table class="delegation-table-wrap" disable-pagination :headers="delegationHeaders"
                :items="delegationDatas" fixed-header hide-default-footer disable-sort>
                <template v-slot:item.startTime="props">
                  <span>
                    {{
                      props.item.startTime
                          | dateformat($store.state.appInfo.appDateFormat)
                    }}
                  </span>
                </template>
                <template v-slot:item.endTime="props">
                  <span>
                    {{
                      props.item.endTime
                          | dateformat($store.state.appInfo.appDateFormat)
                    }}
                  </span>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on}">
                      <v-switch hide-details v-on="on" :disabled="compareTime(item.endTime)" v-model="item.isAction" class="d-inline-flex mt-0"
                        @change="isEnableDelegation(item.id,item.isAction)">
                      </v-switch>
                    </template>
                    <span>{{enableDelTip(item.isAction)}}</span>
                  </v-tooltip>
                  <v-icon @click="delDelegationConfirm(item.id)">
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>

              <v-btn color="primary" class="mt-4" v-show="!isShowDelegationForm" @click="showDelegationForm">
                + {{$t('delegationuser.addNew')}}</v-btn>
              <v-form ref="delegationForm" v-show="isShowDelegationForm">
                <v-card flat>
                  <!-- select assignee && workflow form -->
                  <v-row class="mt-4">
                    <v-col cols="6" class="pb-0">
                      <v-combobox outlined :items="assigneeItems" append-icon="pwc pwc-icon pwc-person"
                        item-text="UserName" dense class="rounded-0" item-value="UserID"
                        v-model="delegationFormData.Assignee" :label="$t('delegationuser.Assignee')"
                        :rules="[required]">
                      </v-combobox>
                    </v-col>
                    <v-col cols="6" class="pb-0">
                      <v-select multiple outlined :items="workflowForms" item-text="text" item-value="value" dense
                        class="rounded-0" v-model="delegationFormData.Forms" :label="$t('delegationuser.Form')"
                        :rules="[requiredSelect]">
                        <!-- Form多选插槽 -->
                        <template v-slot:prepend-item>
                          <v-list-item
                            ripple
                            @mousedown.prevent
                            @click="toggle"
                          >
                            <v-list-item-action>
                              <v-icon :color="delegationFormData.Forms.length > 0 ? 'primary' : ''">
                                {{ icon }}
                              </v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                              <v-list-item-title>
                                {{ $t('delegationuser.selectAll') }}
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                          <v-divider class="mt-2"></v-divider>
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6" class="pt-0">
                      <v-row>
                        <!-- start date -->
                        <v-col cols="6" class="pt-0">
                          <v-menu transition="scale-transition"
                            offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field v-model="delegationFormData.startDate" outlined dense class="rounded-0"
                                prepend-inner-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                                :label="$t('delegationuser.starttime')" :rules="[required]"></v-text-field>
                            </template>
                            <v-date-picker v-model="delegationFormData.startDate" >
                            </v-date-picker>
                          </v-menu>
                        </v-col>
                        <!-- start time -->
                        <v-col cols="6" class="pt-0">
                          <v-menu transition="scale-transition"
                            offset-y max-width="290px" min-width="290px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field v-model="delegationFormData.startTime" outlined dense class="rounded-0"
                                prepend-inner-icon="pwc-time-outline" readonly v-bind="attrs" v-on="on"
                                :rules="[required]">
                              </v-text-field>
                            </template>
                            <v-time-picker v-model="delegationFormData.startTime" >
                            </v-time-picker>
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="6" class="pt-0">
                      <v-row>
                        <!-- end date -->
                        <v-col cols="6" class="pt-0">
                          <v-menu transition="scale-transition"
                            offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field :label="$t('delegationuser.endtime')" v-model="delegationFormData.endDate"
                                outlined dense class="rounded-0" prepend-inner-icon="mdi-calendar" readonly
                                v-bind="attrs" v-on="on" :rules="[required,compareDate]"></v-text-field>
                            </template>
                            <v-date-picker v-model="delegationFormData.endDate" >
                            </v-date-picker>
                          </v-menu>
                        </v-col>
                        <!-- end time -->
                        <v-col cols="6" class="pt-0">
                          <v-menu  transition="scale-transition"
                            offset-y max-width="290px" min-width="290px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field v-model="delegationFormData.endTime" outlined dense class="rounded-0"
                                prepend-inner-icon="pwc-time-outline" readonly v-bind="attrs" v-on="on"
                                :rules="[required]">
                              </v-text-field>
                            </template>
                            <v-time-picker v-model="delegationFormData.endTime" >
                            </v-time-picker>
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-card-actions class="justify-end">
                    <v-btn tile dark color="primary" @click="saveDelegation">
                      {{ $t("schema-base.defaultBtns.save") }}</v-btn>
                    <v-btn outlined tile @click="clear">
                      {{
                           $t("schema-base.defaultBtns.close")
                        }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-form>
            </v-card-text>
          </v-tab-item>
          <v-tab-item>
            <v-card-text class="pt-0">
              <v-row class="justify-end">
                <v-col cols="2 pt-0">
                  <v-checkbox v-model="assignmentValid" class="mt-2 mb-4" hide-details
                    :label="$t('delegationuser.validtip')" @change="searchAssignmentList"></v-checkbox>
                </v-col>
                <v-col cols="3 pt-0">
                  <v-text-field v-model="searchAssignment" append-icon="mdi-magnify"
                    :label="$t('delegationuser.searchTip')" hide-details solo flat dense outlined class="rounded-0"
                    @keyup.enter="searchAssignmentList" @click:append="searchAssignmentList"></v-text-field>
                </v-col>
              </v-row>
              <div v-on="inputListeners" ref="assignmentlist" class="assignment-table-wrap">
                <v-data-table :options.sync="options" disable-pagination :headers="assignmentHeaders"
                  :items="assignmentDatas" :item-class="is_new" fixed-header hide-default-footer @click:row="clickRow"
                  :server-items-length="totalAssignments">
                  <template v-slot:item.startTime="props">
                    <span>
                      {{
                      props.item.startTime
                          | dateformat($store.state.appInfo.appDateFormat)
                    }}
                    </span>
                  </template>
                  <template v-slot:item.endTime="props">
                    <span>
                      {{
                      props.item.endTime
                          | dateformat($store.state.appInfo.appDateFormat)
                    }}
                    </span>
                  </template>
                </v-data-table>
              </div>
            </v-card-text>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
  import appInfo from "../../utils/appInfo"
  let app = appInfo()
  export default {
    props: {
      delegationDialog: {
        type: Boolean,
        default: false,
      },
    },
    inject: {
      messageDialog: {
        default: {
          showMsg() {},
          showErr() {},
          canCancelConfirm() {}
        }
      }
    },
    data() {
      return {
        options: {},
        sortObj: {},
        totalAssignments: 0,
        tab: 0,
        assignmentValid: true,
        assignmentDatas: [],
        delegationDatas: [],
        selectDelegationId: "",
        delegationFormData: {
          DelegateId: "",
          isAction: true,
          startDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
          startTime: "9:00",
          endDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
          endTime: "9:00",
          Assignee: "",
          Forms: ""
        },
        workflowForms: {},
        startDateMenu: false,
        startTimeMenu: false,
        isShowDelegationForm: false,
        assigneeItems: [],
        searchAssignment: "",
        PageSize: 10,
        index: 1,
        loadMore: true
      }
    },
    computed: {
      inputListeners() {
        var vm = this;
        return Object.assign({}, this.$listeners, {
          scroll: function (event) {
            let listEl = vm.$refs.assignmentlist;
            //获取或设置一个元素的内容垂直滚动的像素数
            let scrollTop = listEl.scrollTop;
            //获得元素盒子的高度[height+(包含padding，不包括margin和border)]
            let clientHeight = listEl.clientHeight;
            //获得文档内容的真实高度
            let scrollHeight = listEl.scrollHeight;

            // console.log('scrollTop ='+ scrollTop + 'clientHeight =' + clientHeight + 'scrollHeight='+scrollHeight)
            //距离底部100时，开始滚动
            if (scrollTop + 20 >= scrollHeight - clientHeight) {
              if (vm.loadMore) {
                vm.loadData();
              }
            }
          },
        });
      },
      enableDelTip() {
        return function (isAction) {
          return isAction ? this.$t('delegationuser.disableTip') : this.$t('delegationuser.enableTip')
        }
      },
      assignmentHeaders() {
        return [{
            text: this.$t("delegationuser.formname"),
            value: "formNames",
            sortable: true,
            width: "20%"
          },
          {
            text: this.$t("delegationuser.assignedby"),
            value: "userName",
            sortable: true,
            width: "14%"
          },
          {
            text: this.$t("delegationuser.starttime"),
            value: "startTime",
            sortable: true,
            width: "19%"
          },
          {
            text: this.$t("delegationuser.endtime"),
            value: "endTime",
            sortable: true,
            width: "19%",
          },
          {
            text: this.$t("delegationuser.status"),
            value: "status",
            sortable: false,
            width: "8%",
          }
        ]
      },
      delegationHeaders() {
        return [{
            text: this.$t("delegationuser.Assignee"),
            value: "assigneeName",
            width: "14%"
          },
          {
            text: this.$t("delegationuser.formname"),
            value: "formNames",
            width: "18%",
          },
          {
            text: this.$t("delegationuser.starttime"),
            value: "startTime",
            width: "18%"
          },
          {
            text: this.$t("delegationuser.endtime"),
            value: "endTime",
            width: "18%",
          },
          {
            text: this.$t("delegationuser.actions"),
            value: "actions",
            sortable: false,
            width: "10%",
            class: "flex",
            align: "center"
          }
        ]
      },
      // 计算是否选择所有form
      likesAllForm () {
        return this.delegationFormData.Forms.length === this.workflowForms.length
      },
      // 选中了部分form
      likesSomeForm () {
        return this.delegationFormData.Forms.length > 0 && !this.likesAllForm
      },
      icon () {
        if (this.likesAllForm) return 'mdi-close-box'
        if (this.likesSomeForm) return 'mdi-minus-box'
        return 'mdi-checkbox-blank-outline'
      },
    },
    methods: {
      toggle () {
        this.$nextTick(() => {
          if (this.likesAllForm) {
            this.delegationFormData.Forms = []
          } else {
            this.delegationFormData.Forms = this.workflowForms.map(item => item.value)
          }
        })
      },
      compareTime(endTime) {
        let currentT = new Date().getTime()
        let e = new Date(endTime).getTime()
        return currentT > e
      },
      clickRow: function (item) {
        if (item.isNew == false) return
        if (!item || Object.keys(item).length < 1) return
        this.$axios.post('/api/PostJObjectResult', {
          requestURL: "dgl/DelegateStateRead",
          delegateId: item.id
        }).then(({
          data
        }) => {
          if (data.data == true) {
            this.assignmentDatas = this.assignmentDatas.map(e => {
              if (e.id == item.id) e.isNew = false
              return e
            })
          }
        });
      },
      is_new(item) {
        return item.isNew == true ? 'is-new' : ''
      },
      searchAssignmentList() {
        this.index = 1
        this.assignmentDatas = []
        this.getAssignmentData()
      },
      required(v) {
        return !!v || v === 0 || (v.isArray && v.isArray.length === 0) || this.$t('schema-base.rules.required');
      },
      requiredSelect(v) {
        return (!!v || v === 0 ) && (Array.isArray(v) && v.length !== 0) || this.$t('schema-base.rules.required');
      },
      compareDate(v) {
        let {
          startDate,
          startTime,
          endDate,
          endTime
        } = this.delegationFormData
        return this.moment(`${v} ${endTime}`).isAfter(`${startDate} ${startTime}`) || this.$t(
          'delegationuser.datecomparetip')
      },
      showDelegationForm() {
        this.isShowDelegationForm = true
      },
      clear() {
        this.isShowDelegationForm = false
        this.delegationFormData.Assignee = ''
        this.delegationFormData.Forms = ''
        this.$refs.delegationForm.resetValidation()
      },
      saveDelegation() {
        if (!this.$refs.delegationForm.validate()) {
          return;
        }

        let {
          Assignee,
          Forms,
          startDate,
          startTime,
          endDate,
          endTime
        } = this.delegationFormData

        let StartTime = this.moment(this.moment(`${startDate} ${startTime}`)).unix() * 1000
        let EndTime = this.moment(this.moment(`${endDate} ${endTime}`)).unix() * 1000

        let param = {
          requestURL: "dgl/DelegateUpdate",
          DelegateId: "",
          IsAction: true,
          IsNew: true,
          StartTime: StartTime,
          EndTime: EndTime,
          User: this.$store.state.userInfo.userID,
          Assignee: Assignee.UserID,
          Forms: Forms
        }
        this.$axios
          .post("/api/PostJObjectResult", param)
          .then(({
            data
          }) => {
            if (data.data == true) {
              this.getDelegationData()
              this.clear()
            } else {
              this.messageDialog.showErr(data.message);
            }
          });
      },
      delDelegationConfirm(id) {
        this.selectDelegationId = id
        let dialogContent = {
          message: this.$t("delegationuser.delTip"),
          fn: null,
          fnCancel: true,
          isCurrentPageView: "",
          alertConfirm: this.delDelegation
        }
        this.messageDialog.canCancelConfirm(dialogContent)
      },
      delDelegation() {
        this.$axios
          .post("/api/PostJObjectResult", {
            requestURL: "dgl/DelegateDelete",
            DelegateId: this.selectDelegationId
          })
          .then(({
            data
          }) => {
            if (data.data == true) {
              this.delegationDatas = this.delegationDatas.filter(e => e.id != this.selectDelegationId)
            }
          });
      },
      isEnableDelegation(DelegateId, isAction) {
        this.$axios.post('/api/PostJObjectResult', {
          requestURL: "dgl/DelegateAction",
          DelegateId: DelegateId,
          IsAction: isAction
        }).then(({
          data
        }) => {
          if (data.data == true) {
            this.delegationDatas = this.delegationDatas.map(e => {
              if (e.id == DelegateId) e.isAction = isAction
              return e
            })
          }
        });
      },
      closeDelegation() {
        this.$emit('closeDelegationDialog')
        this.clear()
      },
      getDelegationData() {
        this.$axios
          .post("/api/PostJObjectResult", {
            requestURL: "dgl/DelegateDelegation"
          })
          .then(({
            data
          }) => {
            this.delegationDatas = data.data || []
          });
      },
      loadData() {
        this.index += 1;
        this.getAssignmentData()
      },
      getAssignmentData() {
        this.loadMore = false;
        let param = {
          requestURL: "dgl/DelegateAssignee",
          IsValid: this.assignmentValid || '',
          Search: this.searchAssignment,
          CurrentPage: this.index,
          PageSize: this.PageSize,
          Sort: this.sortObj
        }
        this.$axios.post('/api/PostJObjectResult',
          param).then(
          ({
            data
          }) => {
            let curData = data.data
            this.totalAssignments = data.totalCount
            this.assignmentDatas = this.assignmentDatas.concat(curData.data)
            if (((this.index - 1) * this.PageSize + curData.data.length) >= curData.totalCount) {
              this.loadMore = false
            } else {
              this.loadMore = true
            }
          });
      },
      getworkflowForms() {
        this.$axios
          .post("/api/PostJObjectResult", {
            requestURL: "dgl/DelegateGetForms"
          })
          .then(({
            data
          }) => {
            if (Object.keys(data.data).length > 0) {
              this.workflowForms = this.getValidArr(data.data)
            } else {
              this.workflowForms = []
            }
          });
      },
      getValidArr(data) {
        let arr = []
        Object.keys(data).forEach(key => {
          arr.push({
            text: data[key],
            value: key
          })
        })
        return arr
      },
      getAssigneePeople() {
        let _this = this
        let param = {
          pickertype: "people",
          Method: "staff",
          selectedType: "userId",
          index: 1,
          size: 10000,
          organizationCode: app.tenantId,
          appCode: app.appCode,
          showTermUser: false,
          IgnoreStaffs: [this.$store.state.userInfo.staffCode]
        }
        this.$axios.post('/api/Picker', param)
          .then(({
            data
          }) => {
            _this.assigneeItems = data.Data
          });
      },
    },
    watch: {
      options: {
        handler(val) {
          this.sortObj = {}
          if (val && val.sortBy && val.sortBy.length > 0) {
            let key = val.sortBy[0]
            let value = val.sortDesc[0] == false ? -1 : 1
            this.sortObj[key] = value
          }
          this.searchAssignmentList()
        },
        deep: true
      }
    },
    async created() {
      await this.getDelegationData()
      await this.getworkflowForms()
      await this.getAssigneePeople()
    }
  }

</script>

<style lang="scss">
  .delegation-scroll-bar::-webkit-scrollbar {
    width: 7px;
    height: 10px;
  }

  .delegation-scroll-bar::-webkit-scrollbar-track {
    border-radius: 3px;
  }

  .delegation-scroll-bar::-webkit-scrollbar-thumb {
    background: #464646;
    border-radius: 12px;
  }

  .delegation-scroll-bar::-webkit-scrollbar-thumb:hover {
    background: #464646;
  }
  .delegation-table-wrap .v-data-table__wrapper,
  .assignment-table-wrap {
    max-height: 288px;
    border: thin solid rgba(0, 0, 0, .12);

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: #626262;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #2d2d2d;
    }

    .text-start {
      word-break: break-word;
    }
  }

  .assignment-table-wrap {
    overflow-y: auto;
    max-height: 516px;
  }

  .is-new {
    color: #3D26DF;
    font-weight: 500;

    td:nth-child(1) {
      position: relative;
      padding-left: 15px;
    }

    td:nth-child(1)::before {
      content: '';
      width: 10px;
      height: 10px;
      background: red;
      border-radius: 100%;
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translate(0, -50%);
    }
  }

</style>
