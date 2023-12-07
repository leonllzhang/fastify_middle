<template>
  <div tabindex="0" ref="popupForm" :class="options.classes">
    <v-overlay tabindex="0" :value="dialog" :dark="isDark" z-index="99" :class="{'overlay-width-wrap':!isSetWidth}">
      <v-card max-height="600" :width="options.width">
        <v-toolbar tabindex="0" dark color="deep-orange darken-3" v-if="options.title != undefined">
          <v-toolbar-title tabindex="0">{{options.title}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn tabindex="0" icon dark @click="closePopup">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div tabindex="0" class="popup-form pa-2 popupForm-main">
          <wrapper v-for="(schema, index) in schemas" :key="index" :schema="schema" :model="model"
            :options="subOptions" />
        </div>
      </v-card>
    </v-overlay>
  </div>
</template>

<script>
  import _resource from '../components/utils/resource';
  import evalable from "../components/utils/evalable";
  import {
    mapState
  } from "vuex";
  import {
    getEnv
  } from "../utils/env.js"

  export default {
    name: "popupWrapper",
    inject: ["messageDialog"],
    mixins: [evalable, _resource],
    provide() {
      return {
        popupWrapper: {
          register: registerCallback => {
            if (registerCallback) {
              var opt = this.options;
              registerCallback(opt);
            }
          },
          close: () => {
            this.closePopup();
          },
          outerFn: (data) => {
            this.options.outerFn(data)
          }
        }
      };
    },
    props: {
      options: {
        type: Object,
        required: true
      }
    },
    watch: {
      "$store.state.popupOrderToLoadJSStatusFlag": {
        handler: function (val) {
          //console.log('popup', val);
          val && this.documentResult ? this.init() : null;
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      closePopup() {
        this.$emit("close-popup", this.options.pageView);
      },
      init() {
        let result = this.documentResult;
        let opt = this.options;

        this.model = result.model;
        this.schemas = result.schemas;
        this.$dm.popupModel[opt.pageView.toLowerCase()] = this.model;
        this.$dm.popupPageMode[opt.pageView.toLowerCase()] = opt.pageMode.toLowerCase();
        this.$store.state.popupComponentStatus[opt.pageView.toLowerCase()] = {};
        this.$dm_recordComponentSchemas(this.schemas, "popupComponentSchemas", opt.pageView.toLowerCase());
        if (opt.afterFormLoad && typeof opt.afterFormLoad === "function") {
          opt.afterFormLoad(this.model, this.schemas);
        }

        if (result.styles) {
          let body = this.$refs.popupForm;
          let cssText = document.createTextNode(result.styles);
          let style = document.createElement("style");
          style.id = "custom-layout-" + opt.pageView;
          style.setAttribute("scoped", "");
          style.type = "text/css";
          style.innerHTML = "";
          style.appendChild(cssText);
          body.appendChild(style);
        }
        this.dialog = true;
      },
      getDocumentResult() {
        let _this = this;
        let opt = _this.options;
        let hostUrl = location.origin
        let requestUrl = hostUrl + "/" + _this.$store.state.appInfo.OrganizationCode + "/" + _this.$store.state.appInfo
          .AppCode + "/" + opt.pageType + "/" + opt.pageView + "/" + opt.pageMode + "/" + (opt.id ? opt.id : "") + (
            getEnv() ? "?env=" + getEnv() : "")
        _this.$store.dispatch("actionsGetDocumentResult", {
          pageAlias: opt.pageView,
          id: opt.id ? opt.id : '',
          pageMode: opt.pageMode,
          pageType: opt.pageType,
          hostUrl: hostUrl,
          requestUrl: requestUrl
        }).then(({
          result
        }) => {
          if (result.statusCode == 200) {
            _this.documentResult = result;
            !_this.$store.state.popupOrderToLoadJSFlag ? _this.init() : null;


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
    data() {
      return {
        isDark: false,
        dialog: false,
        model: {},
        schemas: [],
        pageMode: "",
        documentResult: null
      };
    },
    computed: {
      ...mapState(["userInfo"]),
      isSetWidth() {
        return this.options.width && this.options.width != ""
      },
      subOptions() {
        var {
          pageMode,
          pageView,
          pageType,
          loadType,
          id
        } = this.options;
        return {
          pageMode,
          pageView,
          pageType,
          loadType,
          id
        };
      },
    },
    created() {},
    beforeDestroy() {
      var style = document.getElementById(
        "custom-layout-" + this.options.pageView
      );
      if (style) {
        style.remove();
      }
    },
    async mounted() {
      // 弹框初始化开始
      var opt = this.options;
      if (!opt.pageMode || !opt.pageView || !opt.pageType) {
        this.messageDialog.showErr("invalid popup request");
        return;
      }
      this.pageMode = opt.pageMode;
      this.options.loadType = "popup";
      // 首先加载弹框需要的资源
      await this.getResources(this.options.pageView, this.options.pageType, this.$store.getters
        .cdnHostAndVersionPath, this.options.loadType);
      var request = {
        pageAlias: opt.pageView,
        pageMode: opt.pageMode,
        id: opt.id ? opt.id : ''
      };
      if (opt.beforeFormLoad && typeof opt.beforeFormLoad === "function") {
        opt.beforeFormLoad(request);
      }
      this.$store.commit("SET_LOADING", true);
      this.getDocumentResult();
    }
  };

</script>

<style>
  .popup-form {
    background: #fff;
    padding: 24px 0;
    overflow-y: auto;
  }

  .popupForm-main {
    overflow-y: auto;
    max-height: 536px;
  }

  .popup-form .vc-footer,
  .popup-form .vc-toolbar {
    display: none !important;
  }

  .popup-form .vc-form {
    margin: 0;
    padding: 0;
  }

  .popup-form .vc-form .systemContainer {
    max-height: 500px;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .popup-form .vc-form .systemButtonGroup {
    border-top: 1px solid #ddd;
  }

  .overlay-width-wrap .v-overlay__content {
    width: 80%;
  }

</style>
