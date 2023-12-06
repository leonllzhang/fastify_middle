// 获取对应的路由，格式化为tenant/appCode
function getBaseUrlByLink() {
    // 后期增加无tenant 和appcode 逻辑
    // let endPos = window.urlMode === 'NOTENANTAPPCODE' ? 1 : 3;
    // return window.location.pathname.split("/").splice(0, endPos).join("/");
    return window.location.pathname
      .split("/")
      .filter((item) => item != "")
      .splice(0, 2)
      .join("/");
  }
  
  function getTenantAppCode() {
    let tenantAppCode = {
      tenantCode: "",
      appCode: "",
    };
    let tAndAarray = window.location.pathname
      .split("/")
      .filter((item) => item != "")
      .splice(0, 2);
    tenantAppCode.tenantCode = tAndAarray[0];
    tenantAppCode.appCode = tAndAarray[1];
    return tenantAppCode;
  }
  
  // 获取vProfile使用的appCode，格式为appCode@tenant
  function getAppCodeforvProfile() {
    return window.location.pathname
      .split("/")
      .filter((item) => item != "")
      .splice(0, 2)
      .reverse()
      .join("@");
  }


  module.exports = {
    getBaseUrlByLink: getBaseUrlByLink,
    getTenantAppCode: getTenantAppCode,
    getAppCodeforvProfile: getAppCodeforvProfile
  };