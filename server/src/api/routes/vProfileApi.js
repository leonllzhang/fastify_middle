const vProfileSchema = require('../schemas/vProfileSchema')
const vProfileController = require('../controllers/vProfileController')


const verify = {
    method: 'post',
    url: '/api/verify',
    schema: vProfileSchema.verifySchema,
    handler: vProfileController.verifyController
};

module.exports = [verify];