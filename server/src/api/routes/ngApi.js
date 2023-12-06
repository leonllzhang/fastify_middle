const ngSchema = require('../schemas/ngSchema')
const ngController = require('../controllers/ngController')

// const getDocCount = {
//     method: 'post',
//     url: '/api/getDocCount',
//     schema: ngSchema.getDocCountSchema,
//     handler: ngController.getDocCountController
// };

const getAccess = {
    method: 'post',
    url: '/api/getAccess',
    schema: ngSchema.getAccessSchema,
    handler: ngController.getAccessController
};

const getAnonymous = {
    method: 'post',
    url: '/api/getAnony',
    schema: ngSchema.getAnonymousSchema,
    handler: ngController.getAnonymousController
};

const getAppPreference = {
    method: 'post',
    url: '/api/getAppPreference',
    schema: ngSchema.getAppPreferenceSchema,
    handler: ngController.getAppPreferenceController
};

const getLanguage = {
    method: 'post',
    url: '/api/getLanguage',
    schema: ngSchema.getLanguageSchema,
    handler: ngController.getLanguageController
};

const getSchema = {
    method: 'post',
    url: '/api/getSchema',
    schema: ngSchema.getSchemaSchema,
    handler: ngController.getSchemaController
};

module.exports = [getAccess, getAnonymous, getAppPreference, getLanguage, getSchema];