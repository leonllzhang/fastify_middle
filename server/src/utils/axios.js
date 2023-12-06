const axios  = require('axios');

let options = {
    withCredentials: true,
    crossDomain: true,    
}

const _axios = axios.create(options);
_axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'


_axios.interceptors.request.use(
    function (config) {
        var user = {
            Id : "724451ef-29e7-436e-837b-6f6d28a0a319",
            Code : "##4bb42e0c-8d8c-428f-b205-326af3da21b6",
            Name : "leon",
            ActivationTime : "2023-11-23T01:13:25.207191Z",
            AuthenticationMethod : "Login"
        }
        var jsonUser = "{\"Id\":\"724451ef-29e7-436e-837b-6f6d28a0a319\",\"Code\":\"##4bb42e0c-8d8c-428f-b205-326af3da21b6\",\"Name\":\"leon\",\"ActivationTime\":\"2023-11-23T01:13:25.207191Z\",\"AuthenticationMethod\":\"Login\"}"
        var encodeJson = "+RoQ+ElyQ4mYlAOWqlfpiMLeDagT+ONe/Q4W0VDnph7tWmYBIJRT7d+P893cyfLSycsYHFt03wEJLltt1V12qhx0eF5IX1bpuTKkcnvnptRQEUqGvkY2PRQBUozPHtDf0iIcgKXiuqqLCK+5cCwbcmBF9is+k34X8rFhEIsq++ICPP3eHbin9woYKEbK8QeMSoGJaBnt8vdbz0GSceA4cUgcvrA0x9uFl4OUDJpV72YI2KulPSMsr5VKzFJ5iTJJ"
        config.headers = {
            "ng-auth": encodeJson,
            "ng-ip": "127.0.0.1",
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
)

module.exports = _axios;