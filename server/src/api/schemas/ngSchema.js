// const getDocCountSchema = {
//     tags: ['ng'],
//     body: {
//         type: 'object',
//         properties: {
//             pageCode: {
//                 type: 'string',
//                 description: 'PageCode'
//             }
//         }
//     },
//     response: {
//         200: {
//             type: 'object',
//             properties: {
//                 statusCode: {
//                     type: 'integer'
//                 },
//                 message: {
//                     type: 'string'
//                 },
//                 data :{
//                     type: 'integer'
//                 }
//             }
//         }
//     }
// };

// const getAnonymousSchema = {
//     tags: ['ng'],
//     body: {
//         type: 'object',
//         properties: {
//             pageCode: {
//                 type: 'string',
//                 description: 'PageCode'
//             },
//             pageType: {
//                 type: 'string',
//                 description: 'pageType'
//             },
//         }
//     },
//     response: {
//         200: {
//             type: 'object',
//             properties: {
//                 statusCode: {
//                     type: 'integer'
//                 },
//                 message: {
//                     type: 'string'
//                 },
//                 data :{
//                     type: 'boolean'
//                 }
//             }
//         }
//     }
// };

const getAccessSchema = {
    tags: ['getAccess'],
    body: {
        type: 'object',
        properties: {
            tenantCode: {
                type: 'string',
                description: 'tenantCode'
            },
            appCode: {
                type: 'string',
                description: 'appCode'
            },
            pageCode: {
                type: 'string',
                description: 'PageCode'
            },
            pageType: {
                type: 'string',
                description: 'pageType'
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'integer'
                },
                message: {
                    type: 'string'
                },
                data :{
                    type: 'array'
                }
            }
        }
    }
};

module.exports = {
    // getDocCountSchema: getDocCountSchema,
    // getAnonymousSchema: getAnonymousSchema,
    getAccessSchema: getAccessSchema
};