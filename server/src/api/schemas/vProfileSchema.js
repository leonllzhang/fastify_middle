const verifySchema = {
    tags: ['verify'],
    body: {
        type: 'object',
        properties: {
            roleSourceAppCode:{
                type: 'string',
                description: 'roleSourceAppCode'
            },
            serviceTicket: {
                type: 'string',
                description: 'tenantCode'
            }
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
    //             data: { 
    //                 type: 'object'
    //             }
    //         }
    //     }
    // }
};

const getApplicationByCodeSchema = {
    tags: ['verify'],
    body: {
        type: 'object',
        properties: {
            roleSourceAppCode:{
                type: 'string',
                description: 'roleSourceAppCode'
            }
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
    //             data: { 
    //                 type: 'object'
    //             }
    //         }
    //     }
    // }
};

module.exports = {
    verifySchema: verifySchema,
    getApplicationByCodeSchema: getApplicationByCodeSchema
};