const boom = require('boom');
const utils = require('./utils');
const axios = require('./axios');

const getResult = async function (apiMethodName, pageOptions) {
    try {
        var res = null;
        let url = utils.getApiPath(pageOptions, apiMethodName);
        res = await axios.get(url);
        return res;
    } catch (err) {
        throw boom.boomify(err);
    }
}

const postResult = async function (apiMethodName, pageOptions, paraOptions) {
    try {
        var res = null;
        let url = utils.getApiPath(pageOptions, apiMethodName);
        res = await axios.post(url, paraOptions);
        return res;
    } catch (err) {
        throw boom.boomify(err);
    }
}

module.exports = {
    getResult: getResult,
    postResult: postResult
};