const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
var CryptoJS = require("crypto-js");

dayjs.extend(utc);

const getApiPath = function (pageOptions, apiName) {
  var apiPath = "";
  if (pageOptions) {
    if (pageOptions.type && pageOptions.type === "vProfile") {
      apiPath += pageOptions.host;
    } else {
      if (pageOptions.host && pageOptions.tenantCode && pageOptions.appCode) {
        apiPath +=
          pageOptions.host +
          "/" +
          pageOptions.tenantCode +
          "/" +
          pageOptions.appCode;
      }
      if (pageOptions.pageCode && pageOptions.pageType) {
        apiPath += "/page/" + pageOptions.pageCode + "/" + pageOptions.pageType;
      }
    }
  }
  if (apiName) {
    apiPath += apiName;
  }
  return apiPath;
};

const getTimeDate = function (unix, formatStr) {
  return dayjs(unix).format(formatStr);
};

const getTimeDates = function (unixArray, formatStr) {
  var returnList = [];
  for (var i = 0; i < unixArray.length; i++) {
    var item = dayjs(unixArray[i]).format(formatStr);
    returnList.push(item);
  }
  return returnList;
};

const getTimeUnix = function (time) {
  var result = time;
  if (typeof time === "number") {
    result = dayjs(dayjs(time).format("YYYY-MM-DD")).utc().valueOf();
  } else if (typeof time === "string") {
    result = dayjs(time).utc().valueOf();
  }
  return result;
};

const get7dayTimeUnixList = function (targetUnix, minCount) {
  var returnList = [];
  var nowUnix = getTimeUnix(dayjs.utc().valueOf());
  var _7dayUnix = 7 * 24 * 60 * 60 * 1000;
  for (var i = 0; i < minCount; i++) {
    var itemUnix =
      returnList.length > 0
        ? returnList[i - 1] - _7dayUnix
        : targetUnix - _7dayUnix;
    if (itemUnix > nowUnix) {
      returnList.push(itemUnix);
    } else {
      break;
    }
  }
  if (returnList.length < minCount) {
    returnList.unshift(targetUnix);
  }
  return returnList;
};

const getNextDaysTimeUnixList = function (unix, count) {
  var returnList = [];
  var dayUnix = 24 * 60 * 60 * 1000;
  for (var i = 0; i < count; i++) {
    returnList.push(
      returnList.length > 0 ? returnList[i - 1] + dayUnix : unix + dayUnix
    );
  }
  return returnList;
};

const aesEncrypt = function (value, key) {
  let srcs = CryptoJS.enc.Utf8.parse(value);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: CryptoJS.enc.Utf8.parse(key),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
};

module.exports = {
  getApiPath: getApiPath,
  getTimeDate: getTimeDate,
  getTimeDates: getTimeDates,
  getTimeUnix: getTimeUnix,
  get7dayTimeUnixList: get7dayTimeUnixList,
  getNextDaysTimeUnixList: getNextDaysTimeUnixList,
  aesEncrypt: aesEncrypt,
};
