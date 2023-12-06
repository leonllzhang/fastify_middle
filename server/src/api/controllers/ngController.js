const server = require("../../configs/serverConfig");
const boom = require("boom");
const { getResult } = require("../../utils/apiHelper");

// const getDocCountController = async function (request, reply) {
//     try {
//         var result = null;
//         var requestObj = {
//             pageCode: request.body.pageCode,
//         };
//         var apiUrl = apiLib.apiSettings.appMaker.host + "/" + apiLib.apiSettings.tenantCode + "/" +
//             apiLib.apiSettings.appCode + apiLib.apiSettings.appMaker.apis.getDocsCount;
//         let res = await digitalMaker.post(apiUrl, requestObj, {
//             appKey: apiLib.apiSettings.appMaker.appKey,
//             securityKey: apiLib.apiSettings.appMaker.securityKey
//         });
//         if (res && res !== "") {
//             res = JSON.parse(res);
//             if (res && res.statusCode && res.statusCode === 200) {
//                 result = res.data;
//             }
//         }
//         reply.send({
//             statusCode: 200,
//             message: "Success",
//             data: result
//         });
//     } catch (err) {
//         throw boom.boomify(err);
//     }
// };

const getAccessController = async function (request, reply) {
  try {
    var result = null;
    var pageOptions = {};
    pageOptions.host = server.config.ngSettings.host;
    pageOptions.tenantCode = request.body.tenantCode;
    pageOptions.appCode = request.body.appCode;
    pageOptions.pageCode = request.body.pageCode;
    pageOptions.pageType = request.body.pageType;

    var res = await getResult("/getaccess", pageOptions);
    if (res && res.status && res.status === 200) {
      result = res.data;
    }
    reply.send({
      statusCode: 200,
      message: "Success",
      data: result,
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

const getAnonymousController = async function (request, reply) {
  try {
    var result = null;
    var pageOptions = {};
    pageOptions.host = server.config.ngSettings.host;
    pageOptions.tenantCode = request.body.tenantCode;
    pageOptions.appCode = request.body.appCode;
    pageOptions.pageCode = request.body.pageCode;
    pageOptions.pageType = request.body.pageType;
    var res = await getResult("/anon/" + request.body.pageMode, pageOptions);

    if (res && res.status && res.status === 200) {
      result = res.data;
    }
    reply.send({
      statusCode: 200,
      message: "Success",
      data: result,
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

const getAppPreferenceController = async function (request, reply) {
  try {
    var result = null;
    var pageOptions = {};
    pageOptions.host = server.config.ngSettings.host;
    pageOptions.tenantCode = request.body.tenantCode;
    pageOptions.appCode = request.body.appCode;

    var res = await getResult("/run/pref/" + request.body.key, pageOptions);

    if (res && res.status && res.status === 200) {
      result = res.data;
    }
    reply.send({
      statusCode: 200,
      message: "Success",
      data: result,
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

const getLanguageController = async function (request, reply) {
  try {
    var result = null;
    var pageOptions = {};
    pageOptions.host = server.config.ngSettings.host;
    pageOptions.tenantCode = request.body.tenantCode;
    pageOptions.appCode = request.body.appCode;

    var res = await getResult("/locale/" + request.body.locale, pageOptions);

    if (res && res.status && res.status === 200) {
      result = res.data;
    }
    reply.send({
      statusCode: 200,
      message: "Success",
      data: result,
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

const getSchemaController = async function (request, reply) {
  try {
    var result = null;
    var pageOptions = {};
    pageOptions.host = server.config.ngSettings.host;
    pageOptions.tenantCode = request.body.tenantCode;
    pageOptions.appCode = request.body.appCode;

    var res = await getResult(
      "/page/" +
        request.body.pageView +
        "/" +
        request.body.pageType +
        "/mode/" +
        request.body.pageMode,
      pageOptions
    );

    if (res && res.status && res.status === 200) {
      result = res.data;
    }
    reply.send({
      statusCode: 200,
      message: "Success",
      data: result,
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

module.exports = {
  getAccessController: getAccessController,
  getAnonymousController: getAnonymousController,
  getAppPreferenceController: getAppPreferenceController,
  getLanguageController: getLanguageController,
  getSchemaController: getSchemaController,
};
