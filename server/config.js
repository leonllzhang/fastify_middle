module.exports = {
    host: "localhost" || "0.0.0.0",
    port: "7789",
    apiSettings: {
        tenantCode: "leon",
        appCode: "estest",
        appMaker: {
            host: "https://dmcdev.digiqal.cn:11015",
            apiHost: "",
            apis: {
                getDocs: '/sdk/getDocs',
                getDocsCount: '/sdk/getDocsCount',
                getDocById: '/sdk/getDocById',
                updateDoc: '/sdk/updateDoc',
                softDeleteDoc: '/sdk/softDeleteDoc',
                downLoadFile: "/sdkfile/DownloadFile"
            },
            appKey: 'leontest',
            securityKey: 'd9c5d9333b534c3d96a9e7d4235a38c2'
        }
    },
    ngSettings: {
        tenantCode: "leon",
        appCode: "estest",
        appMaker: {
            host: "http://172.16.0.112:30106",
            apiHost: "",
            apis: {
                anon: '/anon/preview',
                access: '/getaccess',
            },
            appKey: 'leontest',
            securityKey: 'd9c5d9333b534c3d96a9e7d4235a38c2'
        }
    }
};