import { set } from "../../../utils/vuex";
import Vuetify from '../../../plugins/vuetify'

export default {
  setLoading: set("loading"),
  setEnv: set("env"),
  setIsPCBroswer: set("isPCBroswer"),
  setQyerySelectedResult: set("qyerySelectedResult"),
  setbuttonLoading: set('setbuttonLoading'),
  setbuttonLoading: set('setDetailLoading'),
  setQyeryGroupResult: set("qyeryGroupResult"),
  setDirection: set("direction"),
  setUserInfo: (state, userInfo) => {
    state.userInfo = userInfo;
    //window.localStorage.setItem('userInfo', userInfo);
  },
  setAppInfo: (state, appInfo) => {
    state.appInfo = appInfo;
    // window.localStorage.setItem('appInfo', appInfo);
  },
  setAppLogo: (state, payload) => {
    state.appLogo = payload.appLogo || "/static/images/logo.svg";
    window.ls.set(`${payload.appcode}@Logo`, payload.appLogo);
  },
  setListQueryCache: (state, payload) => {
    if (payload.name) {
      state.listQueryCache[payload.name] = payload.value;
    }
  },
  setWindowWidth: set("windowWidth"),
  setnavigationDrawerActiveItem: set("navigationDrawerActiveItem"),
  setBreadcrumbsData: set("breadcrumbsData"),
  setSortByDataItems(state, obj) {
    state.sortByDataItems.push(obj);
  },
  setViewDataExport: set("viewdataExport"),
  setDataTableGroupParameter: set("dataTableGroupParameter"),
  setCurrentComponent: set("currentComponent"),
  setMapApiLoadState: set("mapapiloaded"),
  setQyeryResult: (state, obj) => {
    state.qyeryResult[obj.key] = obj.value;
  },
  setAppPerference: (state, data) => {
    state.appPerference = { ...state.appPerference, ...data };
  },
  setErrorSnack: (state, data) =>{
    state.errorSnack.showErrorSnack = data?data.showErrorSnack:false;
    state.errorSnack.errorSnackMsg = data?data.errorSnackMsg:"";
    state.errorSnack.snackTimeOut = data?data.snackTimeOut:5000;
    state.errorSnack.snackColor = data?data.snackColor:"red";
  },
  setCurrentPageType: (state, data) =>{
    state.currentpagetype = data;
  },
  setUploadOverlayProgress: set("uploadOverlayProgress"),
  setEnableWorkflow: set("enableWorkflow"),
  setbuttonLoading: set("buttonLoading"),
  setenableEditMode: set("enableEditMode"),
  setshowWorkflowButtons: set("showWorkflowButtons"),
  setisEndState: set("isEndState"),
  setcurrentActionCodeList: (state, data) =>{
    state.currentActionCodeList = data;
  },
  setworkflow:(state, payload)=>{
    state.workflow[payload.pageCode] = {
      'enableWorkflow': payload.enableWorkflow,
      'isEndState': payload.isEndState,
      'currentActionCodeList': payload.currentActionCodeList,
      'showWorkflowButtons' : payload.showWorkflowButtons,
      'enableEditMode' : payload.enableEditMode,
      'workflowStates': payload.workflowStates
    };
  },
  setformFieldsSettings: (state, payload) => {
    if(state.formFieldsSettings && state.formFieldsSettings[payload.formCode]){
      state.formFieldsSettings[payload.formCode][payload.docId] = payload.notUpdateField;
    } else{
      state.formFieldsSettings[payload.formCode]= {
        [payload.docId]: []
      };
      state.formFieldsSettings[payload.formCode][payload.docId] = payload.notUpdateField;
    }
  },
  setFloatingButtonItems(state, obj) {
    state.floatingButtonItems.push(obj);
  },
  SET_THEMELIST(state, val) {
    state.appPerference.theme['themeList'] = val;
  },
  SET_FONTLIST(state,val){
    state.appPerference.theme['fontList'] = val;
  },
  SET_FONTLISTITEMS(state,val){
    state.fontListItems = val;
  },
  SET_CURRENTTHEME(state, val) {
    state.appPerference.theme.currentTheme = val;

    let themeName = val.name;
    let defaultThemeColor = state.appPerference.theme['themeList'];
    if(!themeName in defaultThemeColor) return;
    if(!(defaultThemeColor[themeName] && 'color' in defaultThemeColor[themeName])) return;
    Vuetify.framework.theme.dark = val.dark;
    for(let [key, values] of Object.entries(defaultThemeColor[themeName].color)){
          Vuetify.framework.theme.themes.light[key] = values;
          Vuetify.framework.theme.themes.dark[key] = values;
    }
    console.log(themeName,'themeName')
    if(themeName === 'PwC'){
      document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend","<link rel=\"stylesheet\" href=\"/static/skins/DM/css/pwc.css\" />");
    }
  }
};
