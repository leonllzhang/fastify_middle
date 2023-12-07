<template>
  <table class="datatable-group">
    <tbody>
      <template v-for="item in datalist">
        <template v-if="item.isGroup">
          <tr :key="item.id" v-on:click="expandedChildren(item)">
            <td :colspan="groupdatatableHeader.length"
                :class="('datatable-group-tr-level' + currentlevel)">
              <v-icon v-if="item.expanded">mdi-chevron-right</v-icon>
              <v-icon v-else>mdi-chevron-down</v-icon>
              <span>{{item.value == 'NG_BSONNULL' ? item.value.replace('NG_BSONNULL','') : item.value }}</span><span class="item-counts">{{' ' + item.count + ' ' + $t("view.datatable.items") }}</span>
            </td>
          </tr>
           <tr :key="item.id">
            <td style="width:100%" :colspan="groupdatatableHeader.length">
              <datatablegrouptrwrapper 
                v-show="item.children && !item.expanded"
                :key="item._id"
                :groupdatalist="item.children"
                :schema="schema"
                :level="currentlevel"
                :total="item.count"
                :patentItem="item"
                :groupdatatableHeader="groupdatatableHeader"
                :formHref="formHref"
                :searchValues="searchValues" />
            </td>
          </tr>

        </template>
        <template v-else>
          <template v-if="$vuetify.breakpoint.name == 'xs'">
            <tr class="v-data-table__mobile-table-row" v-for="detailItem in datalist[0].items" @click="clickRow(detailItem)" @dblclick="dblclickRow(detailItem)">
              <template v-for="detailItemHeader in groupdatatableHeader">
                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{detailItemHeader.text}}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ getShowValue(detailItem,detailItemHeader) }}
                  </div>
                </td>
              </template>
            </tr>
          </template>
          <template v-else>
            <tr class="datatable-group-content-tr" v-for="detailItem in datalist[0].items" @click="clickRow(detailItem)" @dblclick="dblclickRow(detailItem)">
              <template v-for="detailItemHeader in groupdatatableHeader">
                <td :width="detailItemHeader.width" class="data-tr-td">
                  <template v-if="detailItemHeader.docLink">
                    <a :href="returnAlink(formHref + detailItem._id)"
                       target="_blank">{{ getShowValue(detailItem,detailItemHeader) }}</a>
                  </template>
                  <template v-else>
                    {{ getShowValue(detailItem,detailItemHeader) }}
                  </template>
                </td>
              </template>
            </tr>
          </template>         
          <tr v-if="(total > (datalist[0].items != null ? datalist[0].items.length : 0))"
              class="datatable-group-tr-loadmore">
            <td :colspan="groupdatatableHeader.length">
              <p class="text-center">
                <v-btn text
                       icon
                       @click="loadMore(patentItem, ((datalist[0].items != null ? datalist[0].items.length : 0)))">
                  <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
              </p>
            </td>
          </tr>
        </template>
      </template>
    </tbody>
  </table>
</template>
<script>
  import base from "../utils/schema-base";
  import { mapMutations } from "vuex";
  import { exportEnvUrl, formatFieldValue } from "../../utils/appBaseMethods"

  export default {
    mixins: [base],
    components: {
      datatablegrouptrwrapper: () => import("./vc-datatable-grouptr.vue"),
    },
    name: "vc-datatable-grouptr-component",
    props: {
      schema: { type: Object, default: {} },
      groupdatatableHeader: {},
      groupdatalist: {},
      level: 0,
      total: 0,
      patentItem: {},
      formHref: "",
      searchValues: {},
    },
    data() {
      return {
        currentlevel: 0,
        datalist: [],
        pageSize: 10,
      };
    },
    watch: {
      watchgroupDatas() {
        let that = this;
        that.datalist = that.groupdatalist;
      },
    },
    computed: {
      watchgroupDatas() {
        return this.groupdatalist;
      },
    },
    methods: {
      ...mapMutations("app", ["setDataTableGroupParameter"]),
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
          let dataFormat = itemhearder.dataFormat ? itemhearder.dataFormat : 'UserName';
          if (item[itemhearder.value].length > 1) {
            let showValue = "";
            item[itemhearder.value].map((itemData) => {
              showValue = showValue + itemData[dataFormat] + ",";
            });
            showValue = showValue.substr(0, showValue.length - 1);
            return showValue;
          } else if (item[itemhearder.value].length == 1) {
            return item[itemhearder.value][0][dataFormat];
          } else {
            return "";
          }
        } catch (ex) {
          return "";
        }
      },
      clickRow: function (e) {
        if (this.$vuetify.breakpoint.name == "xs") {
          window.open(exportEnvUrl(this.formHref + e._id), (this.schema.target ? this.schema.target : "_blank"));
        }
      },
      dblclickRow: function (e) {
        window.open(exportEnvUrl(this.formHref + e._id), (this.schema.target ? this.schema.target : "_blank"));
      },
      async expandedChildren(item) {
        let that = this;
        //console.log(208, item)

        item.expanded = !item.expanded;
        if (!item.isLoad) {
          let route = this.$route;
          if (route.params.p1 != undefined) {
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
          let PageSize = 99999;
          if(that.schema.groupsLevel == that.currentlevel && that.currentlevel !== 1){
            PageSize = that.pageSize
          }
          var parameter = {
            queryId: that.schema.query.code,
            searchParam: {
              SearchValues: that.searchValues,
              PageSize: PageSize,
              PageIndex: 1,
              Orders: {},
              FieldValues: item.fieldValues,
              Filter: [],
              columns: [],
            },
          };

          that.$axios
            .post("/api/getGroupDataByQueryId", parameter)
            .then(({ data }) => {
              let result = data || [];
              if (result != null) {
                //console.log("grouNextdatalist", result, that.datalist)
                if (result.groups != null && result.groups.length != 0) {
                  result.groups.forEach(function (itemGroup) {
                    itemGroup.isGroup = true;
                    itemGroup.isLoad = false;
                    itemGroup.expanded = true;
                    itemGroup.children = [];
                    if (item.fieldValues != undefined) {
                      itemGroup.fieldValues = item.fieldValues.concat([
                        itemGroup.value,
                      ]);
                    } else {
                      itemGroup.fieldValues = [itemGroup.value];
                    }
                  });
                  that.addChildrenData(
                    that.datalist,
                    item.id,
                    result.groups,
                    "dataGrouplist"
                  );
                } else if (result.lists != null && result.lists.length != 0) {
                  that.addChildrenData(
                    that.datalist,
                    item.id,
                    result.lists,
                    "datalist"
                  );
                }
              }
            })
            .catch((err) => {
              // console.log(err);
            });
        }
        item.isLoad = true;
      },
      //递归遍历数组，直到找到对应的ID字段
      addChildrenData(datas, arrayID, newData, type) {

        let self = this;
        datas.find(function (item, index) {
          if (item.id == arrayID) {
            if (type == "datalist") {
              item.children.push(newData)
              //item.children.push(newData);
            } else {
              item.children = newData;
            }
            return true;
          }
          if (item.children) {
            self.addChildrenData(item.children, arrayID, newData, type);
          }
          return false;
        });
      },
      loadMore(parentItem, currentCount) {
        let that = this;
        var pageIndex = Math.ceil(currentCount / that.pageSize) + 1;
        var apiUrl = "/api/getGroupDataByQueryId";
        let route = this.$route;
        if (route.params.p1 != undefined) {
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
        var parameter = {
          queryId: that.schema.query.code,
          searchParam: {
            SearchValues: that.searchValues,
            PageSize: that.pageSize,
            PageIndex: pageIndex,
            Orders: {},
            fieldValues: parentItem.fieldValues,
            filter: [],
            columns: [],
          },
        };
        that.$axios
          .post(apiUrl, parameter)
          .then(({ data }) => {
            let result = data || [];
            if (result != null) {
              if (result.groups != null) {
              } else {
                that.datalist[0].items = that.datalist[0].items.concat(
                  result.lists.items
                );
              }
            }
          })
          .catch((err) => {
            // console.log(err);
          });
      },
    },
    mounted() {
      var that = this;
      that.currentlevel = that.level + 1;
    },
  };
</script>
<style>
  .datatable-group {
    width: 100% !important;
    table-layout: fixed;
  }

  .datatable-group .data-tr-td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
    padding: 0 10px !important;
    word-break: break-word;
  }

  .datatable-group {
    width: 100% !important;
  }

  .datatable-group-tr-level1 {
    padding-left: 10px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-level2 {
    padding-left: 25px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-level3 {
    padding-left: 45px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-level4 {
    padding-left: 65px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-level5 {
    padding-left: 85px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-level6 {
    padding-left: 85px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-level7 {
    padding-left: 85px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-level8 {
    padding-left: 85px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    height: 48px !important;
  }

  .datatable-group-tr-loadmore {
    background-color: #f0988f !important;
    height: 20px !important;
    cursor: pointer;
  }


  .datatable-group .datatable-group-tr-loadmore p {
    margin-bottom: 0px;
  }

  .datatable-group .item-counts {
    font-style: italic;
  }

  .datatable-group .datatable-group-content-tr:hover {
    background-color: #eee;
  }
  .datatable-group > tbody >tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
    background-color: #eee !important;
  }
  .theme--dark.v-data-table .datatable-group > tbody >tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
    background-color: #616161 !important;
  }
  .datatable-group {
    border-spacing: 0;
  }

  .datatable-group .v-data-table__mobile-row {
      padding:0 16px;
  }

  .datatable-group .v-data-table__mobile-table-row {
    border-bottom: 1px solid #DEDEDE;
    display: block;
  }
  
</style>
