import {
  actions,
  mutations
} from '../utils/store-constants';
import {_axios} from "../plugin/axios";

export default {
  [actions.syncUserInfo]: ({
    state,
    commit
  },param) => {
    var userInfo = state.userInfo;
        //if (!userInfo) {
    //  // userInfo = window.localStorage.getItem('userInfo');
    //  var apptenant = param.param;
    //  userInfo = window.ls.get(`${apptenant}@userInfo`);
    //  if (userInfo) {
    //    userInfo = JSON.parse(userInfo);
    //    //兼容userID,userName当首次获取浏览器数据，而非新接口时，该字段不存在问题
    //    userInfo.userID = userInfo.userID || userInfo.staffId
    //    userInfo.userName = userInfo.userName || userInfo.staffName
    //    // if (userInfo.expiry && (Date.now() - userInfo.expiry < state.expiry)) {
    //    //   userInfo = userInfo.value;
    //      commit(mutations.setUserInfo, userInfo)
    //    // } else {
    //    //   userInfo = null;
    //    // }
    //  }
    //}
    return userInfo;
  },
  [actions.syncAppInfo]: (({
    state,
    commit
  }, appCode) => {
    var appInfo = state.appInfo;
    if (!appInfo) {
      // appInfo = window.localStorage.getItem(`${appCode}@Info`);
      //appInfo = window.ls.get(`${appCode}@Info`);
      appInfo ="";
      if (appInfo) {
        appInfo = JSON.parse(appInfo);
        commit(mutations.setAppInfo, appInfo)
      }
    }
    return appInfo;
  }),
  [actions.syncAppLogo]: (({
    state,
    commit
  }, appCode) => {
    var appLogo = state.appLogo;
    if (!appLogo) {
      // appLogo = window.localStorage.getItem(`${appCode}@Logo`);
      appLogo = window.ls.get(`${appCode}@Logo`);
      if (appLogo) {
        commit(mutations.setAppLogo, appLogo)
      }
    }
    return appLogo;
  }),
  async actionsGetDocumentResult(context, { pageAlias, id, pageMode, pageType, hostUrl,requestUrl,delegate}) {
    let documentObject = {
      result: {
        model: {},
        schemas: [],
        styles: null,
        extendResult: {},
        statusCode: 200,
        message: ''
      }
    };

    if (pageAlias && pageMode && pageType) {
      let dataResult = await _axios.post("/api/getDocumentResult", {
        pageAlias,
        id,
        pageMode,
        pageType,
        hostUrl,
        requestUrl,
        delegate
      });
      let data = dataResult.data;
      if (data.statusCode == 200) {
        /*处理业务数据的逻辑*/
        let documentData = data.data;
        //处理render的处理逻辑,需要处理可能要过滤一些数据不返回。
        let customcodeResult = documentData.customCodeResult;
        //记录不更新的字段，提交的时候不往后提交
        if (documentData.notUpdateField.length > 0) {
          let formfieldsettings = {
            formCode: pageAlias,
            docId: id,
            notUpdateField: documentData.notUpdateField,
          };
          context.commit('app/setformFieldsSettings', formfieldsettings);
        }
        let customData = {};
        //this.model.customData
        if (customcodeResult && customcodeResult.success) {
          if (customcodeResult.result) {
            if (
              customcodeResult.result &&
              customcodeResult.result.redirectUrl
            ) {
              window.top.location.href =
                customcodeResult.result.redirectUrl;
              return Promise.reject();
            } else {
              customData = customcodeResult.result.returnData;
            }
          }
        }
        documentObject.result.model = documentData.data;
        //documentObject.extendResult = data.extendResult;  //目前没有看到使用场景,先屏蔽
        documentObject.result.model.customData = customData;

        /*处理Schema*/
        // this is whole page object.
        // add logic for add, edit, preview
        let schemaData = data.schemaResult;
        let schema = schemaData.schema;
        if (schemaData.enableMultiMode) {
          switch (pageMode.toLowerCase()) {
            //case "add":
            //  schema = schemaData.aSchema ? schemaData.aSchema : {};
            //  break;
            case "preview":
              schema = schemaData.pSchema ? schemaData.pSchema : {};
            case "delegate":
              schema = schemaData.pSchema ? schemaData.pSchema : {};
            default:
              break;
          }
        }
        documentObject.result.styles = schemaData.styles;
        documentObject.result.schemas = JSON.parse(schema);

        /*处理workflow*/
        if (data.workFlowEnabled && data.workFlowResult) {

          let actionCodeList = [];
          let enabledEditMode = false;
          let showWorkflowButton = data.workFlowResult[0].showWorkflowButton;
          if(data.workFlowResult.length>1){
            for(let i=0;i<data.workFlowResult.length;i++){
              actionCodeList = actionCodeList.concat(data.workFlowResult[i].actionCodeList);
              if(data.workFlowResult[i].editControl){
                enabledEditMode = true;
              }
            }
          }else{
            actionCodeList = data.workFlowResult[0].actionCodeList;
            enabledEditMode = data.workFlowResult[0].editControl;
          }

          var currentFormWorkflowSettings = {
            pageCode : pageAlias.toLowerCase(),
            enableWorkflow: data.workFlowEnabled,
            isEndState: data.workFlowIsEndState,
            currentActionCodeList: actionCodeList,
            showWorkflowButtons: showWorkflowButton,
            enableEditMode: enabledEditMode,
            workflowStates: data.workFlowResult
          };

          context.commit('app/setworkflow', currentFormWorkflowSettings);
          // context.commit('app/setEnableWorkflow', data.workFlowEnabled);
          // context.commit('app/setisEndState', data.workFlowResult.isEndState);
          // context.commit('app/setcurrentActionCodeList', data.workFlowResult.actionCodeList);
          // context.commit('app/setshowWorkflowButtons', data.workFlowResult.showWorkflowButton);
          // context.commit('app/setenableEditMode', data.workFlowResult.editControl);

          //delegate user role
          documentObject.result.delegateRoles = data.delegateRoles;
          documentObject.result.model.delegateRoles = data.delegateRoles;
        }
      } else {
        documentObject.result.statusCode = data.statusCode ;
        documentObject.result.detailCode = data.error && data.error.detailCode? data.error.detailCode : 'System error';
      }
      context.commit("SET_LOADING", false);
      return documentObject;

    } else {
      documentObject.result.statusCode = 400;
      documentObject.result.message = "Invalid Request, getDocument";
      return documentObject;
    }
  },
  async actionsCheckPageAnonymous(context, { pageType, pageName, pageMode }) { // 查询页面是否开启匿名
    let result = await _axios.asynPost('/api/GetPageAnonymousSettings', { pageType, pageName, pageMode });
    return result;
  },
  async actionsGetEnablePwc(context){
    let tenant = window.location.pathname.split("/").splice(1,1)[0]
    //let value = window.ls.get(`${tenant}@enablePwc`); 
    let value = "false"; 
    if (value && value === "true"){
      value = true;
    } else if(value && value == "false"){
      value = false;
    } else {
      let data = await  _axios.asynPost("/api/vp/GetOrganizationByCode", {})
      value = data.Data.EnablePwC
    }
    context.commit('mutationsSetEnablePwc', value)
    return value;
  }
}
