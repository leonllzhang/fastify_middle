const ngSchema = require('../schemas/ngSchema')
const ngController = require('../controllers/ngController')

// const getDocCount = {
//     method: 'post',
//     url: '/api/getDocCount',
//     schema: ngSchema.getDocCountSchema,
//     handler: ngController.getDocCountController
// };

// const getAnonymous = {
//     method: 'post',
//     url: '/api/getAnony',
//     schema: ngSchema.getAnonymousSchema,
//     handler: ngController.getAnonymousController
// };

const getAccess = {
    method: 'post',
    url: '/api/getAccess',
    schema: ngSchema.getAccessSchema,
    handler: ngController.getNgController
};

module.exports = [getAccess];