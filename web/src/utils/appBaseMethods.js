import {getParameterByName,getEnv,exportEnvUrl} from './env'
import moment from 'moment-timezone';

function getBaseUrlByLink() {
  if (window.urlMode && window.urlMode.toUpperCase() == 'NOTENANTAPPCODE') {
    return '';//window.tenantInRequest+"/"+ window.appCodeInRequest;
  }else{
    return window.location.pathname.split("/").splice(0, 3).join("/");
  }  
}

function getApplicationCode(baseUrl) {
  return baseUrl.split("/")[2] + "@" + baseUrl.split("/")[1];
}

function pathTrans(path) {
  return getBaseUrlByLink() + path;
}

function formatFieldValue(model, header, that) {  
  let val = header.value || header.model;
 //如果是int类型，且填写了0，需要处理一下这种情况。
  if(header.dataType.toLowerCase() == "int") {
    return (String(model[val]) || "").toString();
  }else if (!model[val]) {
    return "";
  }
  if ((model[val] ? model[val].length : 0) == 0) {
    return "";
  }
  switch (header.dataType.toLowerCase()) {
    case "user":
    case "picker":
      try {
        if (model[val].length > 1) {
          let showValue = "";
          model[val].map((itemData) => {
            showValue = showValue + itemData[header.dataFormat] + ",";
          });
          showValue = showValue.substr(0, showValue.length - 1);
          return showValue;
        } else if (model[val].length == 1) {
          return model[val][0][header.dataFormat];
        } else {
          return "";
        }
      } catch (ex) { return ""; }
      break;
      case "datetimerange":
        let dateFormat = that.$store.state.app.appPerference.GlobalDateFormat.split("HH").length > 0 ? that.$store.state.app.appPerference.GlobalDateFormat.split("HH")[0] : 'DD/MM/YYYY',
          rangeDataFormat = header.dataFormat ? header.dataFormat : '',
          setDateFormat = rangeDataFormat == "" ?  dateFormat : rangeDataFormat;
        const valStart =  that.$options.filters["dateformat"](model[val].Start, setDateFormat),
          valEnd =  that.$options.filters["dateformat"](model[val].End, setDateFormat);
        return `${valStart}~${valEnd}`
      break;
      case "datetime":
        let format = header.dataFormat
          ? header.dataFormat
          : that.$store.state.app.appPerference.GlobalDateFormat;
        
        //处理没有配置format的情况
        let datetimeMode = header.datetimeMode ? header.datetimeMode : '';
        let dataFormat = header.dataFormat ? header.dataFormat : '';
        if (datetimeMode == 'time' && dataFormat == '') {
          format = that.$store.state.app.appPerference.GlobalDateFormat.split("HH").length > 1 ? "HH" + that.$store.state.app.appPerference.GlobalDateFormat.split("HH")[1] : "HH:mm:ss";
          //console.log(format);
        } else if (datetimeMode == 'date' && dataFormat == '') {
          format = that.$store.state.app.appPerference.GlobalDateFormat.split("HH").length > 0 ? that.$store.state.app.appPerference.GlobalDateFormat.split("HH")[0] : 'DD/MM/YYYY';
        }
  
        return that.$options.filters["dateformat"](
          model[val],
          format
        );
        break;
    case "keyvaluepairs":
      let returnVal = ''
      if (model[val] && model[val].length > 0) {
        model[val].map(m => {
          returnVal = returnVal + (m[header.dataFormat] ? m[header.dataFormat] : m['value']) + ",";
        })
        returnVal = returnVal.substr(0, returnVal.length - 1)
      }
      return returnVal;
      break;
    case "customobjects":
      let result = []
      if (model[val] && model[val].length > 0) {
        model[val].map(m => {
          let mVal = m[header.dataFormat.name]
          result.push((header.dataFormat.dataType.toLowerCase() == 'datetime') ? moment(mVal).format(that.$store.state.app.appPerference.GlobalDateFormat) : mVal )
        })
      }
      return result.join();
      break;
    case "strings":
      return (model[val] || "").toString();
      break; 
    default:
      return (model[val] || "").toString();
      break;
  }
}
function getUserAvatar(that){
    if (that.isAnonymousUser) {
      return that.$store.getters.cdnHostAndVersionPath + "/static/images/user.svg";
    } else {
      let userAvatar =  that.userInfo.avatar != null && that.userInfo.avatar != "" && that.userInfo.avatar != "System.Byte[]"

      return userAvatar ? "data:image/jpg;base64," + that.userInfo.avatar : that.$store.getters.cdnHostAndVersionPath + "/static/images/user.svg";
    }

}
/**
 * @description 从cookie中提取指定key的数据
 * @param {String} keyName 例如：XSRF-TOKEN
 * @return {String} 返回对应的字段值
 */
function getCookie(keyName) {
  var name = `${keyName}=`;
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/**
 * @description 提取URL中的小写接口名
 * @param {String} url 例如：/jason/testapp/api/UploadEditorThumbnail?env=dev
 * @return {String} 返回小写接口名：uploadeditorthumbnail
 */
function extractMethod(url) {
  //先处理url 中 的 ？ 和 &
  let urlclean = url;
  let queryIndex = url.indexOf('?');
  if (queryIndex > -1) {
    //如果url中存在？，去掉？后面的字符
    urlclean = urlclean.substring(0, queryIndex);
  }
  let methodSplit = urlclean.split('/');
  //格式应该是api/xxx/ccc
  let apiIndex = methodSplit.indexOf("api");
  let lastMethodName = methodSplit[apiIndex + 1];
  // 返回小写方法名
  return lastMethodName.toLocaleLowerCase();
}

/**
 * @description 生成散列数组，数组长度为10，依赖extractMethod方法提取接口名称
 * @param {String} method，实际上是url 例如：/jason/testapp/api/UploadEditorThumbnail?env=dev
 * @return {Array} 返回散列数组
 */
function hashParams(method) {
  let params = [];
  let lastMethodName = extractMethod(method);
  for (let index = 0; index < 10; index++) {
    params[index] = String.fromCharCode(65 + Math.round(Math.random() * 6));
  }
  let firstAlpha = lastMethodName.substr(0, 1).toLocaleLowerCase();
  let index = firstAlpha.charCodeAt();
  //小写字母a-z对应的ASCII码值是97-122
  //此处需要散列到10个参数中。
  var finalIndex = (index - 97) % 10;
  params[finalIndex] = 'sys';
  return params;
}

function getDomainName(){
  let domainName = location.origin
  if(window.urlMode != 'NOTENANTAPPCODE'){
    let tenantidAppcode = window.location.pathname.split("/").slice(1,3).join('/')
    return `${domainName}/${tenantidAppcode}`
  }
  return domainName
}

export {
  getDomainName,
  getBaseUrlByLink,
  getApplicationCode,
  pathTrans,
  getEnv,
  exportEnvUrl,
  formatFieldValue,
  getParameterByName,
  getCookie,
  extractMethod,
  hashParams,
  getUserAvatar
}
