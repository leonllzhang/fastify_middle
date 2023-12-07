/*
 * @Author: your name
 * @Date: 2021-11-12 14:04:56
 * @LastEditTime: 2021-11-29 17:05:25
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \GeneratorMaker\utils\env.js
 */
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(window.top.location.search.toLowerCase());
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getEnv() {
  var env = "prod";
  if (window.top.location.search.toLowerCase().indexOf("env=") > -1) {
    env = getParameterByName("env").toLowerCase();
  }
  return env;
}

function exportEnvUrl(url) {
  let env = getEnv();
  if (env && env.toLowerCase() != 'prod') {
    var newUrl = url;
    var idx = url.indexOf('?');
    if (idx < 0) {
      newUrl += '?';
    } else if (idx >= 0 && idx != url.length - 1) {
      newUrl += '&';
    }
    newUrl = newUrl + "env=" + env;
    return newUrl;
  } else {
    return url
  }
}
export {
  getEnv,
  exportEnvUrl,
  getParameterByName
}
