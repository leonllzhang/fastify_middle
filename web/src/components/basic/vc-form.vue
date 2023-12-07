<template>
  <v-form @submit="submit" ref="vcForm" v-model="isValid" class="vc-form" :class="schema.classes" :style="schema.style">
    <wrapper v-for="(subschema, index) in schema.schemas" :key="index" :schema="subschema" :model="model"
      :options="subOptions" />
  </v-form>
</template>

<script>
  import base from "../utils/schema-base";
  import {
    getParameterByName,
    exportEnvUrl,
    getEnv
  } from "../../utils/env";
  export default {
    mixins: [base],
    data() {
      return {
        returnUrl: "",
      };
    },
    inject: {
      popupWrapper: {
        default: {
          register() {},
          close() {},
        },
      },
      messageDialog: {
        default: {
          showMsg() {},
          showErr() {},
          showOptions() {},
        },
      },
      popupForm: {

      }
    },
    provide() {
      return {
        vcForm: {
          setAction: (action) => {
            this.action = action || "save";
          },
          setCode: (code) => {
            this.code = code;
          },
          setafterSubmit: (script) => {
            //转换为函数
            this.afterSubmit = script; //this.generateFunction(script);
          },
          validate: () => {
            return this.$refs.vcForm.validate();
          },
          reset: () => {
            return this.$refs.vcForm.reset();
          },
          setButtonType: (type) => {
            this.buttonType = type;
          },
          setClickErr: (err) => {
            this.clickErr = err;
          },
          setButtonCodeSnippetFlag: (status) => {
            this.hasCodeSnippet = status;
          },
          setPopup: (enablePopup) => {
            this.Popup = enablePopup;
          },
          submit: this.submit,
          isCurrentPageView: this.isCurrentPageView,
          pageView: this.pageView
        },
      };
    },
    created() {
      if (!this.isCurrentPageView) {
        this.popupWrapper.register(this.registerCallback);
        //When the loadType is embed, the pageMode is already assigned via wrapper options property
      } else if(this.options.loadType != 'embed') {
        this.options.pageMode =  this.$route.name.toLowerCase();
      }
      
      this.options.pageView = this.pageView;
      this.options.pageType = "form";
    },
    mounted() {
      let _this = this;
      let pageCode = _this.options && _this.options.pageView ? _this.options.pageView.toLowerCase() : "";
      if (_this.options && _this.options.loadType == 'embed') {
        _this.$dm.vcEmbedForm[_this.options.pageView] = _this.$refs.vcForm;

        _this.$dm.embedForm[_this.options.pageView] = {};
        _this.$dm.embedForm[_this.options.pageView].reset = function () {
          for (var cur in _this.$dm.embedComponentSchemas[_this.options.pageView]) {
            let currentSchema = _this.$dm.embedComponentSchemas[_this.options.pageView][cur];
            let componentModelName = currentSchema.model || currentSchema.name || "";
            _this.$dm.empty(componentModelName, "embed", _this.options.pageView);
          }
          _this.$dm.vcEmbedForm[_this.options.pageView].reset();
        }

        _this.$dm.embedForm[_this.options.pageView].validate = function () {
          _this.$dm.vcEmbedForm[_this.options.pageView].validate();
        }
        _this.$dm.embedForm[_this.options.pageView].resetValidation = function () {
          _this.$dm.vcEmbedForm[_this.options.pageView].resetValidation();
        }

        if (_this.$store.state.popupComponentStatus[pageCode] == undefined) {
          _this.$store.state.popupComponentStatus[pageCode] = {};
        }
      } else if (_this.options && _this.options.loadType == 'popup') {
        _this.$dm.vcPopupForm[_this.options.pageView] = _this.$refs.vcForm;
        
        _this.$dm.popupForm[_this.options.pageView] = {};
        _this.$dm.popupForm[_this.options.pageView].reset = function () {
          for (var cur in _this.$dm.popupComponentSchemas[_this.options.pageView]) {
            let currentSchema = _this.$dm.popupComponentSchemas[_this.options.pageView][cur];
            let componentModelName = currentSchema.model || currentSchema.name || "";
            _this.$dm.empty(componentModelName, "popup", _this.options.pageView);
          }
          _this.$dm.vcPopupForm[_this.options.pageView].reset();
        }
        _this.$dm.popupForm[_this.options.pageView].validate = function () {
          _this.$dm.vcPopupForm[_this.options.pageView].validate();
        }
        _this.$dm.popupForm[_this.options.pageView].resetValidation = function () {
          _this.$dm.vcPopupForm[_this.options.pageView].resetValidation();
        }

        if (_this.$store.state.popupComponentStatus[pageCode] == undefined) {
          _this.$store.state.popupComponentStatus[pageCode] = {};
        }
      } else {
        _this.$dm.vcForm = _this.$refs.vcForm;
      }      
    },
    data() {
      return {
        isValid: false,
        action: "save",
        code:"saveButton",
        beforeFormSubmit: null,
        afterFormSubmit: null,
        pageMode: null,
        afterSubmit: null,
        Popup: true,
        returnResult: null,
        buttonType: "system",
        hasCodeSnippet: false,
        popup:{},
        clickErr:false
      };
    },
    watch:{
      "$store.state.app.popups": {
         handler:function(val){
            if(val && val.length>0){
              let popupObj = val.filter(el=>el.pageView.toLowerCase() == this.pageView.toLowerCase())
              this.popup = popupObj.length>0 ? popupObj[0] : []
            }
         },
         immediate:true,
         deep:true
      }
    },
    methods: {
      swithPageMode(id){
        let obj = this.popup
        obj.pageMode = "Preview" 
        obj.id = id
        this.popupForm.swithPageMode(obj);
      },
      redirect() {
        if (this.returnUrl && this.returnUrl != "") {
          let url = this.returnUrl
          if (this.returnUrl.indexOf("env") == -1) {
            let env = getParameterByName("env")
            if(env){
              if(this.returnUrl.indexOf("?")>-1){
                url = url + "&env="+env
              }else{
                url = url + "?&env="+env
              }
            }
          }
          window.top.location.href = url;
          return;
        }
        window.top.location.href = exportEnvUrl(this.getUrl(this.model._id));
      },
      getUrl(id){
        var params = ["p1", "p2", "p3", "p4", "p5"]
            .map((s) => this.$route.params[s])
            .filter((v) => v);
        let pageMode = this.options.pageMode == "delegate"?"delegate": "preview";
        let _url = ""
        if(window.urlMode == 'NOTENANTAPPCODE') {
          _url = window.location.pathname
          .split("/")
          .splice(0, 1)
          .concat([
            "form",
            this.$route.params.pageView,
            pageMode,
            id,
            ...params,
          ])
          .join("/")
        }else{
          _url = window.location.pathname
          .split("/")
          .splice(0, 3)
          .concat([
            "form",
            this.$route.params.pageView,
            pageMode,
            this.model._id,
            ...params,
          ])
          .join("/")
        }
        return _url
      },
      registerCallback({
        beforeFormSubmit,
        afterFormSubmit,
        pageMode
      }) {
        this.beforeFormSubmit = beforeFormSubmit;
        this.afterFormSubmit = afterFormSubmit;
        this.pageMode = this.options.pageMode = pageMode.toLowerCase();
      },
      submit(e) {
        e && e.preventDefault();
        
        if(this.clickErr) return 
        
        if (!this.$refs.vcForm.validate()) {
          let self = this;
          setTimeout(function () {            
            var doms = window.document.getElementsByClassName("error--text")[0];
            self.$vuetify.goTo(doms, {
              duration: 500,
              offset: 500,
              easing: "easeInQuad",
            });
          }, 500);

          this.$store.commit("app/setbuttonLoading", false);
          return;
        }
        return setTimeout(() => {
          if (!this.hasCodeSnippet && this.buttonType == "custom") {
            this.$store.commit("app/setbuttonLoading", false);
            return;
          }
          this.submitForm();
        }, 100)
      },
      async submitForm() {
        if (
          this.beforeFormSubmit &&
          typeof this.beforeFormSubmit === "function"
        ) {
          this.beforeFormSubmit(this.model);
        }
        //过滤掉不往后传递的字段
        var finalUpdateModel = this.model;

        if (
          this.$store.state.app.formFieldsSettings &&
          this.$store.state.app.formFieldsSettings[this.pageView] &&
          this.$store.state.app.formFieldsSettings[this.pageView][this.model._id]
        ) {
          let notupdateFields = this.$store.state.app.formFieldsSettings[
            this.pageView
          ][this.model._id];
          if (notupdateFields) {
            for (let key in this.model) {
              if (notupdateFields.indexOf(key) >= 0) {
                delete finalUpdateModel[key];
              }
            }
          }
        }
        let result = await this.$dm_submitDocument({
          pageMode: this.options.pageMode,
          pageAlias: this.pageView,
          code: this.code,
          model: finalUpdateModel
        }).catch(err => {
          switch (err.error.code) {
            case "Concurrency_Error":
              this.messageDialog.showErr(this.$t("schema-base.rules.ModifiedDocumentErrorMsg"));
              break;
            default:
              this.messageDialog.showErr(err.error.message);
              break;
          }
          return err;
        });

        this.$store.commit("app/setbuttonLoading", false);
        //如果请求异常了，则不继续往执行
        if (!(result.data && result.data.success)) {
          return;
        }
        if (this.buttonType == "system") {
          //系统button单独处理吧
          if (result.data && result.data.success) {
            await this.messageDialog.showMsg(
              "Dcoument has beed successfully saved."
            );
            if (this.isCurrentPageView) {
              return this.redirect();
            } else {
              if (
                this.afterFormSubmit &&
                typeof this.afterFormSubmit === "function"
              ) {
                this.model.Ng_ConcurrencyStamp = result.data.concurrencyStamp;
                this.afterFormSubmit(this.model, result.data);
              }
              if (this.action == 'save') {
                if (this.options.loadType == 'embed') {
                  //pageobject or vc-wrapper-form
                  this.options.commonMethod.changeSchemasAndModel(this.pageView, "form", "preview", result.data
                    .dataId);
                } else {
                  //popup form
                  this.swithPageMode(result.data.dataId)
                }
              }
            }
          } else {
            switch (result.data.error.code) {
              case "Concurrency_Error":
                this.messageDialog.showErr(this.$t("schema-base.rules.ModifiedDocumentErrorMsg"));
                break;
              default:
                this.messageDialog.showErr(result.data.errorMsg);
                break;
            }
            return;
          }
        } else {
          //custom button 和 workflow 的处理逻辑
          //成功
          if (result.data.success) {
            //正常的form 的
            if (result.data.result && Object.keys(result.data.result.updateFieldData).length) {
              //处理updateFieldData向model 赋值,customData是用户自己添加的。
              this.setModelWithUpdateFieldData(
                result.data.result.updateFieldData
              );
            }
            let msgTitle = "";
            let msgContent = "";
            if (
              result.data.result &&
              (result.data.result.msgTitle || result.data.result.msgContent)
            ) {
              //处理自定义弹窗
              //在dialog上已经有默认值
              msgTitle = result.data.result.msgTitle;
              msgContent = result.data.result.msgContent;
            }
            if (this.Popup) {
              if (this.options.pageMode == "delegate") {
                await this.messageDialog.showMsg({
                  title: this.$t('vc.form.title'),
                  message: this.$t('vc.form.delegateMessage')
                })
              }
              else {
                await this.messageDialog.showMsg({
                  title: msgTitle,
                  message: msgContent,
                });
              }             
              //这是阻断的              
            }
            //处理customdata
            if (result.data.result && result.data.result.customData) {
              this.model.customData = result.data.result.customData;
            }         
            //判断dataid 和 redirectUrl
            if (result.data.result && result.data.result.dataId) {
              this.redirectToDataId(result.data.result.dataId);
            } else if (result.data.result && result.data.result.redirectUrl) {
              this.redirectByUrl(result.data.result.redirectUrl);
            }else {
              this.excuteafterSubmit(result.data);
            }
            //处理包装form的
            if (!this.isCurrentPageView) {
              if (
                this.afterFormSubmit &&
                typeof this.afterFormSubmit === "function"
              ) {
                this.model.Ng_ConcurrencyStamp = result.data.concurrencyStamp;
                this.afterFormSubmit(this.model, result.data);
              }
              if ((this.returnUrl && this.returnUrl.length>0) || this.buttonType == "workflow") {
                if (this.options.loadType == 'embed') {
                  return this.options.commonMethod.changeSchemasAndModel(this.pageView, "form", "preview", result.data
                    .dataId);
                } else {
                  return this.swithPageMode(result.data.dataId);
                }

                //return this.redirect();
              }
              // this.popupWrapper.close();
            } else {
              //workflow button多一个自动跳转的逻辑,然后custombutton也有returnUrl时候，也会跳转。
              if ((this.returnUrl != undefined && this.returnUrl != null && this.returnUrl != '') || this
                .buttonType == "workflow") {
                return this.redirect();
              }
            }
            
          } else {
            //失败, c# 错误是有errorMsg，否则其他错误赋值错误消息默认值
            if (!result.data.errorMsg) {
              result.data.errorMsg = this.$t("error.systemErrorDetail");
            }
            if (this.Popup) {
              await this.messageDialog.showErr(result.data.errorMsg);
              this.excuteafterSubmit(result.data);
            } else {
              this.excuteafterSubmit(result.data);
            }
          }
        }
      },
      setModelWithUpdateFieldData(fieldData) {
        this.model = {
          ...fieldData
        };
      },
      redirectToDataId(dataId) {
        if (this.isCurrentPageView) {
          this.returnUrl = exportEnvUrl(this.getUrl(dataId));
        } else {
          this.swithPageMode(dataId);
        }
      },
      redirectByUrl(redirectUrl) {
        this.returnUrl = redirectUrl;
      },
      excuteafterSubmit(result) {
        this.returncode = result;
        this.returnResult = result;
        let func = this.generateFunction(this.afterSubmit);
        if (func) {
          func();
        }
      },
    },
    computed: {
      pageView() {
        return this.schema.pageView || this.$route.params.pageView;
      },
      isCurrentPageView() {
        return (
          this.pageView.toLowerCase() ===
          (this.$route.params.pageView || "home").toLowerCase()
        );
      },
      subOptions() {
        if (this.options && this.options.hasOwnProperty("id")) {
          this.schema.options = Object.assign(this.schema.options, this.options);
        }
        //原来的赋值有问题。this.schema.options 有值就不往下传递了。需要this.options里面的值要往下传递，
        //return this.schema.options || this.options;
        return Object.assign({}, this.options, this.schema.options);
      }
    }
  };

</script>

<style>
  .vc-form {
    /* background: #fff; */
    /* padding: 12px 0; */
    margin-bottom: 60px;
  }

</style>
