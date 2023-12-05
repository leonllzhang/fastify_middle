const fs = require('fs');
const boom = require('boom');
const apiLib = require('../../../config');
const digitalMaker = require('../../utils/appMakerTools/index');
const axios = require('../../utils/appMakerTools/axios');

const getDocCountController = async function (request, reply) {
    try {
        var result = null;
        var requestObj = {
            pageCode: request.body.pageCode,
        };
        var apiUrl = apiLib.apiSettings.appMaker.host + "/" + apiLib.apiSettings.tenantCode + "/" +
            apiLib.apiSettings.appCode + apiLib.apiSettings.appMaker.apis.getDocsCount;
        let res = await digitalMaker.post(apiUrl, requestObj, {
            appKey: apiLib.apiSettings.appMaker.appKey,
            securityKey: apiLib.apiSettings.appMaker.securityKey
        });
        if (res && res !== "") {
            res = JSON.parse(res);
            if (res && res.statusCode && res.statusCode === 200) {
                result = res.data;
            }
        }
        reply.send({
            statusCode: 200,
            message: "Success",
            data: result
        });
    } catch (err) {
        throw boom.boomify(err);
    }
};

const getAnonymousController = async function (request, reply) {
    try {
        var result = null;   
        var pageCode = request.body.pageCode;
        var pageType = request.body.pageType;   
       
        var apiUrl = apiLib.ngSettings.appMaker.host + "/" + apiLib.ngSettings.tenantCode + "/" +
            apiLib.ngSettings.appCode +`/page/${pageCode}/${pageType}` +apiLib.ngSettings.appMaker.apis.anon;
            apiUrl = apiUrl
        let res = await axios.get(apiUrl);
        if (res && res !== "") {
            //res = JSON.parse(res);
            if (res && res.status && res.status === 200) {
                result = res.data;
            }
        }
        reply.send({
            statusCode: 200,
            message: "Success",
            data: result
        });
    } catch (err) {
        throw boom.boomify(err);
    }
};

const getNgController = async function (request, reply) {
    try {
        var result = null;   
        var pageCode = request.body.pageCode;
        var pageType = request.body.pageType;   
       
        var apiUrl = apiLib.ngSettings.appMaker.host + "/" + apiLib.ngSettings.tenantCode + "/" +
            apiLib.ngSettings.appCode +`/page/${pageCode}/${pageType}` +apiLib.ngSettings.appMaker.apis.access;
            apiUrl = apiUrl
        let res = await axios.get(apiUrl);
        if (res && res !== "") {            
            if (res && res.status && res.status === 200) {
                
                result = res.data;
            }
        }
        reply.send({
            statusCode: 200,
            message: "Success",
            data: result
        });
    } catch (err) {
        throw boom.boomify(err);
    }
};


module.exports = {
    getDocCountController: getDocCountController,
    getAnonymousController : getAnonymousController,
    getNgController: getNgController
};