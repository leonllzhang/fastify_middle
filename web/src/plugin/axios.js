const axios  = require('axios');
const settings = require('../../appsettings.yaml')
const { getAppCodeforvProfile } = require('../utils/baseMethods')
// import settings from "../../appsettings.yaml";
// import { getAppCodeforvProfile } from '../utils/baseMethods';


let options = {
    withCredentials: true,
    crossDomain: true,    
}

const _axios = axios.create(options);

_axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'


_axios.interceptors.request.use(
    function (config) {
        
        config.headers = {
            "authorization": localStorage.getItem("jwtToken") || ""
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
)

_axios.interceptors.response.use(
    function (response) {
        console.log('response now,', response)
        return response;
    },
    function (error) {        
        console.log('error now,', error)
        if (error.response.status && error.response.status === 403) {
            // 403 清除token信息并跳转到登录页面
            localStorage.removeItem('jwtToken');
            // 重定向到登录页面
            loginUrlConcat();
                        
        }

        
        return Promise.reject(error);
    }
)

function loginUrlConcat() {
    var vProfileLoginUrl = `${settings.AppApiUrl.vProfileExternalUrl}${settings.AuthSettings.FormAuthLoginUrl}`;
    
    var finalUrl = "";
    var hasQuery = vProfileLoginUrl.indexOf("?") > 0;
    var appCode = getAppCodeforvProfile();
  
    if (hasQuery) {
      finalUrl = `${vProfileLoginUrl}&appCode=${appCode}&returnUrl=${encodeURI(
        window.location.href
      )}`;
    } else {
      finalUrl = `${vProfileLoginUrl}?appCode=${appCode}&returnUrl=${encodeURI(
        window.location.href
      )}`;
    }
    window.open(finalUrl, "_self");
  }


module.exports = _axios;