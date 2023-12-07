export default {
  cdnHostAndVersionPath(state){
      if(state.enableCDN){
        return state.cdnHost+"/"+state.version;
      }else{
        const isEnableCdn = (window.enableCdn && window.enableCdn.toLowerCase() === 'true');
        let result = ""
        if(isEnableCdn){
          result = window.cdnHost + "/" +window.version
        }
        return result
      }      
  },
  baseUrl(state) {
    if (window.urlMode === 'NOTENANTAPPCODE') return ''
    if (state && state.appInfo && state.appInfo.tenantCode && state.appInfo.appCode) {
      return "/" + state.appInfo.tenantCode + "/" + state.appInfo.appCode;
    } else {
      return window.location.pathname.split("/").splice(0, 3).join("/");
    }
  },
}
