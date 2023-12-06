const axios  = require('axios');

let options = {
    withCredentials: true,
    crossDomain: true,    
}

const _axios = axios.create(options);

_axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'


_axios.interceptors.request.use(
    function (config) {
        
        config.headers = {
            "": localStorage.getItem("Authorization") || ""
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
)

module.exports = _axios;