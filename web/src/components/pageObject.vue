<template>
  <div ref="pageObject" :class="settings.objectContainerClass">
    <wrapper v-for="(schema, index) in schemas" :key="index+'_'+timeStamp" :schema="schema" :model="model"
      :options="options" />
  </div>
</template>

<script>
  import _workflow from './utils/workflow';
  import _resource from './utils/resource';
  import {
    getEnv
  } from "../utils/env.js"
  export default {
    props: {
      settings: {
        required: true,
        type: Object,
        validator: mode => ['pageView', 'pageType', 'pageMode', 'pageMode', 'objectContainerClass'].includes(mode)
      }
    },
    mixins: [_workflow, _resource],
    data() {
      return {
        schemas: [],
        model: {},
        options: {},
        timeStamp: '',
        documentResult: null
      }
    },
    watch: {
      "$store.state.embedOrderToLoadJSStatusFlag": {
        handler: function (val) {
          //console.log('embed', val);
          if (val && val[this.settings.pageCode.toLowerCase()] && this.documentResult) {
            this.init()
          }
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      init() {
        // console.log('init', this.documentResult);
        let pageCode = this.settings.pageCode.toLowerCase();
        let pageMode = this.settings.pageMode.toLowerCase();
        this.model = this.documentResult.model;
        this.schemas = this.documentResult.schemas;
        this.$dm.embedModel[pageCode] = this.model;
        this.$dm.embedPageMode[pageCode] = pageMode;
        this.$store.state.embedComponentStatus[pageCode] = {};
        this.$dm_recordComponentSchemas(this.schemas, "embedComponentSchemas", pageCode);
        this.timeStamp = Math.round(new Date().getTime() / 1000);
        if (this.documentResult.styles) {
          let body = this.$refs.pageObject;
          let cssText = document.createTextNode(this.documentResult.styles);
          let style = document.createElement("style");
          style.id = "pageobject-layout-" + pageCode;
          style.setAttribute("scoped", "");
          style.type = "text/css";
          style.innerHTML = "";
          style.appendChild(cssText);
          body.appendChild(style);
        }
      },
      async changeSchemasAndModel(pageCode, pageType, pageMode, docId) {
        await this.getResources(pageCode, pageType, this.$store.getters.cdnHostAndVersionPath,"embed");
        this.getDocumentResult(pageCode, pageType, pageMode, docId);
      },
      getDocumentResult(pageCode, pageType, pageMode, docId) {
        let _this = this;
        let hostUrl = location.origin
        let requestUrl = hostUrl + "/" + _this.$store.state.appInfo.OrganizationCode + "/" + _this.$store.state.appInfo
          .AppCode + "/" + pageType + "/" + pageCode + "/" + pageMode + "/" + (docId ? docId : "") + (getEnv() ?
            "?env=" + getEnv() : "")
        _this.$store.dispatch("actionsGetDocumentResult", {
          pageAlias: pageCode,
          id: docId ? docId : "",
          pageMode: pageMode,
          pageType: pageType,
          hostUrl: hostUrl,
          requestUrl: requestUrl
        }).then(({
          result
        }) => {
          if (result.statusCode == 200) {
            _this.documentResult = result;
            _this.$store.state.embedOrderToLoadJSFlag && !_this.$store.state.embedOrderToLoadJSFlag[pageCode] ?
              _this.init() : null;
          } else {
            _this.$router.push({
              name: "error",
              params: {
                errorCode: result.statusCode
              },
              path: "/systemmessage/:errorCode",
            });
          }

        });
      }
    },
    async created() {
      var self = this;
      if ((self.settings.pageMode == "" || self.settings.pageMode == undefined) && self.settings.pageType
        .toLowerCase() == "page") {
        self.settings.pageMode = "preview"; //兼容用户再使用embed page的时候，没有配置pageMode
      }
      if (self.settings && self.settings.pageCode && self.settings.pageType && self.settings.pageMode) {
        if (self.settings.params) {
          self.options = self.settings.params;
        }
        self.options.loadType = "embed";
        self.options.pageType = self.settings.pageType;
        self.options.pageCode = self.settings.pageCode;
        self.options.pageMode = self.settings.pageMode.toLowerCase();
        self.options.id = self.settings.docId ? self.settings.docId : null;
        if (!self.options.commonMethod) {
          self.options.commonMethod = {};
        }
        self.options.commonMethod.changeSchemasAndModel = async function (pageCode, pageType, pageMode, id) {
          self.options.id = id;
          self.options.pageCode = pageCode;
          self.options.loadType = "embed";
          self.changeSchemasAndModel(pageCode, pageType, pageMode, id);
          self.options.pageMode = pageMode.toLowerCase();
        };
        //anonymous check permission
        let isAnonymous = await this.$store.dispatch("actionsCheckPageAnonymous", {
          pageType: self.settings.pageType,
          pageName: self.settings.pageCode,
          pageMode: self.settings.pageMode
        });
        let canopen = false;
        if (this.$store.state.isAnonymousUser) {
          if (isAnonymous) {
            canopen = true
          } else {
            canopen = false
          }
        } else {
          canopen = true
        }
        if (canopen) {
          await self.changeSchemasAndModel(self.settings.pageCode, self.settings.pageType, self.settings.pageMode,
            self.settings.docId);
        }
      }
    }
  }

</script>

<style scoped>
</style>
