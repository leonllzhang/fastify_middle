/* eslint-disable no-useless-return */
/* eslint-disable camelcase */
import {
  actions,
  mutations
} from "../utils/store-constants";
import { _axios } from '../plugins/axios'

function $dm_getLanguageSettings() {
  //默认语言逻辑：优先记录用户选择--》系统默认
  let appInfo = this.$store.state.appInfo
  let defaultCode = this.$store.state.app.appPerference.DefaultLanguage.code || 'en'
  let locale = window.ls.get(`${appInfo.ApplicationCode}@language@runtime`) || defaultCode

  let key = `${appInfo.OrganizationCode}_${appInfo.AppCode}_${locale}`.toLowerCase()
  let versionkey = `${appInfo.OrganizationCode}_${appInfo.AppCode}_${locale}_version`.toLowerCase()
  let settings = window.ls.get(key)
  let languageversion = window.ls.get(versionkey)

  return this.$axios
    .post("/api/Language", {
      tenantId: appInfo.OrganizationCode,
      appcode: appInfo.ApplicationCode,
      locale: locale,
      property: "Version"
    })
    .then(({
      data
    }) => {
      if (languageversion == data) {
        return settings || null;
      } else {
        return this.$axios
          .post("/api/Language", {
            tenantId: app.OrganizationCode,
            appcode: app.ApplicationCode,
            locale: locale
          })
          .then(res => {
            if (res.data && res.data.settings) {
              window.ls.set(key, res.data.settings)
              window.ls.set(versionkey, res.data.version)
              return res.data.settings
            }
          })
          .then(result => {
            if (result) {
              this.$i18n.mergeLocaleMessage(locale, JSON.parse(result))
            }
            return result || null
          })
      }
    })
    .then(settings => {
      this.$i18n.locale = locale;
      this.$i18n.mergeLocaleMessage(locale, JSON.parse(settings));
    });
}

function $dm_getRawAppCode() {
  if(window.urlMode == 'NOTENANTAPPCODE') {
    return (window.appCodeInRequest + '@' + window.tenantInRequest).toLowerCase()
  }
  // 格式为变化为 app@tenant 和 vprofile 统一
  return window.location.pathname
    .split("/")
    .splice(1, 2)
    .reverse()
    .join("@")
    .toLowerCase();
}

function $dm_syncUserInfo() {
  var appCode = $dm_getRawAppCode();
  return this.$store
    .dispatch(actions.syncUserInfo, {
      param: appCode
    })
    .then(userInfo => {
      return this.$axios.get("/api/GetCurrentUser").then(({
        data
      }) => {
        if (data) {
          this.$set(data, 'staffId', data.userID)
          this.$set(data, 'staffName', data.userName)
          this.$store.commit(mutations.setUserInfo, data);
          // var appCode = $dm_getRawAppCode();
          // window.ls.set(`${appCode}@userInfo`, JSON.stringify(data));
          if (this.$store.state.userInfo &&
            this.$store.state.userInfo.roles.length == 1 &&
            this.$store.state.userInfo.roles[0] == "AnonymousRole") {
            this.$store.commit('SET_ANONYMOUSUSER', true)
          } else {
            this.$store.commit('SET_ANONYMOUSUSER', false)
          }
          return data;
        } else {
          return Promise.reject(new Error("cannot retrive userInfo"));
        }
      });
    });
}


function $dm_syncAppInfo() {
  var appCode = $dm_getRawAppCode();
  return this.$store
    .dispatch(actions.syncAppInfo, appCode)
    .then(appInfo => {
      if (appInfo) {
        return appInfo;
      } else {
        return this.$axios
          .post("/api/vp/GetApplicationByCode", {})
          .then(({
            data
          }) => {
            if (data.Data) {
              data.Data.AppCode = data.Data.ApplicationCode.split("@")[0];
              this.$store.commit(mutations.setAppInfo, data.Data);
              window.ls.set(`${appCode}@Info`, JSON.stringify(data.Data));
              return data.Data;
            } else {
              return Promise.reject(new Error("cannot retrive appInfo"));
            }
          });
      }
    })
    .then(appInfo => {
      var dcLevel = appInfo.DCLevel;
      var appCode = appInfo.ApplicationCode.toLowerCase();

      try {
        dcLevel = JSON.parse(dcLevel);
        dcLevel = parseInt(dcLevel.value);

        if (dcLevel) {
          dcLevel = dcLevel * 60 * 1000;
        } else {
          throw new Error();
        }
      } catch (ex) {
        var ar = [1440, 240, 15, 15];
        dcLevel = (ar[dcLevel] || ar[0]) * 60 * 100;
      }
      dcLevel -= 30000;
      window.ls.set(`${appCode}@timeOut`, dcLevel);
      this.$store.commit("SET_CURRENTTIMEOUT", dcLevel);
    });
}

function $dm_syncAppLogo() {
  var appCode = $dm_getRawAppCode();
  return this.$store.dispatch(actions.syncAppLogo, appCode).then(appLogo => {
    if (appLogo) {
      return appLogo;
    } else {
      return this.$dm_syncAppInfo()
        .then(({
          ApplicationCode
        }) => {
          return this.$axios.post("/api/vp/GetApplicationLogos", {
            ApplicationCode
          });
        })
        .then(
          ({
            data
          }) => {
            if (data.Data) {
              return `data:image/png;base64,${data.Data[0].Logo}`;
            } else {
              return "/static/images/logo.svg";
            }
          },
          () => "/static/images/logo.svg"
        )
        .then(appLogo => {
          this.$store.commit(mutations.setAppLogo, appLogo);
          window.ls.set(`${appCode}@Logo`, appLogo);
          return appLogo;
        });
    }
  });
}

function $dm_getSchemas(pageView, pageType, pageMode) {
  if (pageView && pageType && pageMode) {
    return this.$axios.post("/api/getSchemas", {
      pageView: pageView,
      type: pageType,
      mode: pageMode
    });
  } else {
    return Promise.reject({
      statusCode: 400,
      message: "Invalid Request, getSchemas"
    });
  }
}

function $dm_getDocument(pageAlias, id, pageMode) {
  if (pageAlias && pageMode) {
    return this.$axios.post("/api/getDocument", {
      pageAlias,
      id,
      pageMode
    });
  } else {
    return Promise.reject({
      statusCode: 400,
      message: "Invalid Request, getDocument"
    });
  }
}

function $dm_deleteDocument(pageAlias, id) {
  if (pageAlias && id) {
    return this.$axios.delete(`/api/DeleteDocument/${pageAlias}/${id}`);
  } else {
    return Promise.reject({
      statusCode: 400,
      message: "Invalid Request, deleteDocument"
    });
  }
}

function $dm_injectStyle(selector, content, customId) {
  //支持多次插入样式的逻辑，就需要把之前插入的样式清理掉
  if (customId && document.getElementById(customId)) {
    document.getElementById(customId).remove();
  }
  let body = document.querySelector(selector);
  let cssText = document.createTextNode(content);
  let style = document.createElement("style");
  style.id = customId == undefined ? "custom-layout" : customId;
  style.setAttribute("scoped", "");
  style.type = "text/css";
  style.innerHTML = "";
  style.appendChild(cssText);
  body.appendChild(style);
}

function $dm_injectScript(src, asyncFlag) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  if (!asyncFlag) {
    script.async = false;
  }
  var resourceElement = document.getElementById('resource');
  if (resourceElement) {
    resourceElement.appendChild(script);
  } else {
    document.getElementById('body').appendChild(script);
  }
}

async function $dm_renderFreePage(scripts){
    // 首先，将完整的脚本字符串中的 @/root/，替换成系统内部路径
    scripts = scripts.replaceAll(/@root\//g,`${location.href.split('adminmanagement')[0]}admin-api/resource/`)
    // 过滤出script标签数组，如果没有，会是undefined
    let scriptArr = scripts.match(/(<script(.*?)>)(.|\n)*?(<\/script>)/g)
    if (scriptArr) {
      // 过滤出带src的script标签数组
      let outsideScriptArr = scriptArr.filter(str => str.indexOf('src=') > -1)
      // 异步加载src的各路资源
      let isOutsideLoaded = await loadScriptOutside(outsideScriptArr)
      // 加载完依赖的js后，才能动态创建手写内容的script标签
      if (isOutsideLoaded) {
        let insideScriptArr = scriptArr.filter(str => str.indexOf('src=') == -1)
        insideScriptArr.forEach(str=> {
          let script = document.createElement('script')          
          script.innerHTML = str.slice(8,-9)       
          document.body.appendChild(script)
        })   
      }
    }       
}

function $dm_submitDocument({
  pageMode,
  pageAlias,
  code,
  model
}) {
  _clearModelFields(model);
  if (pageMode && pageAlias && code && model) {
    return this.$axios.post(
      `/api/UpdateDocument/${pageMode}/${pageAlias}/${code}`,
      model
    );
  } else {
    return Promise.reject({
      statusCode: 400,
      message: "Invalid Request, submitDocument"
    });
  }
}

function $dm_toAppUrl(url) {
  if (window.urlMode === 'NOTENANTAPPCODE') return url;
  return window.location.pathname
    .split("/")
    .splice(0, 3)
    .concat([url.replace(/^\/*/, "")])
    .join("/");
}

function $dm_getGuid() {
  // 获取随机ID，组件拖到预览视图后就会被设置个ID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function $dm_getObjectId() { // 获取随机ID，组件拖到预览视图后就会被设置个ID
  var timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx"
    .replace(/[x]/g, function () {
      return ((Math.random() * 16) | 0).toString(16);
    })
    .toLowerCase()
  );
}

function $dm_recordComponentSchemas(schemas, schemaType, pageCode) {
  let _this = this;
  if (pageCode) {
    pageCode = pageCode.toLowerCase();
  }
  for (var i = 0; i < schemas.length; i++) {
    let code = schemas[i] && schemas[i].name || schemas[i].code || "";
    if (code != '') {
      if (schemaType != "componentSchema") {
        if (this.$dm[schemaType][pageCode] == undefined) {
          this.$dm[schemaType][pageCode] = {}
        }
        this.$dm[schemaType][pageCode][code] = schemas[i];
      } else {
        this.$dm[schemaType][code] = schemas[i];
      }
    }
    if (schemas[i].schemas && schemas[i].schemas.length > 0) {
      _this.$dm_recordComponentSchemas(schemas[i].schemas, schemaType, pageCode)
    }
  }
}

function $dm_arialabel(rules, value) {
  if (rules && rules.length) {
    for (let index = 0; index < rules.length; index++) {
      const rule = rules[index]
      const valid = typeof rule === 'function' ? rule(value) : rule

      if (valid === false || typeof valid === 'string') {
        return " " + valid;
      } else if (typeof valid !== 'boolean') {
        return " " + valid;
      }
    }
  }
  return "";
}

//清理系统预留字段以及无意义属性
function _clearModelFields(model) {  
  delete model.undefined;
  //修复custom button C# 代码无法获取customData的问题
  // delete model.customData;
}

//异步的加载src脚本文件并执行
async function loadScriptOutside(arr) {
  if(!arr.length) return true
  let res = false
  let ps = []
  arr.forEach(str=> {
    ps.push(new Promise((resolve)=> {
      let script = document.createElement('script')         
      script.src = str.match(/src=.*"/g)[0].slice(5,-1) 
      // 这里监听下载完成并执行完成后的事件 
      script.onload = () => resolve(true)
      document.body.appendChild(script)
    }))          
  })
  // 等待执行下载完所有的src中的资源
  await Promise.all(ps).then(resArr=> {
    res = true;
  }).catch(error=> {
    res = false;
  })
  return res
}

function $dm_recordHitLog(pageView, pageType, pageMode, loadTime, loadType) {
  _axios
    .post("/api/HitLog", {
      preUrl: document.referrer,
      url: window.location.href,
      clientMode: loadTime,
      pageName: pageView,
      pageType: pageType,
      pageMode: pageMode,
      documentId: loadType
    })
    .then((data) => {
      // console.log('hitlog', data);
    });
}


export default {
  $dm_getLanguageSettings,
  $dm_getRawAppCode,
  $dm_syncUserInfo,
  $dm_syncAppInfo,
  $dm_syncAppLogo,
  $dm_getSchemas,
  $dm_getDocument,
  $dm_deleteDocument,
  $dm_submitDocument,
  $dm_injectStyle,
  $dm_injectScript,
  $dm_toAppUrl,
  $dm_getGuid,
  $dm_getObjectId,
  $dm_recordComponentSchemas,
  $dm_arialabel,
  $dm_recordHitLog,
  $dm_renderFreePage
};
