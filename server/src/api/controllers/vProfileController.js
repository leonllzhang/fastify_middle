const server = require('../../configs/serverConfig');
const boom = require('boom');
const { postResult } = require('../../utils/apiHelper');

const verifyController = async function (request, reply) {
    try {
        var result = null;   
        var pageOptions ={};
        pageOptions.type = "vProfile";
        pageOptions.host = server.config.vProfileSettings.host;
        var paraOptions ={};
        paraOptions.Token= request.body.serviceTicket;
        paraOptions.APIAccess= server.config.vProfileSettings.apiAccess;

        var res = await postResult(server.config.vProfileSettings.apis.verify, pageOptions, paraOptions);
        if (res && res.status && res.status === 200) {
            result = res.data;
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
    verifyController: verifyController
};