var tenantId = ''
var appCode = ''

function pathTrans (path, isApi, tId) {
  var url = window.location.href
  if (url && url.split('/').length > 4) {
    tenantId = url.split('/')[3];
    appCode = url.split('/')[4];
    //判断appCode是否携带环境变量
    if(appCode.indexOf("?") !== -1){
      appCode = appCode.split('?')[0];
    }
  }
  if (isApi) {
    if (tId) {
      tenantId = tId
    }    
    path = window.urlMode === 'NOTENANTAPPCODE' ? `/api${path}` : ('/' + tenantId + '/' + appCode + '/api' + path);
  } else {
    path = window.urlMode === 'NOTENANTAPPCODE' ? path : ('/' + tenantId + '/' + appCode + path);
  }
  return path
}

export default pathTrans
