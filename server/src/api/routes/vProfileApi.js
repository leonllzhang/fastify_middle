const vProfileSchema = require('../schemas/vProfileSchema')
const vProfileController = require('../controllers/vProfileController')


const verify = {
    method: 'post',
    url: '/api/verify',
    schema: vProfileSchema.verifySchema,
    handler: vProfileController.verifyController
};

const getApplicationByCode = {
    method: 'post',
    url: '/api/getApplicationByCode',
    schema: vProfileSchema.getApplicationByCodeSchema,
    handler: vProfileController.getApplicationByCodeController
};

module.exports = [verify, getApplicationByCode];