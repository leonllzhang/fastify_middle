const server = require('../../configs/serverConfig');
const boom = require('boom');
const { postResult } = require('../../utils/apiHelper');
const utils = require('../../utils/utils')

const verifyController = async function (request, reply) {
    try {
        var result = {};   
        var pageOptions ={};
        pageOptions.type = "vProfile";
        pageOptions.host = server.config.vProfileSettings.host;
        var paraOptions ={};
        paraOptions.Token= request.body.serviceTicket;
        paraOptions.APIAccess= server.config.vProfileSettings.apiAccess;
        paraOptions.WithRole = true;
        paraOptions.WithGroup = true;
        // paraOptions.WithAvatar = true;
        paraOptions.RoleSourceAppCode = request.body.roleSourceAppCode;

        var res = await postResult(server.config.vProfileSettings.apis.verify, pageOptions, paraOptions);
        if (res && res.status && res.status === 200) {
            result.userInfo = res.data.Data;
            result.jwtToken = utils.jwtSign(res.data.Data, server.config.app.jwtSecreKey, server.config.app.jwtExpireTime);
        }
        reply.send({
            statusCode: 200,
            message: "Success",
            data: result
        });
        reply.send(returnResult);
    } catch (err) {
        throw boom.boomify(err);
    }
};

const getApplicationByCodeControler = async function (request, reply) {
    try {
        var result = null;   
        var pageOptions ={};
        pageOptions.type = "vProfile";
        pageOptions.host = server.config.vProfileSettings.host;

        var paraOptions ={};
        paraOptions.APIAccess= server.config.vProfileSettings.apiAccess;
        paraOptions.RoleSourceAppCode = request.body.roleSourceAppCode;;

        var res = await postResult(server.config.vProfileSettings.apis.verify, pageOptions, paraOptions);
        if (res && res.status && res.status === 200) {
            result = res.data.Data;
        }
        reply.send({
            statusCode: 200,
            message: "Success",
            data: result
        });
        reply.send(returnResult);
    } catch (err) {
        throw boom.boomify(err);
    }
}


module.exports = {
    verifyController: verifyController,
    getApplicationByCodeController: getApplicationByCodeController
};