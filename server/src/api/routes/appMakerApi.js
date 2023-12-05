const appMakerSchema = require('../schemas/appMakerSchema')
const appMakerController = require('../controllers/appMakerController')

const getDocCount = {
    method: 'post',
    url: '/api/getDocCount',
    schema: appMakerSchema.getDocCountSchema,
    handler: appMakerController.getDocCountController
};

const getAnonymous = {
    method: 'post',
    url: '/api/getAnony',
    schema: appMakerSchema.getAnonymousSchema,
    handler: appMakerController.getAnonymousController
};

const getAccess = {
    method: 'post',
    url: '/api/getAccess',
    schema: appMakerSchema.getAccessSchema,
    handler: appMakerController.getNgController
};

module.exports = [getDocCount, getAnonymous, getAccess];