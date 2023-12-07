import {
  mutations as constants
} from '../utils/store-constants';
import Vue from "vue";

var _set_loading = function (state, val) {
  state.loading = !!val;
};
// eslint-disable-next-line camelcase
var _disable_loading = function (state, val) {
  state.disableLoading = !!val;
};
var _set_currentTimeOut = function (state, val) {
  state.currentTimeOut = val;
}
export default {
  SET_LOADING: _set_loading,
  DISABLE_LOADING: _disable_loading,
  SET_CURRENTTIMEOUT: _set_currentTimeOut,
  [constants.setUserInfo]: function (state, val) {
    state.userInfo = val;

  },
  [constants.setAppInfo]: function (state, val) {
    state.appInfo = val;
  },
  [constants.setAppLogo]: function (state, val) {
    state.appLogo = val;
  },
  [constants.showMenu]: function (state, val) {
    state.showMenu = !!val;
  },
  SET_ENABLECDN: function (state, val) {
    state.enableCDN = val;
  },
  SET_CDNHOST: function (state, val) {
    state.cdnHost = val;
  },
  SET_VERSION: function (state, val) {
    state.version = val;
  },
  SET_ANONYMOUSUSER: function (state, val) {
    state.isAnonymousUser = val;
  },
  SET_ComponentStatus: function (state, val) {
    Vue.set(state, 'componentStatus', val) 
  },
  SET:(state,payload)=>{
    state[payload.property] = payload.val
  },
  mutationsSetEnablePwc(state, enablePwc) {
    state.enablePwc = enablePwc
    let tenant = window.location.pathname.split("/").splice(1,1)[0]
    window.ls.set(
      `${tenant}@enablePwc`,enablePwc
    );
  },
  SET_EXPOROWS: function(state, obj){
    state.exportRows = obj;
  },
  SET_IMPLICITTENANT: function(state, obj){
    state.implicitTenant = obj;
  },
  SET_IMPLICITAPPCODE: function(state, obj){
    state.implicitAppCode = obj;
  },
  SET_ISCUSTOMLOGINPAGE:  function(state, obj){
    state.isCustomLoginPage = obj;
  }
}
