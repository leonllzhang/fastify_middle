/* eslint-disable prefer-promise-reject-errors */
import {_axios as api} from "../../../plugin/axios";
import apphelper from "../../../utils/appInfo";
// import themeList from "../../../../AdminManagement/plugins/defaultThemeColor";


export default {
  getSyncUserInfo: ({ commit }) => {
    return api.get("/api/GetCurrentUser", {}).then(({ data }) => {
      if (data) {
        commit("setUserInfo", data);
      }
    });
  },
  getSyncAppInfo: (context) => {

    return api.post("/api/vp/GetApplicationByCode", {}).then(({ data }) => {
      if (data) {
        data.Data.ApplicationCode = data.Data.ApplicationCode.substring(
          0,
          data.Data.ApplicationCode.indexOf("@")
        );
        context.commit("setAppInfo", data.Data);
        return api
          .post("/api/vp/GetApplicationLogos", {
            ApplicationCode: data.Data.ApplicationCode + "@" + data.Data.OrganizationCode
          })
          .then(
            ({ data }) => {
              if (data != null && data.Data.length > 0) {
                let ImageType = data.Data[0].ImageType,
                  type = ImageType.toLowerCase() === 'svg' ? 'svg+xml' : 'png';
                var imgData = data.Data[0].Logo ? `data:image/${type};base64,${data.Data[0].Logo}` : context.getters.cdnHostAndVersionPath+ "/static/images/logo.svg";
                context.commit("setAppLogo", imgData);
              } else {
                context.commit(
                  "setAppLogo",
                  context.getters.cdnHostAndVersionPath+"/static/images/logo.svg"
                );
              }
            }
          );
      }
    });
  },
  getSyncAppLogo: (context, payload) => {

    let logoFromStorage =window.ls.get(`${payload.appcode}@Logo`);
    if(logoFromStorage){
      context.commit("setAppLogo",{ appcode: payload.appcode, appLogo: logoFromStorage });
      return ;
    }
    return api.post("/api/vp/GetApplicationLogos", { payload }).then(
      ({ data }) => {
        if(data && data.Data.length>0 && data.Data[0].Logo){
            let ImageType = data.Data[0].ImageType,
            type = ImageType.toLowerCase() === 'svg' ? 'svg+xml' : 'png';
            let imgData = `data:image/${type};base64,${data.Data[0].Logo}`
            context.commit("setAppLogo", { appcode: payload.appcode, appLogo: imgData });
        }else{
          let enablePwc = payload.enablePwc
          let defaultLogo = enablePwc == false ? "/static/images/logo_base.png" : "/static/images/logo.svg"
          let appLogo = context.getters.cdnHostAndVersionPath + defaultLogo
          context.commit("setAppLogo", { appcode: payload.appcode, appLogo: appLogo});
        }
      }
    );
  },
  // async actionGetTheme({ commit, dispatch }, {
  //   url,
  //   key
  // }) {
  //   function isJsonString(str) {
  //     try {
  //         JSON.parse(str);
  //     } catch (e) {
  //         return false;
  //     }
  //     return true;
  //   }
  //   let DataStr = await api.asynPost(
  //     url, //更新ng preference
  //     {
  //       key,
  //     }
  //   );
  //   let currentTheme =  {
  //     cus: false,
  //     name: "PwC",
  //     dark: false
  //   };
  //   let jsonData;
  //   if(isJsonString(DataStr) && isJsonString(JSON.parse(DataStr).value)) {
  //     currentTheme = JSON.parse(JSON.parse(DataStr).value).currentTheme;
  //     jsonData = JSON.parse(DataStr);
  //   }
  //   let themeId = jsonData && typeof jsonData == "object" ? jsonData.id : null;
  //   let concurrencyStamp = jsonData && typeof jsonData == "object" ? jsonData.concurrencyStamp :null;
  //   commit("SET_CURRENTTHEME", {
  //     name:currentTheme.name,
  //     dark: currentTheme.dark,
  //     themeId,
  //     concurrencyStamp
  //   });
  // },
  async actionGetPreferenceListByType({commit, dispatch},{url, key}){
    if(!key) return
    function isJsonString(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
    }
    return new Promise(async (resolve, reject) => {
      let postResult = await api.asynPost(url, { key});
      let parseResult = {}
      if(isJsonString(postResult) && isJsonString(JSON.parse(postResult).value)) {
        parseResult = JSON.parse(JSON.parse(postResult).value);
      }
      try {
        switch(key) {
          // case "themelist":
          //   let originalThemeList = {...themeList}
          //   if(Object.keys(parseResult).length === 0){
          //     parseResult = originalThemeList 
          //   }
          //   else if( Object.keys(parseResult).indexOf('defaultDark') < 0 ){
          //     parseResult['defaultDark'] = themeList['defaultDark'];
          //   }
  
          //   commit("SET_THEMELIST", parseResult)
          //   break;
  
          case "fontlist":
            commit("SET_FONTLIST", parseResult)
            break;

          case "Theme":
            // let enablePwc = await this.dispatch("actionsGetEnablePwc");
            let defaultTheme = {
              "cus": false,
              "name": "digiqalFuture"
            }
            let currentTheme = parseResult.currentTheme ? parseResult.currentTheme : defaultTheme;
            
            let jsonData = postResult ? JSON.parse(postResult) : '';
            let themeId = jsonData && typeof jsonData == "object" ? jsonData.id : null;
            let concurrencyStamp = jsonData && typeof jsonData == "object" ? jsonData.concurrencyStamp :null;
            commit("SET_CURRENTTHEME", {
              name: currentTheme.name,
              dark: currentTheme.dark,
              themeId,
              concurrencyStamp
            });
            break;
          default:
            break;
        }
        const result = !!postResult ? JSON.parse(postResult) : null
        resolve(result)
      } catch (ex) {
        console.error(ex)
        reject(ex)
      }
    })
  },
  async getAppPreference({ commit }, key) {
    var _key = key;
    switch (_key) {
      case "GlobalDateFormat":
        return api.post("/api/Preference/get", { key }).then(({ data }) => {
          let obj = {};
          if (data) {
            try {
              if (typeof JSON.parse(data) == "object") {
                obj[_key] = JSON.parse(data).value || "YYYY-MM-DD HH:mm";
              }
            }
            catch(e) {
              obj[_key] = data || "YYYY-MM-DD HH:mm";
            }
            commit("setAppPerference", obj);
          }
        });
      case "Copyright":
        return api.post("/api/Preference/get", { key }).then(({ data }) => {
          let obj = {};
          if (data) {
            obj[_key] = JSON.parse(data).value || "";
            commit("setAppPerference", obj);
          }
        });
      
      default:
        return api.post("/api/GetAppPreference", { key }).then(({ data }) => {
          let obj = {};
          obj[_key] = data;
          commit("setAppPerference", obj);
        });
    }

   
  },

  async getLanguageByLocale({ commit }, param) {
    let appInfor = apphelper();
    let langKey = `${appInfor.tenantId}_${appInfor.appCode}_${param.locale}`.toLowerCase();
    let langVersionKey = `${appInfor.tenantId}_${appInfor.appCode}_${param.locale}_Version`.toLowerCase();

    var { data } = await api.post("/api/Language", {
      tenantId: appInfor.tenantId,
      appcode: appInfor.appCode,
      locale: param.locale
    });

    if (data) {
      var currentVersion = window.localStorage.getItem(langVersionKey);
      var applevel = {
        system: {}
      };
      if (
        data.version == currentVersion &&
        window.localStorage.getItem(langKey)
      ) {
        var languageCache = JSON.parse(window.localStorage.getItem(langKey));
        param.self.$i18n.mergeLocaleMessage(
          param.locale,
          languageCache[param.pageView]
        );
        Object.assign(
          applevel.system,
          languageCache["system"]
        );
        // merge the default global control which not related to page. such as menu and appName
        param.self.$i18n.mergeLocaleMessage(param.locale, applevel);
        // return;
      } else {
        window.localStorage.setItem(langKey, data.settings);
        // merge the current page
        param.self.$i18n.mergeLocaleMessage(
          param.locale,
          JSON.parse(data.settings)[param.pageView]
        );

        // merge the default global control which not related to page. such as menu and appName
        Object.assign(
          applevel.system,
          JSON.parse(data.settings)["system"]
        );
        param.self.$i18n.mergeLocaleMessage(param.locale, applevel);
        window.localStorage.setItem(langVersionKey, data.version);
      }
    }
  },
  async actionRenderFontList({commit, dispatch}, {url, key}) {
    const fontListItems = await dispatch('actionGetFontList', {url, key})
    commit("SET_FONTLISTITEMS", fontListItems)
  },
  async actionGetFontList({dispatch}, {url, key}) {
    const fontList = await dispatch('actionGetPreferenceListByType', {url, key})

    const fontListItems = []
    if(fontList) {
      const parsedFontList = fontList.value ? JSON.parse(fontList.value) : []
      parsedFontList.sort((a,b) => b.lastModifiedTime - a.lastModifiedTime).forEach((res) =>{
          const id = res.id
          const fontName = res.fontName
          const fontFileList = res.fontFileList
          const lastModifiedBy = res.lastModifiedBy
          const lastModifiedTime = res.lastModifiedTime
          fontListItems.push({
              id,
              fontName,
              fontFileList,
              lastModifiedBy,
              lastModifiedTime
          })
      })
    }
    return fontListItems
  }
};
