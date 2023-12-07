/**
 * @description 公共方法的定义
 * @author Eason Dong
 * @datetime 2021-12-20
 * @Changlog 
 * add switchLanguage
 * change time: 2022-07-18
 * 
 * add moment, bus, $vuetify, applicaiotnInfo, currentUser, currentLanguage, env, tenantId, appCode, host, cdnHost, lodash
 * change time: 2022-02-14
 * @version 1.4
 */

import Vue from 'vue'
import { getDomainName } from './appBaseMethods'

export default {
  install(Vue, options) {
    Vue.prototype.$dm = {};
    Vue.prototype.$dialog = {
      DEFAULT: 'primary',
      INFO: 'primary',
      PRIMARY: 'primary',
      SUCCESS: 'success',
      WARNING: 'warning',
      DANGER: 'danger'
    };
    Vue.prototype.$dm.dmThis = null;
    Vue.prototype.$dm.model = null;
    Vue.prototype.$dm.embedModel = {};
    Vue.prototype.$dm.popupModel = {};
    Vue.prototype.$dm.componentSchema = {};
    Vue.prototype.$dm.popupComponentSchemas = {};
    Vue.prototype.$dm.embedComponentSchemas = {};
    Vue.prototype.$dm.pageMode = null;
    Vue.prototype.$dm.popupPageMode = {};
    Vue.prototype.$dm.embedPageMode = {};
    Vue.prototype.$dm.form = {};
    Vue.prototype.$dm.form.reset = null;
    Vue.prototype.$dm.popupForm = {};
    Vue.prototype.$dm.embedForm = {};
    Vue.prototype.$dm.dmDialog = {};

    Vue.prototype.$dm.vcForm = null;
    Vue.prototype.$dm.vcPopupForm = {};
    Vue.prototype.$dm.vcEmbedForm = {};

    Vue.prototype.$dm.moment = null;
    Vue.prototype.$dm.bus = null;
    Vue.prototype.$dm.$vuetify = null;
    Vue.prototype.$dm.applicaiotnInfo = null;
    Vue.prototype.$dm.currentUser = null;
    Vue.prototype.$dm.defaultLanguage = 'en';
    Vue.prototype.$dm.env = null;
    Vue.prototype.$dm.tenantId = null;
    Vue.prototype.$dm.appCode = null;
    Vue.prototype.$dm.host = null;
    Vue.prototype.$dm.cdnHost = null;
    Vue.prototype.$dm._debounceQueryFilterFunc = null;
    Vue.prototype.$dm.currentPageType = "";    
    //$dm挂载于window，以便外部js调用公用方法
    window.$dm = Vue.prototype.$dm; 
    Vue.prototype.$dm.getVariable = function(key){
      let _this = this
      let variables = _this.dmThis.$store.state.variables
      if(variables){
        let valArr = variables.filter(e=>e.key == key)
        return valArr && valArr.length>0 ? valArr[0].value : ""
      }
      return ""
    }

    Vue.prototype.$dm.getDomainName = getDomainName

    Vue.prototype.$dm.openPickerDialog = function({pickerType,componentCode, data, callbackFn, dataMode, pageCode}){
      if(!pickerType) return 

      let _this = this
      switch(pickerType){
        case "peoplepicker":
          pickerType = "toggle_peoplepicker"
          break
        case "datapicker":
          pickerType = "open_datapicker"
          break
        default:
          pickerType = "toggle_peoplepicker"
          break;
      }

      let pageView = pageCode ? pageCode.toLowerCase() : (this.dmThis.$route.params.pageView.toLowerCase() || "home")
      let currentSchema = _this._getCurrentSchema(componentCode, dataMode, pageCode);
      let currentComponentCode = currentSchema.name + pageView
      
      _this.bus.$emit(`${pickerType}_${currentComponentCode}`, {
        'data': data,
        'callbackFn': callbackFn
      });
    }

    Vue.prototype.$dm.getValue = function (componentCode, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      let currentSchema = _this._getCurrentSchema(componentCode, dataMode, pageCode);
      if (currentSchema == undefined) {
        return;
      }
      let componentModelName = currentSchema.model || currentSchema.name || "";
      if (componentModelName == "") {
        return;
      }
      let dataType = currentSchema && currentSchema.dataType ? currentSchema.dataType.toLowerCase() : '';
      let internalModel = _this._getCurrentModel(dataMode, pageCode);
      let dataFormat = currentSchema.defaultDateFormat ? currentSchema.defaultDateFormat : _this.dmThis.$store.state.app.appPerference.GlobalDateFormat;
      switch (dataType) {
        case "datetime":
          //时间格式默认返回字符串格式的内容
          return _this.dmThis.moment(internalModel[componentModelName]).format(dataFormat);
          break;
        case "datetimerange":
          //时间范围格式默认返回字符串格式的内容
          const dateRangeComponent= internalModel[componentModelName];
          return dateRangeComponent.map(item => _this.dmThis.moment(item).format(dataFormat));
          break;
        case "html":
          if (currentSchema.component == "vc-html") {
            let _find = require('lodash/find')
            let currentContent = _find(currentSchema.htmlData, function (o) {
              return o.code == _this.dmThis.$i18n.locale;
            });
            if (currentContent) {
              return currentContent.content;
            } else {
              return '';
            }
          } else {
            return internalModel[componentModelName];
          }
          break;
        default:
          return internalModel[componentModelName];
          break;
      }
    }

    Vue.prototype.$dm.setValue = function (obj, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      let internalModel = _this._getCurrentModel(dataMode, pageCode);
      let delayTime = 300;
      for (let key in obj) {
        let currentSchema = _this._getCurrentSchema(key, dataMode, pageCode);
        if (currentSchema == undefined) {
          continue;
        }
        let componentModelName = currentSchema.model || currentSchema.name || "";
        if (componentModelName == "") {
          continue;
        }
        let dataType = currentSchema && currentSchema.dataType ? currentSchema.dataType.toLowerCase() : '';
        let dataFormat = currentSchema.defaultDateFormat ? currentSchema.defaultDateFormat : _this.dmThis.$store.state.app.appPerference.GlobalDateFormat;
        switch (dataType) {
          case "datetime":
            //时间格式需要兼容用户填写string类型的时间格式，需要按照schema中dataFormat格式来格式化string的时间数据格式
            if (typeof obj[key] === "string") {
              let numberVal = _this.dmThis.moment(obj[key], dataFormat).unix() * 1000;
              Vue.set(internalModel, componentModelName, numberVal);
            } else if (typeof obj[key] === "number") {
              Vue.set(internalModel, componentModelName, obj[key]);
            } else {
              Vue.set(internalModel, componentModelName, obj[key]);
            }
            break;
          case "datetimerange":
            //时间格式需兼容用户填写string类型的时间格式（按照schema中dataFormat格式来格式化string的时间数据格式）
            //时间数兼容0、1、2
            if(Array.isArray(obj[key]) && obj[key].length >=1){
              if (typeof obj[key][0] === "string") {
                let numberVal =  obj[key].map(obj => _this.dmThis.moment(obj, dataFormat).unix() * 1000);
                Vue.set(internalModel, componentModelName, numberVal);
              } else if (typeof obj[key][0] === "number") {
                let numberVal =  obj[key].map(obj => _this.dmThis.moment(obj, dataFormat).unix() * 1000);
                Vue.set(internalModel, componentModelName, numberVal);
              } else {
                Vue.set(internalModel, componentModelName, obj[key]);
              }
            } else {
              Vue.set(internalModel, componentModelName, obj[key]);
            }
            break;
          case "html":
            if (currentSchema.component == "vc-html") {
              Vue.set(currentSchema, "htmlData", obj[key]);
            } else {
              Vue.set(currentSchema, "insertContentByExternal", true);
              Vue.set(internalModel, componentModelName, obj[key]);
              setTimeout(function () {
                Vue.set(currentSchema, "insertContentByExternal", false);
              }, 500);
            }
            break;
          case "keyvaluepairs":
            let id = currentSchema.query.code;
            let setValue = obj[key];
            let newValue = [];
            //有数据的时候，才发起请求数据接口，然后换取对应的数据
            if (setValue && setValue.length > 0) {
              //调用接口获取对应的数据，然后替换为key,value对应的数据，再进行赋值
              switch (currentSchema.query.type) {
                case "custom":
                  if (currentSchema.query.customQueryList) {
                    currentSchema.query.customQueryList.forEach(function (item) {
                      for (let keyIndex in setValue) {
                        if (item["value"] && item["key"] && item["key"].toLowerCase() == setValue[keyIndex].toLowerCase()) {
                          var newSelectItem = {};
                          newSelectItem["value"] = item["value"];
                          newSelectItem["key"] = item["key"];
                          newValue.push(newSelectItem);
                        }
                      }
                    })
                    if (currentSchema.query.queryKey) {
                      setTimeout(function () {
                        Vue.set(internalModel, componentModelName, newValue);
                      }, delayTime)
                      delayTime = delayTime + delayTime;
                    } else {
                      Vue.set(internalModel, componentModelName, newValue);
                    }
                  }
                  break;
                case "list":
                  var cache = _this.dmThis.$store.state.app.listQueryCache[id];
                  if (cache) {
                    cache.then(data => {
                      // (2.2) response returned and passed to the control                      
                      data.forEach(function (item) {
                        for (let keyIndex in setValue) {
                          if (item["value"] && item["key"] && item["key"].toLowerCase() == setValue[keyIndex].toLowerCase()) {
                            var newSelectItem = {};
                            newSelectItem["value"] = item["value"];
                            newSelectItem["key"] = item["key"];
                            newValue.push(newSelectItem);
                          }
                        }
                      })
                      //console.log("cache newValue " + pageCode + dataMode, newValue);
                      if (currentSchema.query.queryKey) {
                        setTimeout(function () {
                          Vue.set(internalModel, componentModelName, newValue);
                        }, delayTime)
                        delayTime = delayTime + delayTime;
                      } else {
                        Vue.set(internalModel, componentModelName, newValue);
                      }
                    });
                  } else {
                    var requestURL = `datasource/${id}/detail`;
                    _this.dmThis.$axios.post("/api/GetResult", {
                      requestURL: requestURL
                    }).then(({
                      data
                    }) => {
                      //console.log('data', data);
                      data.forEach(function (item) {
                        for (let keyIndex in setValue) {
                          if (item["value"] && item["key"] && item["key"].toLowerCase() == setValue[keyIndex].toLowerCase()) {
                            var newSelectItem = {};
                            newSelectItem["value"] = item["value"];
                            newSelectItem["key"] = item["key"];
                            newValue.push(newSelectItem);
                          }
                        }
                      })
                      //console.log("newValue " + pageCode + dataMode, newValue);
                      if (currentSchema.query.queryKey) {
                        setTimeout(function () {
                          Vue.set(internalModel, componentModelName, newValue);
                        }, delayTime)
                        delayTime = delayTime + delayTime;
                      } else {
                        Vue.set(internalModel, componentModelName, newValue);
                      }


                    }).catch(err => {
                      console.log('error', err);
                    });
                  }
                  break;
                case "form":
                  let currentQuery = currentSchema.query;
                  if (currentQuery.code && currentQuery.searchValues) {
                    var searchValues = {};
                    for (let skey in currentQuery.searchValues) {
                      if (internalModel[currentQuery.searchValues[skey]]) {
                        if (Array.isArray(internalModel[currentQuery.searchValues[skey]])) {
                          searchValues[skey] = internalModel[currentQuery.searchValues[skey]].join("|Ng|");
                        } else {
                          searchValues[skey] = internalModel[currentQuery.searchValues[skey]];
                        }
                      }
                    }
                    _this.dmThis.$axios.post("/api/getDocumentsByQuery/" + id, {
                      searchValues,
                      PageSize: currentQuery.pageSize || 10,
                      PageIndex: currentQuery.pageIndex || 1,
                      Orders: currentQuery.orders || {}
                    }).then(({
                      data
                    }) => {
                      //console.log('data', data.items);
                      data.items.forEach(function (item) {
                        for (let keyIndex in setValue) {
                          if (item[currentSchema.itemText] && item[currentSchema.itemValue] && item[currentSchema.itemValue].toLowerCase() == setValue[keyIndex].toLowerCase()) {
                            var newSelectItem = {};
                            newSelectItem["value"] = item[currentSchema.itemText];
                            newSelectItem["key"] = item[currentSchema.itemValue];
                            newValue.push(newSelectItem);
                          }
                        }
                      })
                      if (currentSchema.query.queryKey) {
                        setTimeout(function () {
                          Vue.set(internalModel, componentModelName, newValue);
                        }, delayTime)
                        delayTime = delayTime + delayTime;
                      } else {
                        Vue.set(internalModel, componentModelName, newValue);
                      }

                    }).catch(err => {
                      console.log('error', err);
                    });
                  }
                  break;
                case "boolean":
                  Vue.set(internalModel, componentModelName, obj[key]);
                default:
                  break;
              }
            }
            break;
          case "file":
            break;
          default:
            Vue.set(internalModel, componentModelName, obj[key]);
            break;
        }
      }
    }

    Vue.prototype.$dm.empty = function (obj, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      if (typeof obj === "object") {
        for (let key in obj) {
          _this._emptyFieldValue(obj[key], dataMode, pageCode);
        }
      } else {
        _this._emptyFieldValue(obj, dataMode, pageCode);
      }
    }

    Vue.prototype.$dm.setValidation = function (obj, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      let pageMode = '';
      if (dataMode && dataMode == "embed") {
        pageMode = pageCode ? _this.embedPageMode[pageCode] : "";
        pageCode ? _this.vcEmbedForm[pageCode].resetValidation() : null;
      } else if (dataMode && dataMode == "popup") {
        pageMode = pageCode ? _this.popupPageMode[pageCode] : "";
        pageCode ? _this.vcPopupForm[pageCode].resetValidation() : null;
      } else {
        _this.form.resetValidation();
        pageMode = _this.pageMode;
      }
      if (pageMode.toLowerCase() == 'preview') {
        console.log('we don\'t support it in preview mode.');
        return;
      }

      for (let key in obj) {
        let currentSchema = _this._getCurrentSchema(key, dataMode, pageCode);
        if (currentSchema == undefined)
          continue;
        Vue.set(currentSchema, "required", obj[key]);
      }
    }
    //针对自定义button去除部分验证功能的使用扩充
    Vue.prototype.$dm.setValidationWithoutReset = function (obj, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      let pageMode = '';
      if (dataMode && dataMode == "embed") {
        pageMode = pageCode ? _this.embedPageMode[pageCode] : "";
      } else if (dataMode && dataMode == "popup") {
        pageMode = pageCode ? _this.popupPageMode[pageCode] : "";
      } else {
        // 长沙项目中由于自定义button去掉部分验证功能控制台报错T000177,去掉resetValidation
        pageMode = _this.pageMode;
      }
      if (pageMode.toLowerCase() == 'preview') {
        console.log('we don\'t support it in preview mode.');
        return;
      }

      for (let key in obj) {
        let currentSchema = _this._getCurrentSchema(key, dataMode, pageCode);
        if (currentSchema == undefined)
          continue;
        Vue.set(currentSchema, "required", obj[key]);
      }
    }

    Vue.prototype.$dm.show = function (obj, dataMode, pageCode) {
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      this._setShowOrHide(obj, dataMode, true, pageCode);
    }

    Vue.prototype.$dm.hide = function (obj, dataMode, pageCode) {
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      this._setShowOrHide(obj, dataMode, false, pageCode);
    }

    Vue.prototype.$dm.enable = function (obj, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      let pageMode = '';
      if (dataMode && dataMode == "embed") {
        pageMode = pageCode ? _this.embedPageMode[pageCode] : "";
      } else if (dataMode && dataMode == "popup") {
        pageMode = pageCode ? _this.popupPageMode[pageCode] : "";
      } else {
        pageMode = _this.pageMode;
      }
      if (pageMode.toLowerCase() == 'preview') {
        console.log('we don\'t support it in preview mode.');
        return;
      }

      this._setEnableOrDisable(obj, dataMode, false, pageCode);
    }

    Vue.prototype.$dm.disable = function (obj, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }
      let pageMode = '';
      if (dataMode && dataMode == "embed") {
        pageMode = pageCode ? _this.embedPageMode[pageCode] : "";
      } else if (dataMode && dataMode == "popup") {
        pageMode = pageCode ? _this.popupPageMode[pageCode] : "";
      } else {
        pageMode = _this.pageMode;
      }
      if (pageMode.toLowerCase() == 'preview') {
        console.log('we don\'t support it in preview mode.');
        return;
      }

      this._setEnableOrDisable(obj, dataMode, true, pageCode);
    }

    Vue.prototype.$dm.getPageMode = function (dataMode, pageCode) {
      let _this = this;
      let pageMode = '';
      if (dataMode && pageCode && dataMode == "embed") {
        pageMode = pageCode ? _this.embedPageMode[pageCode] : "";
      } else if (dataMode && pageCode && dataMode == "popup") {
        pageMode = pageCode ? _this.popupPageMode[pageCode] : "";
      } else {
        pageMode = _this.pageMode;
      }
      return pageMode;
    }

    Vue.prototype.$dm.setbuttonLoading = function (flag) {
      this.dmThis.$store.commit("app/setbuttonLoading", flag);
    }

    Vue.prototype.$dm.setPageLoading = function (flag) {
      this.dmThis.$store.state.loading = flag;
    }

    Vue.prototype.$dm.getGuid = function () {
      return this.dmThis.$dm_getGuid();
    }

    Vue.prototype.$dm.getObjectId = function () {
      return this.dmThis.$dm_getObjectId();
    }

    Vue.prototype.$dm.getCurrentLanguage = function () {
      return window.ls.get(`${this.dmThis.$store.state.appInfo.ApplicationCode}@language@runtime`) || this.defaultLanguage;
    }
    
    // 获取语言列表
    Vue.prototype.$dm.getLanguageList = function () {
      return this.dmThis.$store.state.app.appPerference.AvaiableLanguage
    }

    // 获取avatar
    Vue.prototype.$dm.getAvatar = function () {
      return this.dmThis.$store.state.userInfo.avatar
    }

    // 获取Version
    Vue.prototype.$dm.getVersion = function () {
      return this.dmThis.$store.state.version
    }

    //弹窗相关封装
    Vue.prototype.$dm.showDmDialog = function ({
      title,
      message,
      type = Vue.prototype.$dialog.PRIMARY,
      buttons,
      classes
    }) {
      return this.dmThis.showDmDialog({
        title,
        message,
        type,
        buttons,
        classes
      });
    }

    Vue.prototype.$dm.alert = function ({
      title,
      message,
      type = Vue.prototype.$dialog.PRIMARY,
      classes
    }) {
      return this.dmThis.showDmDialog({
        title,
        message,
        type,
        buttons: [{
          code: 'ok',
          label: 'ok',
          color: Vue.prototype.$dialog.PRIMARY,
          action: function () {
            Vue.prototype.$dm.closeDmDialog();
          }
        }],
        classes
      });
    }

    Vue.prototype.$dm.confirm = function ({
      title,
      message,
      type = Vue.prototype.$dialog.PRIMARY,
      okAction,
      cancelAction,
      classes
    }) {
      return this.dmThis.showDmDialog({
        title,
        message,
        type,
        buttons: [{
            code: 'ok',
            label: 'ok',
            color: Vue.prototype.$dialog.PRIMARY,
            action: okAction,
            autoClose: true
          },
          {
            code: 'cancel',
            label: 'cancel',
            color: Vue.prototype.$dialog.PRIMARY,
            action: cancelAction,
            autoClose: true
          }
        ],
        classes
      });
    }

    Vue.prototype.$dm.closeDmDialog = function () {
      return this.dmThis.closeDmDialog();
    }


    //Vue.prototype.$dm.injectStyle  = function () {
    //  return this.dmThis.$dm_injectStyle();
    //}

    //Vue.prototype.$dm.linkToAppUrl = function () {
    //  return this.dmThis.$dm_toAppUrl();
    //}

    Vue.prototype.$dm.form.reset = function () {
      let internalModel = Vue.prototype.$dm.model;
      for (let cur in Vue.prototype.$dm.componentSchema) {
        let currentSchema = Vue.prototype.$dm.componentSchema[cur];
        let componentModelName = currentSchema.model || currentSchema.name || "";
        Vue.prototype.$dm.empty(componentModelName);
      }
      Vue.prototype.$dm.vcForm.reset();
    }

    Vue.prototype.$dm.form.validate = function () {
      Vue.prototype.$dm.vcForm.validate();
    }

    Vue.prototype.$dm.form.resetValidation = function () {
      Vue.prototype.$dm.vcForm.resetValidation();
    }
    
    // 登出操作
    Vue.prototype.$dm.logout = function () {
      let app = this.dmThis.$store.state.appInfo
      window.ls.remove(`${app.AppCode}@${app.OrganizationCode}@userInfo`);
      window.ls.remove(`${app.AppCode}@${app.OrganizationCode}@Info`);
      window.ls.remove(`${app.AppCode}@${app.OrganizationCode}@idle`);
      window.ls.remove(`${app.AppCode}@${app.OrganizationCode}@active`);
      window.ls.remove(`${app.AppCode}@${app.OrganizationCode}@expired`);
      window.ls.remove(`${app.AppCode}@${app.OrganizationCode}@timeOut`);
      window.ls.remove(`${app.AppCode}@${app.OrganizationCode}@Logo`); 
      window.top.location.href = "/" + app.OrganizationCode + "/" + app.AppCode + "/.logout";
    }
   
    /**
     * @description 切换应用语言switchLanguage（公共方法）
     * @param {string} language 英语：'en' / 简体中文：'zh-Hans' / 繁体中文：'zh-Hant'    
     * @return {undefined}
     */
     Vue.prototype.$dm.switchLanguage = function(language = 'en'){

      const langMap = {
        'en':'en',
        'zh-Hans':'zh-cn',
        'zh-Hant':'zh-tw',
      }

      let lang = langMap[language] || 'en'

      // 如果设置的语言code和当前语言一致，则什么都不执行
      if (this.dmThis.$i18n.locale == lang) return;

      // 通知后端切换语言
      this.dmThis.$axios.post("/api/Language", {
          tenantId: this.dmThis.$store.state.appInfo.OrganizationCode,
          appcode: this.dmThis.$store.state.appInfo.ApplicationCode,
          locale: lang,
        })
        .then( ({ data }) => {
            let settings = data.settings || "{}"
            // 设置应用内部的i18n
            this._setLocaleToi18n(lang, JSON.parse(settings))            
            window.ls.set(
              `${this.dmThis.$store.state.appInfo.ApplicationCode}@language@runtime`,
              this.dmThis.$i18n.locale
            )
            window.ls.set(
              `${this.dmThis.$store.state.appInfo.OrganizationCode}_${this.dmThis.$store.state.appInfo.AppCode}_${lang}`.toLowerCase(),
              settings
            )
            // 设置页面标题
            this._setDocumentTitle()
          },
          () => {}
        );
    }

    Vue.prototype.$dm.previewFile = function (componentCode, fileId, dataMode, pageCode) {
      let _this = this;
      let pageView = pageCode ? pageCode.toLowerCase() : (_this.dmThis.$route.params.pageView.toLowerCase() || "home")
      let currentSchema = _this._getCurrentSchema(componentCode, dataMode, pageCode);
      let currentComponentCode = currentSchema.name + pageView
      //pdfviewer
      _this.bus.$emit(`assignPreview_${currentComponentCode}`, {
        // 'componentCode':componentCode,
        'fileId': fileId
      });
    }

    // 获取某个控件的schema对象
    // 返回的是对应schema的深拷贝对象，避免使用者直接修改原始的schema对象
    Vue.prototype.$dm.getComponentSchema = function (componentCode, dataMode, pageCode) {
      return JSON.parse(JSON.stringify(this._getCurrentSchema(componentCode, dataMode, pageCode)))
    }

    // 设置某个控件的schema对象的部分属性（过滤掉一些特定的属性）
    Vue.prototype.$dm.setComponentSchema = function (componentCode, schemaObj, dataMode, pageCode) {
      if (Object.keys(schemaObj).length === 0) return false;
      let currentSchema = this._getCurrentSchema(componentCode, dataMode, pageCode);      
      Object.keys(schemaObj).forEach(key => {
        // 过滤以下属性不让其修改
        if(!['name','model','component','dataType','permission','buttonId','isCustom','type'].includes(key)) {
          Vue.set(currentSchema, key, schemaObj[key])
        }
      })
    }


    /**
     * 内部方法
     * ===============================================================================
     */

    /**
     * 内部方法
     * 清空当前Field的数据
     */
    Vue.prototype.$dm._emptyFieldValue = function (componentCode, dataMode, pageCode) {
      let _this = this;

      let internalModel = _this._getCurrentModel(dataMode, pageCode);
      let currentSchema = _this._getCurrentSchema(componentCode, dataMode, pageCode);
      if (currentSchema == undefined) {
        return null;
      }
      let componentModelName = currentSchema.model || currentSchema.name || "";
      if (componentModelName == "") {
        return null;
      }
      let defaultVal;
      let setDefaultVal = true;
      switch (currentSchema.dataType.toLowerCase()) {
        case "string":
          defaultVal = "";
          break;
        case "int":
          defaultVal = 0;
          break;
        case "keyvaluepairs":
          if (currentSchema.query.queryKey) {
            setTimeout(function () {
              Vue.set(internalModel, componentModelName, []);
            }, 300)
          } else {
            Vue.set(internalModel, componentModelName, []);
          }
          case "strings":
          case "user":
          case "picker":
          case "file":
            defaultVal = [];
            break;
          case "datetime":
            setDefaultVal = false;
            setTimeout(function () {
              Vue.set(internalModel, componentModelName, null);
            }, 300)
            break;
          case "datetimerange":
            setDefaultVal = false;
            setTimeout(function () {
              Vue.set(internalModel, componentModelName, []);
            }, 300)
            break;
          case "html":
            if (currentSchema.component == "vc-html") {
              setDefaultVal = false;
              Vue.set(currentSchema, "htmlData", []);
            } else {
              setDefaultVal = false;
              Vue.set(currentSchema, "insertContentByExternal", true);
              Vue.set(internalModel, componentModelName, "");
              setTimeout(function () {
                Vue.set(currentSchema, "insertContentByExternal", false);
              }, 500);
            }
            break;
          default:
            defaultVal = "";
            break;
      }
      setDefaultVal ? Vue.set(internalModel, componentModelName, defaultVal) : null;
    }

    /**
     * 内部方法
     * 获取当前Model
     */
    Vue.prototype.$dm._getCurrentModel = function (dataMode, pageCode) {
      let _this = this;
      if (dataMode && dataMode == "embed") {
        return pageCode ? _this.embedModel[pageCode] : null;
      } else if (dataMode && dataMode == "popup") {
        return pageCode ? _this.popupModel[pageCode] : null;
      } else {
        return _this.model;
      }
    }

    /**
     * 内部方法
     * 获取当前操作的Schema
     */
    Vue.prototype.$dm._getCurrentSchema = function (componentCode, dataMode, pageCode) {
      let _this = this;
      if (dataMode && dataMode == "embed") {
        return pageCode ? _this.embedComponentSchemas[pageCode][componentCode] : null;
      } else if (dataMode && dataMode == "popup") {
        return pageCode ? _this.popupComponentSchemas[pageCode][componentCode] : null;
      } else {
        return _this.componentSchema[componentCode];
      }
    }

    /**
     * 内部方法
     * 通过调整Schema的Show字段属性来控制组件的显示Enable Disable
     * 支持单个
     */
    Vue.prototype.$dm._setEnableOrDisable = function (obj, dataMode, flag, pageCode) {
      let _this = this;
      if (typeof obj === "object") {
        for (let key in obj) {
          let currentSchema = _this._getCurrentSchema(obj[key], dataMode, pageCode);
          if (currentSchema == undefined)
            continue;


          if (currentSchema.component == 'vc-editor' || currentSchema.component == 'vc-dropzone') {
            let componentModelName = currentSchema.model || currentSchema.name || "";
            if (componentModelName == "") {
              continue;
            }

            let loadType = dataMode || "normal";
            let currentComponentStatus = null;
            let componentStatusName = "";
            let busName = '';
            switch (loadType) {
              case "embed":
                busName = "$dmembedbus";
                currentComponentStatus = _this.dmThis.$store.state.embedComponentStatus[pageCode];
                componentStatusName = pageCode + "_" + componentModelName;
                break;
              case "popup":
                busName = "$dmpopupbus";
                currentComponentStatus = _this.dmThis.$store.state.popupComponentStatus[pageCode];
                componentStatusName = pageCode + "_" + componentModelName;
                break;
              default:
                busName = "$dmbus";
                currentComponentStatus = _this.dmThis.$store.state.componentStatus;
                componentStatusName = componentModelName;
                break;
            }
            //如果处理complete状态，说明请求的数据源已经加载完成，则可以直接通过触发赋值操作
            if (currentComponentStatus && currentComponentStatus[componentStatusName] && currentComponentStatus[componentStatusName].status == "complete") {
              Vue.set(currentSchema, "disabled", flag);
            } else {
              _this.dmThis.bus.$on(busName, (componentStatus, name) => {
                if (componentStatus[componentStatusName] && name == componentStatusName && componentStatus[componentStatusName].status == "complete") {
                  Vue.set(currentSchema, "disabled", flag);
                }
              });
            }
          } else {
            Vue.set(currentSchema, "disabled", flag);
          }

        }
      } else {
        let currentSchema = _this._getCurrentSchema(obj, dataMode, pageCode);
        if (currentSchema == undefined)
          return;

        if (currentSchema.component == 'vc-editor' || currentSchema.component == 'vc-dropzone') {
          let componentModelName = currentSchema.model || currentSchema.name || "";
          if (componentModelName == "") {
            return;
          }


          let loadType = dataMode || "normal";
          let currentComponentStatus = null;
          let componentStatusName = "";
          let busName = '';
          switch (loadType) {
            case "embed":
              busName = "$dmembedbus";
              currentComponentStatus = _this.dmThis.$store.state.embedComponentStatus[pageCode];
              componentStatusName = pageCode + "_" + componentModelName;
              break;
            case "popup":
              busName = "$dmpopupbus";
              currentComponentStatus = _this.dmThis.$store.state.popupComponentStatus[pageCode];
              componentStatusName = pageCode + "_" + componentModelName;
              break;
            default:
              busName = "$dmbus";
              currentComponentStatus = _this.dmThis.$store.state.componentStatus;
              componentStatusName = componentModelName;
              break;
          }
          //如果处理complete状态，说明请求的数据源已经加载完成，则可以直接通过触发赋值操作
          if (currentComponentStatus && currentComponentStatus[componentStatusName] && currentComponentStatus[componentStatusName].status == "complete") {
            Vue.set(currentSchema, "disabled", flag);
          } else {
            _this.dmThis.bus.$on(busName, (componentStatus, name) => {
              if (componentStatus[componentStatusName] && name == componentStatusName && componentStatus[componentStatusName].status == "complete") {
                Vue.set(currentSchema, "disabled", flag);
              }
            });
          }
        } else {
          Vue.set(currentSchema, "disabled", flag);
        }
      }
    }

    /**
     * 内部方法
     * 通过调整Schema的Show字段属性来控制组件的显示隐藏
     */
    Vue.prototype.$dm._setShowOrHide = function (obj, dataMode, flag, pageCode) {
      let _this = this;
      if (typeof obj === "object") {
        for (let key in obj) {
          let currentSchema = _this._getCurrentSchema(obj[key], dataMode, pageCode);
          if (currentSchema == undefined)
            continue;
          Vue.set(currentSchema, "show", flag);
        }
      } else {
        let currentSchema = _this._getCurrentSchema(obj, dataMode, pageCode);
        if (currentSchema == undefined)
          return;
        Vue.set(currentSchema, "show", flag);
      }
    }

   /**
     * Query filter
     *
     * { "parameter1": "para1" }
     * 请注意，有一种为空的情况，
     * 如果需要查询为空的数据，则配置{ "parameter1": "" }
     * 如果不需要查询为空的数据，则移除配置{ "parameter1": "" }
     */
   Vue.prototype.$dm.queryFilter = function (componentCode, searchValues, dataMode, pageCode) {
    let _this = this;
    if (pageCode) {
      pageCode = pageCode.toLowerCase();
    }
    let currentSchema = _this._getCurrentSchema(componentCode, dataMode, pageCode);
    if (currentSchema == null) {
      console.log("queryFilter: Can't find the schema, Please check the component Name.");
      return;
    }
    
    _this._debounceQueryFilterFunc = _this._debounceQueryFilterFunc == null ? {} : _this._debounceQueryFilterFunc

    if (_this._debounceQueryFilterFunc && _this._debounceQueryFilterFunc[componentCode]  == null) {
      _this._initQueryFilterDebounce(componentCode);
    }
    _this._debounceQueryFilterFunc[componentCode](currentSchema, searchValues);
  }

  Vue.prototype.$dm._initQueryFilterDebounce = function (componentCode) {
    let _this = this;
    const {
      debounce
    } = require('throttle-debounce')
    _this._debounceQueryFilterFunc[componentCode]= debounce(500, false, (currentSchema, searchValues) => {
      let _query = currentSchema.query;
      _query.searchValues = {};
      _query.searchValues = searchValues;
      Vue.set(currentSchema, "query", _query);
    });
  }

    Vue.prototype.$dm.getStringValueFromObjectByKey = function (obj, key, splitSymbol = "|Ng|") {
      let newValue = "";
      if (obj.length > 0) {
        for (let i in obj) {
          newValue += obj[i][key] + (splitSymbol ? splitSymbol : splitSymbol);
        }
        if (newValue != "") {
          newValue = newValue.substring(0, newValue.length - splitSymbol.length);
        }
      }
      return newValue;
    }

    Vue.prototype.$dm._getUserParameter = function (queryContent, selectedDatas, IgnoreStaffs, currentSchema) {
      let currentUserData = _this.dmThis.$store.state.userInfo;

      var parameter = {
        pickertype: "people_search", //传递给apiController.cs的参数类型，区分peoplePicer和dataPicker
        Method: "",
        selectedDatas: selectedDatas || [],
        selectedType: "",
        IgnoreStaffs: IgnoreStaffs || [],
        queryContent: queryContent || "",
        index: 1,
        size: 100,
        organizationCode: app.tenantId,
        appCode: app.appCode,
        range: [],
        showPrivateGroup: currentSchema.displayGroupIncludingCurrentPeople || false,
        searchByGroup: currentSchema.enableSearchByGroup || false,
        searchByRole: currentSchema.enableSearchByRole || false,
        groupName: currentSchema.groupName,
        roleName: currentSchema.roleName,
        attribute1: currentSchema.attribute1 || "",
        attribute2: currentSchema.attribute2 || "",
        attribute3: currentSchema.attribute3 || "",
        currentStaffCode: currentUserData.staffCode,
        firstLineDesc: currentSchema.firstLineDescriptionConfig || [],
        firstLineSeparator: currentSchema.firstLineSeparator || " ",
        secondLineDesc: currentSchema.secondLineDescriptionConfig || [],
        secondLineSeparator: currentSchema.secondLineSeparator || " ",
        thirdLineDesc: currentSchema.thirdLineDescriptionConfig || [],
        thirdLineSeparator: currentSchema.thirdLineSeparator || " ",
        additionalSearchKey: currentSchema.CustomSearchKey || [],
        withExtendData: currentSchema.enableExtendMetaData || false,
        relationskey: "StaffCode,UserName,Email,OrganizationCode,UserID,Phone",
        showTermUser: currentSchema.displayDimission || false,
        filters: currentSchema.queryPara ? [currentSchema.queryPara] : [],
      };
      return parameter;
    }
    
    Vue.prototype.$dm.isCurrentUserInPeoplePicker = function (componentCode, dataMode, pageCode) {
      let _this = this;
      if (pageCode) {
        pageCode = pageCode.toLowerCase();
      }      
      let currentSchema = _this._getCurrentSchema(componentCode, dataMode, pageCode);
      if (currentSchema.dataType.toLowerCase() != "user") {
        return false;
      }
      let internalModel = _this._getCurrentModel(dataMode, pageCode);
      let curPeoplePickerData = internalModel[componentCode];
      if (curPeoplePickerData == null) {
        return false;
      }
      let currentUserData = _this.dmThis.$store.state.userInfo;
      let _find = require('lodash/find')
      let filterByUserID = _find(curPeoplePickerData, function (o) {
        return o.UserID == currentUserData.userID;
      });
      if (filterByUserID != undefined) {
        return true;
      }
      let _forEach = require('lodash/forEach');
      let hasGroup = false;
      _forEach(currentUserData.groups, function (value) {
        let filterByGroup = _find(curPeoplePickerData, function (o) {
          return o.StaffCode == "@" + value;
        });
        if (filterByGroup != undefined) {
          hasGroup = true;
        }
      });
      return hasGroup;
    }

    /**
     * 内部方法
     * 设置内部i18n和moment
     */
    Vue.prototype.$dm._setLocaleToi18n = function(code, data) {
      this.dmThis.$i18n.mergeLocaleMessage( code, data )
      this.dmThis.$i18n.locale = code
      this.dmThis.moment.locale(this.dmThis.$i18n.locale)
    }

    /**
     * 外部方法
     * 设置内部i18n和moment
     */
    Vue.prototype.$dm.SetDocumentTitle = function () {
      this._setDocumentTitle();
    }

    /**
     * 内部方法
     * 设置页面标题
     */
     Vue.prototype.$dm._setDocumentTitle = function() {
      let pageView = this.dmThis.$route.params.pageView ? this.dmThis.$route.params.pageView :"home"
      if (pageView && this.dmThis.$route.name.toLowerCase() == "view") {
        parent.document.title = `${
          this.dmThis.$te("system.appname") && this.dmThis.$t("system.appname")
            ? this.dmThis.$t("system.appname")
            : this.dmThis.$store.state.appInfo.ApplicationName
        } — ${
          this.dmThis.$te(`menu.${pageView.toLowerCase()}`)
            ? this.dmThis.$t(`menu.${pageView.toLowerCase()}`)
            : pageView || "view"
        }`;
      } else {
        parent.document.title = `${
          this.dmThis.$te("system.appname") && this.dmThis.$t("system.appname")
            ? this.dmThis.$t("system.appname")
            : this.dmThis.$store.state.appInfo.ApplicationName
        } — ${
          this.dmThis.$te(`${this.dmThis.$store.state.app.currentpagetype}_${pageView}.sys_defaultPageName`)
            ? this.dmThis.$t(`${this.dmThis.$store.state.app.currentpagetype}_${pageView}.sys_defaultPageName`)
            : pageView || "home"
        }`;
      }
    }

        /**
     * 内部方法
     * 重新获取用户信息并更新到localStorage
     */
    Vue.prototype.$dm.UpdateCurrentUser = async function () {
      //重新获取userInfo
      let result = await this.dmThis.$axios.get("/api/GetCurrentUser").then(({
        data
      }) => {
        if (data) {
          // let appCode = this.dmThis.$store.state.appInfo.ApplicationCode || '';
          // window.ls.set(`${appCode}@userInfo`, JSON.stringify(data));
          return data;
        } else {
          return Promise.reject(new Error("cannot retrive userInfo"));
        }
      });
      return result
    }

  }
}
