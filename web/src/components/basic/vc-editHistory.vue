<template>
  <div :class="classes" class="edit-history">
    <v-expansion-panels>
      <v-expansion-panel class="px-2">
        <v-expansion-panel-header expand-icon="pwc-icon pwc-chevrondown-outline"
         class="pa-0">
          <span :style="computeStyle('Label', schema)">{{label}}</span>
        </v-expansion-panel-header>
        <v-divider class="mb-3"></v-divider>
        <v-expansion-panel-content>
          <vc-template v-if="schema.template" :schema="schema" :model="model" />
          <div v-else>
            <table width="100%" cellspacing="0" v-show="records.length">
              <thead>
                <tr>
                  <th tabindex="0" :aria-label="$t('schema-base.editHistory.name')">
                    {{
                      $te("schema-base.editHistory.name")
                        ? $t("schema-base.editHistory.name")
                        : "Name"
                    }}
                  </th>
                  <th tabindex="0" :aria-label="$t('schema-base.editHistory.editDate')">
                    {{
                      $te("schema-base.editHistory.editDate")
                        ? $t("schema-base.editHistory.editDate")
                        : "Edit Date"
                    }}
                  </th>
                  <th tabindex="0" :aria-label="$t('schema-base.editHistory.operation')">
                    {{
                      $te("schema-base.editHistory.operation")
                        ? $t("schema-base.editHistory.operation")
                        : "Operation"
                    }}
                  </th>
                </tr>
              </thead>
              <tbody v-if="records.length>0">
                <tr v-for="(record, i) in records" :key="i">
                  <td tabindex="0" :aria-label="record.creatorName">{{ record.creatorName }}</td>
                  <td tabindex="0"
                    :aria-label="moment(record.time).format($store.state.app.appPerference.GlobalDateFormat)">
                    {{ moment(record.time).format($store.state.app.appPerference.GlobalDateFormat) }}</td>
                  <td tabindex="0" :aria-label="action(record)">{{ action(record)}}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-center ma-2" v-if="totalCount > records.length">
              <v-btn tabindex="0" :aria-label="$t('schema-base.defaultBtns.loadmore')" :loading="loading"
                @click="loadMore">
                {{
            $t("schema-base.defaultBtns.loadmore")
                }}
              </v-btn>
            </div>
            <p v-show="records.length == 0" class="text-center mt-2" tabindex="0"
              :aria-label="$t('schema-base.editHistory.norecordavailable')">
              {{ $t("schema-base.editHistory.norecordavailable") }}</p>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
  import base from "../utils/schema-base";
  import vcTemplate from './vc-template';

  export default {
    mixins: [base],
    components: {
      vcTemplate
    },
    data() {
      return {
        records: [],
        totalCount: 0,
        pageIndex: 1,
        pageSize: this.schema.pageSize ? this.schema.pageSize : 10,
        loading: false,
      }
    },
    computed: {
      label() {
        let labelStr = this.schema.label.replace(/\s+/g, "").toLowerCase()
        return this.$te(this.localeKey + ".label") &&
          this.$t(this.localeKey + ".label") ?
          this.$t(this.localeKey + ".label") :
          this.$te(`schema-base.editHistory.${labelStr}`) ?
          this.$t(`schema-base.editHistory.${labelStr}`) :
          this.schema.label;
      },
      action() {
        return (item) => {
          return this.$te(this.localeKeyForBtn(item.code) + ".label") &&
            this.$t(this.localeKeyForBtn(item.code) + ".label") ?
            this.$t(this.localeKeyForBtn(item.code) + ".label") :
            this.$te(`schema-base.defaultBtns.${item.action.toLowerCase()}`) ?
            this.$t(`schema-base.defaultBtns.${item.action.toLowerCase()}`) :
            item.action;
        }
      }
    },
    created() {
      let isNew = Boolean
      if (this.options && this.options.pageMode) {
        isNew = this.options.pageMode.toLowerCase() == 'add'
      } else {
        isNew = this.isNew
      }
      if (!isNew) {
        this.init();
      }

      if (!this.schema.hasOwnProperty('label')) {
        this.$set(this.schema, 'label', "Edit history")
      }
    },
    methods: {
      localeKeyForBtn(name) {
        //此处需要判断是否在pageobject中，在的话，需要从options 
        if (this.$route && this.$route.name && this.$route.name.toLowerCase() == 'view') {
          return `${(this.options && this.options.pageType ? this.options.pageType : this.$store.state.app.currentpagetype) + "_" + (this.options && this.options.pageCode? this.options.pageCode: this.$store.state.app.navigationDrawerActiveItem.viewAlias.toLowerCase())}.${name}`;
        } else {
          return `${(this.options && this.options.pageType ? this.options.pageType : this.$store.state.app.currentpagetype) + "_" + (this.options && this.options.pageCode?  this.options.pageCode: this.pageView.toLowerCase())}.${name}`;
        }
      },
      init() {
        let pageView = this.options.pageView || this.schema.pageCode || this.$route.params.pageView
        this.$axios.post("/api/GetResult", {
          requestURL: pageView + '/doc/' + this.model._id + '/history/' + this.pageIndex + '/' + this.pageSize
        }).then(({
          data
        }) => {
          if (data.items) {
            this.records = this.records.concat(data.items);
            this.totalCount = data.totalCount;
          }
          this.loading = false;
        });
      },
      loadMore() {
        this.loading = true;
        this.pageIndex++;
        this.init();
      }
    }
  }

</script>
<style>
  .edit-history {
    font-size: 14px;
    margin: 12px 0;
  }
 
  .preview-wrapper .edit-history thead {
    background: #e0e0e0;
  }

  .theme--dark.v-application .preview-wrapper .edit-history thead {
    background: #2d2d2d;
  }

  .edit-history .v-expansion-panel:before {
    box-shadow: none;
    border-radius: 0;
  }

  .edit-history .theme--light.v-expansion-panels .v-expansion-panel {
    background-color: unset;
  }

  .edit-history .v-expansion-panel--active .v-expansion-panel-header {
    min-height: 48px;
  }

  .edit-history .v-expansion-panel-header {
    border-radius: 0;
    padding: 0 8px;
    font-size: 16px;
  }

  .edit-history .v-expansion-panel-content__wrap {
    padding: 0;
  }

  .edit-history table {
    border: solid 1px rgba(0, 0, 0, 0.12);
    padding: 0;
  }

  .edit-history table>thead>tr>th {
    padding: 16px;
    text-align: left;
  }

  .edit-history table>tbody>tr>td {
    padding: 16px;
    border-top: solid 1px rgba(0, 0, 0, 0.12);
  }

</style>
