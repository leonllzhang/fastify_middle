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

const getAccessSchema = {
    tags: ['getAccess'],
    headers: {
        jwtToken: {
            type: 'string',
            description: 'jwtToken'
        }
    },
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

const getAnonymousSchema = {
    tags: ['ng'],
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
            },
            pageMode: {
                type: 'string',
                description: 'pageMode'
            },
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
                    type: 'boolean'
                }
            }
        }
    }
};

const getAppPreferenceSchema = {
    tags: ['ng'],
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
            key: {
                type: 'string',
                description: 'key'
            },
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
                    type: 'string'
                }
            }
        }
    }
};

const getLanguageSchema = {
    tags: ['ng'],
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
            locale: {
                type: 'string',
                description: 'locale'
            },
        }
    },
    // response: {
    //     200: {
    //         type: 'object',
    //         properties: {
    //             statusCode: {
    //                 type: 'integer'
    //             },
    //             message: {
    //                 type: 'string'
    //             },
    //             data :{
    //                 type: 'object'
    //             }
    //         }
    //     }
    // }
};

const getSchemaSchema = {
    tags: ['ng'],
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
            pageView: {
                type: 'string',
                description: 'pageView'
            },
            pageType: {
                type: 'string',
                description: 'pageType'
            },
            pageMode: {
                type: 'string',
                description: 'pageMode'
            },
        }
    },
    // response: {
    //     200: {
    //         type: 'object',
    //         properties: {
    //             statusCode: {
    //                 type: 'integer'
    //             },
    //             message: {
    //                 type: 'string'
    //             },
    //             data :{
    //                 type: 'object'
    //             }
    //         }
    //     }
    // }
};

module.exports = {
    getAccessSchema: getAccessSchema,
    getAnonymousSchema: getAnonymousSchema,
    getAppPreferenceSchema: getAppPreferenceSchema,
    getLanguageSchema: getLanguageSchema,
    getSchemaSchema: getSchemaSchema
};