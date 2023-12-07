<template>
  <v-container style="max-width: 96%" class="ratingDataListStyle" :class="{'dark-list':$vuetify.theme.dark}">
    <v-row class="align-center">
      <v-col class="pb-0 d-flex align-center">
        <v-text-field class="searchInput" :label="$t('schema-base.defaultBtns.search')" color="primary" v-model="keywords"></v-text-field>
        <v-spacer/>
        <v-select color="primary" multiple item-color="primary"
                  :items="['1', '2', '3', '4', '5']"
                  v-model="scoreValue" append-icon="mdi-chevron-down"
                  :label="$t('ratingComponent.list.score')"></v-select>
        <v-spacer/>
        <v-btn color="primary"
               class="radiu4"
               @click="doReset"
               light
               tile
               outlined>{{ $t('schema-base.defaultBtns.reset') }}
        </v-btn>
        <v-btn color="primary"
               class="radiu4 ml-6  white--text"
               @click="doSearch"
               light
               tile>{{ $t('schema-base.defaultBtns.search') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>

        <v-data-table v-model="selected"
                      item-key="id"
                      class="listMain pt-0 mt-0"
                      :loading="loading"
                      loading-text="Loading... Please wait"
                      :headers="headers"
                      :items="dataList"
                      :items-per-page="pageSize"
                      :page.sync="pageIndex"
                      @page-count="Math.ceil(totalCount/pageSize)"
                      hide-default-footer
                      @click:row="rowClick">
          <template v-slot:item.CreationTime="{ item }">
            {{ formatDate(item.CreationTime) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn tile small @click="viewItem(item)" icon>
              <v-icon small :color="$vuetify.theme.dark ? '#ffffff' : '#464646'"> mdi-eye </v-icon>
            </v-btn>

            <v-btn @click="
                    deletingId = item._id;
                    dialog = true;
                  "
                   tile
                   small
                   icon
                   class="ml-3">
                <v-icon small :color="$vuetify.theme.dark ? '#ffffff' : '#464646'"> mdi-delete </v-icon>
            </v-btn>
          </template>
        </v-data-table>
        <div class="mt-3 d-flex justify-end">
          <v-pagination :total-visible="7" @input="pageChanged" color="primary" v-model="pageIndex"
                        :length="Math.ceil(totalCount/pageSize)"></v-pagination>
        </div>
        <!--<v-row>
          <v-col>

          </v-col>
        </v-row>-->
      </v-col>
      <v-col cols="4">
        <v-card class="detailMain">
          <v-card-title>{{ $t('ratingComponent.list.details') }}</v-card-title>
          <v-card-text>
            <v-divider class="primary2"></v-divider>
            <v-row style="align-items: center !important">
              <v-col class="detailTitle">{{ $t('ratingComponent.list.score') }}:</v-col>
              <v-col cols="8">
                <v-rating readonly
                          v-model="detailItem.Score"
                          color="#FFB600"
                          size="23"
                          empty-icon="mdi-star"
                          background-color="#F2F2F2"></v-rating>
              </v-col>
              <v-col class="detailTitle" style="text-align: right !important">
                {{
                  detailItem.Score
                }}
              </v-col>
            </v-row>
            <v-row style="align-items: center !important">
              <v-col class="detailTitle">{{ $t('ratingComponent.list.contents') }}:</v-col>
              <v-col class="detailTitle" style="text-align: right !important">
                <v-btn icon small @click="doCopy(detailItem.Contents)">
                  <v-icon>pwc-documentmultiple-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="detailContents pt-0">
                {{ detailItem.Contents }}
              </v-col>
            </v-row>
            <v-row>
              <v-col class="detailTitle">{{ $t('ratingComponent.list.userName') }}:</v-col>
            </v-row>
            <v-row>
              <v-col class="detailContents pt-0">
                {{ detailItem.UserName }}
              </v-col>
            </v-row>
            <v-row style="align-items: center !important">
              <v-col class="detailTitle">{{ $t('ratingComponent.list.email') }}:</v-col>
              <v-col class="detailTitle" style="text-align: right !important">
                <v-btn icon small @click="doCopy(detailItem.Email)">
                  <v-icon>pwc-documentmultiple-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="detailContents pt-0">
                {{ detailItem.Email }}
              </v-col>
            </v-row>
            <v-row style="align-items: center !important">
              <v-col class="detailTitle">{{ $t('ratingComponent.list.fromUrl') }}:</v-col>
              <v-col class="detailTitle" style="text-align: right !important">
                <v-btn icon small @click="doCopy(detailItem.FromUrl)">
                  <v-icon>pwc-documentmultiple-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="detailContents pt-0">
                {{ detailItem.FromUrl }}
              </v-col>
            </v-row>
            <v-row style="align-items: center !important">
              <v-col class="detailTitle">
                {{ $t('ratingComponent.list.screenRate') }}:
                <p class="detailContents pt-3">
                  {{ detailItem.ScreenWidth }} *
                  {{ detailItem.ScreenHeight }}
                </p>
              </v-col>
              <v-col class="detailTitle">
                {{ $t('ratingComponent.list.windowRate') }}:
                <p class="detailContents pt-3">
                  {{ detailItem.WindowWidth }} *
                  {{ detailItem.WindowHeight }}
                </p>
              </v-col>
              <v-col class="detailTitle">
                {{ $t('ratingComponent.list.documentRate') }}:
                <p class="detailContents pt-3">
                  {{ detailItem.DeviceWidth }} *
                  {{ detailItem.DeviceHeight }}
                </p>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-title>
            <v-row>
              <v-col class="py-0">{{ $t('ratingComponent.list.browserInformation') }}</v-col>
              <v-col class="py-0" cols="2" style="text-align: right !important">
                <v-btn small icon @click="showCode = !showCode">
                  <v-icon>pwc-convert-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-divider class="primary2"></v-divider>
            <v-row v-if="showCode">
              <v-col class="detailTitle">{{ $t('ratingComponent.list.jsonData') }}:</v-col>
              <v-col class="detailTitle" style="text-align: right !important">
                <v-btn icon
                       small
                       @click="doCopy(detailItem.BrowserInfo)">
                  <v-icon>pwc-documentmultiple-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="showCode">
              <v-col class="pt-0">
                <v-textarea class="detailContents browserInfo pt-0"
                            v-model="detailItem.BrowserInfo"
                            background-color="#f8f8f8"
                            readonly
                            disabled
                            rows="10"></v-textarea>
              </v-col>
            </v-row>
            <v-row v-if="!showCode && detailItem.browserJSON != null"
                   style="align-items: center !important">
              <v-col class="detailTitle">
                {{ $t('ratingComponent.list.vendor') }}:
                <p class="detailContents pt-3">
                  {{ detailItem.browserJSON.vendor }}
                </p>
              </v-col>
              <v-col class="detailTitle">
                {{ $t('ratingComponent.list.platform') }}:
                <p class="detailContents pt-3">
                  {{ detailItem.browserJSON.platform }}
                </p>
              </v-col>
              <v-col class="detailTitle">
                {{ $t('ratingComponent.list.language') }}:
                <p class="detailContents pt-3">
                  {{ detailItem.browserJSON.language }}
                </p>
              </v-col>
            </v-row>
            <v-row v-if="!showCode && detailItem.browserJSON != null"
                   style="align-items: center !important">
              <v-col class="detailTitle">{{ $t('ratingComponent.list.userAgent') }}:</v-col>
              <v-col class="detailTitle" style="text-align: right !important">
                <v-btn icon
                       small
                       @click="doCopy(detailItem.browserJSON.userAgent)">
                  <v-icon>pwc-documentmultiple-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="!showCode && detailItem.browserJSON != null">
              <v-col class="detailContents pt-0">
                {{ detailItem.browserJSON.userAgent }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar timeout="1000"
                v-model="snackbar"
                color="#175D2D"
                center
                app
                tile
                centered>
      {{ snackBarMsg }}
    </v-snackbar>
    <v-snackbar timeout="1000" v-model="snackbar2" centered app tile>
      {{ $t('ratingComponent.list.batchDeleteMessage') }}
    </v-snackbar>
    <v-dialog @click="
        dialog = false;
        deletingId = '';
      "
              v-model="dialog"
              width="320">
      <v-card class="deleteConfirmWindow">
        <v-card-text class="deleteConfirmTitle black--text pt-4">
          {{ $t('ratingComponent.list.confirmDelete') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="primary"
                 @click="
              dialog = false;
              deletingId = '';
            "
                 outlined
                 :loading="loading"
                 light
                 tile
                 class="radiu4 noButton"
                 height="32"
                 width="78"
                 elevation="0"
                 v-show="!loading">{{ $t("button.no") }}
          </v-btn>
          <v-btn class="ml-3 radiu4 white--text"
                 color="primary"
                 @click="doDeleteItem(deletingId)"
                 :loading="loading"
                 :disabled="loading"
                 height="32"
                 width="78"
                 elevation="0">
            {{ $t("button.yes") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

export default {
  data() {
    return {
      snackbar: false,
      snackbar2: false,
      loading: true,
      selected: [],
      showCode: false,
      keywords: "",
      appCodeSelected: "",
      scoreValue: [],
      alertMsgTemplate: "共计需要删除:{0}条记录，成功删除{1}条记录！",
      alertMsg: "",
      snackBarMsg: "",
      totalCount: 0,
      headers: [
        {
          text: this.$t('ratingComponent.list.score'),
          value: "Score",
          class: "white--text text-subtitle-2",
        },
        {
          text: this.$t('ratingComponent.list.contents'),
          value: "Contents",
          class: "white--text text-subtitle-2",
        },
        {
          text: this.$t('ratingComponent.list.createTime'),
          value: "CreationTime",
          class: "white--text text-subtitle-2",
        },
        {
          text: this.$t('ratingComponent.list.actions'),
          value: "actions",
          sortable: false,
          class: "white--text text-subtitle-2",
        },
      ],
      ratingIsLogin: false,
      dataList: [],
      pageIndex: 1,
      viewIndex: 0,
      detailItem: {},
      dialog: false,
      deletingId: "",
      pageSize: 16
    };
  },

  methods: {

    rowClick(value) {
      this.viewItem(value);
    },
    doSearch() {
      this.pageIndex = 1;
      this.totalCount = 0;
      this.getDataList();
    },
    doReset() {
      this.keywords = "";
      this.appCodeSelected = [];
      this.scoreValue = [];
      this.getDataList();
    },
    pageChanged(pageItem) {
      this.getDataList()
    },
    getDataList() {
      this.dataList = [];
      this.loading = true;
      var scoreList = [];
      if (this.scoreValue.length > 0) {
        // console.log(this.scoreValue)
        this.scoreValue.filter((e) => scoreList.push(parseInt(e)));
      }
      this.$axios.post('/api/sc/ur/g', {
        keywords: this.keywords,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        searchScore: scoreList
      }).then((res) => {
        // console.log(res);
        if (res != null && res.data != null && res.data.data != null && res.data.statusCode != null && res.data.statusCode == 200 && res.data.data.items != null && res.data.data.totalCount != null) {
          this.dataList = res.data.data.items;
          this.totalCount = res.data.data.totalCount;
          this.viewItem(res.data.data.items[0]);
        }
        this.loading = false;
      }).catch((e) => {
        // console.log(e)
        this.loading = false;
      })
    },
    viewItem(item) {
      this.viewIndex = this.dataList.indexOf(item);
      this.detailItem = Object.assign({}, item);
      var jsonData = {};
      try {
        jsonData = JSON.parse(item.BrowserInfo);
      } catch (e) {
        // console.log(e)
      }
      // console.log(jsonData);
      if (jsonData.language == null || jsonData.language == undefined) {
        jsonData.language = "";
      }
      if (jsonData.platform == null || jsonData.platform == undefined) {
        jsonData.platform = "";
      }
      if (jsonData.userAgent == null || jsonData.userAgent == undefined) {
        jsonData.userAgent = "";
      }
      if (jsonData.vendor == null || jsonData.vendor == undefined) {
        jsonData.vendor = "";
      }
      const bJSON = {
        language: jsonData.language,
        platform: jsonData.platform,
        userAgent: jsonData.userAgent,
        vendor: jsonData.vendor,
      };
      this.detailItem.browserJSON = bJSON;
      this.detailItem.BrowserInfo = JSON.stringify(jsonData, null, 4);
    },
    doDeleteItem(deleteId) {
      const deleteItem = {
        keywords: deleteId
      };
      if (this.ratingIsLogin) {
        var self = this;
        self.loading = true;
        self.$axios.post('api/sc/ur/d', deleteItem).then((res) => {
          // console.log(res);
          if (res != null && res.data.statusCode != null && res.data.statusCode == 200) {
            self.snackBarMsg = this.$t('ratingComponent.list.deleteMessage');
            self.snackbar = true;
            self.loading = false;
            self.dialog = false;
            self.deletingId = "";
            self.pageIndex = 1;
            self.getDataList();
          } else {
            self.loading = false;
            self.dialog = false;
            self.deletingId = "";
          }
        }).catch((e) => {
          // console.log(e);
          self.loading = false;
          self.dialog = false;
          self.deletingId = "";
        });
      } else {
        self.snackBarMsg = "Please log in and try again.";
        self.snackbar = true;
      }

    },
    promiseDeleteItem(self, deleteItem) {
      return new Promise(function (resolve, reject) {
        self.$axios.post('/sdk/SoftDeleteDoc', deleteItem).then((res) => {
          // console.log('SoftDeleteDoc:', res);
          if (res.data.statusCode == 200) {
            self.$axios.post('/sdk/HardDeleteDoc', deleteItem).then((res) => {
              if (res.data.statusCode == 200) {
                resolve("delete successed:", deleteItem);
              } else {
                reject("failed delete:HardDeleteDoc:" + deleteItem);
              }
            });
          } else {
            reject("failed delete:SoftDeleteDoc:" + deleteItem);
          }
        });
      });
    },
    batchDeleteItems() {
      var self = this;
      const deleteItems = [...self.selected];
      //每次最多删10条
      if (deleteItems.length > 10) {
        self.snackbar2 = true;
      } else {
        self.loading = true;
        var promiseArray = [];
        for (var i = 0; i < deleteItems.length; i++) {
          const deleteItem = {
            PageCode: "rating_data",
            DocId: deleteItems[i]._id,
          };
          promiseArray.push(self.promiseDeleteItem(self, deleteItem));
        }
        let handelAllPromise = Promise.all(promiseArray);
        handelAllPromise.then(function (values) {
          self.loading = false;
          self.alertMsg = self.alertMsgTemplate
            .replace("{0}", deleteItems.length)
            .replace("{1}", values != null ? values.length : 0);
          self.getDataList();
        });
        handelAllPromise.catch(function (reason) {
          self.loading = false;
          self.alertMsg = "有數據刪除失敗，請刷新後重試!";
          self.getDataList();
          // console.log(reason);
        });
      }
    },
    formatDate(datetime) {
      let dat = new Date(datetime);
      const year = dat.getFullYear();
      const mon = (dat.getMonth()+1) < 10 ? "0"+(dat.getMonth()+1) : dat.getMonth()+1;
      const data = dat.getDate()  < 10 ? "0"+(dat.getDate()) : dat.getDate();
      const hour = dat.getHours()  < 10 ? "0"+(dat.getHours()) : dat.getHours();
      const min =  dat.getMinutes()  < 10 ? "0"+(dat.getMinutes()) : dat.getMinutes();
      const seconds = dat.getSeconds() < 10 ? "0"+(dat.getSeconds()) : dat.getSeconds();
      return year +"-"+ mon +"-"+ data +" "+ hour +":"+ min +":"+ seconds;
    },
    doCopy(Contents) {
      let self = this;
      navigator.clipboard
        .writeText(Contents)
        .then(function () {
          self.snackBarMsg = self.$t('ratingComponent.list.copyMessage');
          self.snackbar = true;
        })
        .catch(function (reason) {
          console.error(reason);
        });
    },
    doExport() {
      let self = this;
      self.loading = true;
      const exportItems = [...self.selected];
      if (exportItems.length > 0) {
        self.$axios.post('/sdk/ExportDocsByQuery', {
          QueryCode: "rating_data",
          Size: 25,
          Index: 1,
          Columns: [
            {
              column: "appcode",
              header: "appcode",
              order: 0,
              DataFormat: "string",
            },
          ],
        }).then((res) => {
          // console.log(res);

          this.loading = false;
        });
      }
    },
  },
  created() {
    this.ratingIsLogin =
      this.$store.state.userInfo != undefined &&
      this.$store.state.userInfo != null
        ? true
        : false;
    this.getDataList();
  }
}
</script>
<style scoped>
.searchInput .primary--text{
  color: rgb(61, 38, 223) !important;
  caret-color: rgb(61, 38, 223) !important;
}
</style>
<style>
.ratingDataListStyle {
  font-family: "Helvetica Neue LT Pro", "Helvetica Neue", "Helvetica" !important;
}

.ratingDataListStyle .fontBold {
  font-weight: bold;
}

.ratingDataListStyle thead .mdi-checkbox-marked,
.ratingDataListStyle thead i {
  color: #ffffff !important;
}
.ratingDataListStyle .listMain.v-data-table .v-data-table-header {
  background: var(--v-primary-base) !important; ;

}
.ratingDataListStyle thead .text-start {
  text-align: left !important;
  font-weight: normal;
  font-size: 16px;
  letter-spacing: 0px !important;
}

.ratingDataListStyle tbody .mdi-checkbox-marked {
  color: var(--v-primary-base) !important;
}

.ratingDataListStyle .radiu4 {
  border-radius: 4px !important;
}
.ratingDataListStyle .radiu8 {
  border-radius: 8px !important;
}

.ratingDataListStyle .primary2 {
  color: var(--v-primary-base);
  background: var(--v-primary-base) 0% 0% no-repeat !important;
}

.ratingDataListStyle .detailMain,
.ratingDataListStyle .listMain {
  border-top-left-radius: 8px;
  background: var(--unnamed-color-ffffff) 0% 0% no-repeat !important;
  background: #ffffff 0% 0% no-repeat !important;
  box-shadow: 0px 0px 24px #0000000f !important;
  border-radius: 8px !important;
}
.dark-list.ratingDataListStyle .detailMain,
.dark-list.ratingDataListStyle .listMain {
  background: #2d2d2d 0% 0% no-repeat !important;
}

.ratingDataListStyle .detailMain {
  padding: 20px !important;
}

.ratingDataListStyle .detailMain .v-card__title {
  font-weight: normal;
  font-size: 26px !important;
  /* color: #000000 !important; */
  text-align: lef !important;
}

.ratingDataListStyle .v-data-table__wrapper {
  border-top-left-radius: 8px !important;
  border-top-right-radius: 8px !important;
}

.ratingDataListStyle .v-btn--disabled,
.ratingDataListStyle .theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background: #f5f5f5 0% 0% no-repeat !important;
  border: 1px solid #d9d9d9 !important;
}

.ratingDataListStyle td {
  border: 0px !important;
  border-bottom: thin solid #dedede !important;
}

.ratingDataListStyle table tbody tr {
  opacity: 0;
  animation: ratingDataListTr_FadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.35) 0.1s forwards;
  cursor: pointer;
}

.ratingDataListStyle table .v-progress-linear__background,
.ratingDataListStyle table .v-progress-linear__indeterminate--active .v-progress-linear__indeterminate {
  background-color: var(--v-primary-base) !important;
  border-color: var(--v-primary-base) !important;
}

.ratingDataListStyle table tbody tr:hover {
  background: #f8f8f8 !important;
}
.dark-list.ratingDataListStyle table tbody tr:hover {
  background: #474747 !important;
}
.ratingDataListStyle table tbody tr:hover > .text-start {
  color: var(--v-primary-base) !important;
}
.dark-list.ratingDataListStyle table tbody tr:hover > .text-start {
  color:  var(--v-primary-base) !important;
}


.ratingDataListStyle table tbody tr:nth-child(2) {
  -webkit-animation-delay: .1s
}

.ratingDataListStyle table tbody tr:nth-child(3) {
  -webkit-animation-delay: .15s
}

.ratingDataListStyle table tbody tr:nth-child(4) {
  -webkit-animation-delay: .2s
}

.ratingDataListStyle table tbody tr:nth-child(5) {
  -webkit-animation-delay: .25s
}

.ratingDataListStyle table tbody tr:nth-child(6) {
  -webkit-animation-delay: .3s
}

.ratingDataListStyle table tbody tr:nth-child(7) {
  -webkit-animation-delay: .35s
}

.ratingDataListStyle table tbody tr:nth-child(8) {
  -webkit-animation-delay: .4s
}

.ratingDataListStyle table tbody tr:nth-child(9) {
  -webkit-animation-delay: .45s
}

.ratingDataListStyle table tbody tr:nth-child(10) {
  -webkit-animation-delay: .5s
}

.ratingDataListStyle table tbody tr:nth-child(11) {
  -webkit-animation-delay: .55s
}

.ratingDataListStyle table tbody tr:nth-child(12) {
  -webkit-animation-delay: .6s
}

.ratingDataListStyle table tbody tr:nth-child(13) {
  -webkit-animation-delay: .65s
}

.ratingDataListStyle table tbody tr:nth-child(14) {
  -webkit-animation-delay: .7s
}

.ratingDataListStyle table tbody tr:nth-child(15) {
  -webkit-animation-delay: .75s
}

.noButton.v-btn {
  border: 1px solid var(--v-primary-base) !important;
  color: var(--v-primary-base) !important;
  border-radius: 4px !important;
  background: #fff !important;
  box-shadow: none !important;
}

@keyframes ratingDataListTr_FadeIn {
  0% {
    transform: translateY(-50px);
    opacity: 0;
  }

  50% {
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.ratingDataListStyle table tbody .text-start {
  text-align: left;
  font-weight: normal;
  font-size: 14px !important;
  letter-spacing: 0.2px !important;
  /* color: #1e2b4b !important; */
}

.ratingDataListStyle tbody .v-simple-checkbox i {
  color: #707070 !important;
}

.ratingDataListStyle tbody .v-data-table__selected .v-simple-checkbox i {
  color: var(--v-primary-base) !important;
}

.ratingDataListStyle .detailMain .detailTitle {
  font-size: 16px !important;
  font-weight: bold;
  letter-spacing: 0px !important;
  color: #000000 !important;
}

.dark-list.ratingDataListStyle .detailMain .detailTitle {
  color: #ffffff !important;
}

.ratingDataListStyle .detailMain .detailContents {
  color: #000000 !important;
  text-align: left !important;
  letter-spacing: 0px !important;
  font-size: 16px !important;
  font-weight: normal;
}
.dark-list.ratingDataListStyle .detailMain .detailContents {
  color: #FFFFFF !important;
}

.dark-list.ratingDataListStyle .detailMain .browserInfo textarea{
  color: #000000;
}

.ratingDataListStyle .v-data-footer__icons-before .v-btn,
.ratingDataListStyle .v-data-footer__icons-after .v-btn {
  background: #ffffff !important;
  border: 0px !important;
}

.deleteConfirmWindow {
  background: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box !important;
  background: #ffffff 0% 0% no-repeat padding-box !important;
  box-shadow: 0px 1px 12px #00000029 !important;
  border-radius: 8px !important;
}

.ratingDataListStyle .deleteConfirmWindow .v-btn {
  background-color: var(--v-primary-base) !important;
  border-color: var(--v-primary-base) !important;
}

.ratingDataListStyle .deleteConfirmTitle {
  text-align: center !important;
  font-size: 14px !important;
  font-weight: normal !important;
  letter-spacing: 0.2px !important;
  color: #1e2b4b !important;
  padding: 25px 20px !important;
}

.ratingDataListStyle .v-snack__wrapper {
  background: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
  background: #ffffff 0% 0% no-repeat padding-box !important;
  box-shadow: 0px 1px 12px #00000029 !important;
  border-radius: 8px !important;
  height: 64px !important;
}

.ratingDataListStyle .v-snack__content {
  text-align: center !important;
  font-size: 14px !important;
  font-weight: normal;
  letter-spacing: 0.2px !important;
  color: #1e2b4b !important;
}
</style>
