var appInfo = {};

function getAppInfo() {
  var url = window.location.href
  if(window.urlMode == 'NOTENANTAPPCODE') {
    appInfo.tenantId = window.tenantInRequest
    appInfo.appCode = window.appCodeInRequest
  }else if (url && url.split('/').length > 4) {
    appInfo.tenantId = url.split('/')[3];
    appInfo.appCode = url.split('/')[4];
  }
  appInfo.appCodeWithTenant = `${appInfo.appCode}@${appInfo.tenantId}`;
  return appInfo;
}

export default getAppInfo
