const verifySchema = {
    tags: ['verify'],
    body: {
        type: 'object',
        properties: {
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

module.exports = {
    verifySchema: verifySchema
};