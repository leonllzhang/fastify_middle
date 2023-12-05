"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = void 0;
var uuid = __importStar(require("uuid"));
var crypto_1 = __importDefault(require("crypto"));
var request_promise_1 = __importDefault(require("request-promise"));
var mime = __importStar(require("mime"));
var fs_1 = __importDefault(require("fs"));
function post(url, data, options) {
    InsertQueryParameters(url, data);
    if ("filePath" in data) {
        var fileHash = calculateFileHash(data.filePath);
        var filePath = data.filePath;
        delete data.filePath;
        var dataForSign = __assign({}, data);
        var headers = generateHeaders(dataForSign, options);
        dataForSign["File_HASH"] = fileHash;
        var sign = calculateSignature(dataForSign, options.securityKey, true);
        insertSignHeader(headers, sign);
        data["File"] = {
            value: fs_1.default.createReadStream(filePath),
            options: {
                contentType: mime.getType(filePath)
            }
        };
        headers["Content-Type"] = "multipart/form-data";
        var requestOptions = {
            headers: headers,
            formData: data,
            strictSSL: false
        };
        return request_promise_1.default.post(url, requestOptions);
    }
    else {
        var dataForSign = __assign({}, data);
        var headers = generateHeaders(dataForSign, options);
        var sign = calculateSignature(dataForSign, options.securityKey);
        insertSignHeader(headers, sign);
        headers["Content-Type"] = "application/json";
        var requestOptions = {
            headers: headers,
            body: JSON.stringify(data),
            strictSSL: false
        };
        return request_promise_1.default.post(url, requestOptions);
    }
}
exports.post = post;
function insertSignHeader(headers, sign) {
    headers["Sign"] = sign;
}
function generateHeaders(data, options) {
    var headers = {};
    data["Nonce"] = headers["Nonce"] = newUuid();
    data["Timestamp"] = headers["Timestamp"] = getTimestampNow().toString();
    data["App"] = headers["App"] = options.appKey;
    if (!isNullOrWhitespace(options.userId)) {
        headers["UserId"] = options.userId;
    }
    if (!isNullOrWhitespace(options.userName)) {
        headers["Username"] = options.userName;
    }
    return headers;
}
function isNullOrWhitespace(input) {
    if (typeof input === 'undefined' || input == null)
        return true;
    return input.replace(/\s/g, '').length < 1;
}
function InsertQueryParameters(url, data) {
    var query = url.split('?');
    if (query.length > 1) {
        var q = query[1].split('&');
        q.map(function (pair) {
            var temp = pair.split('=');
            data[temp[0]] = temp[1];
        });
    }
}
function newUuid() {
    return uuid.v4();
}
function getTimestampNow() {
    return +new Date();
}
function calculateSignature(data, security, removedDoubleQuote) {
    if (removedDoubleQuote === void 0) { removedDoubleQuote = false; }
    data["Security"] = security;
    //忽略大小写排序
    var original = "";
    for (var _i = 0, _a = Object.keys(data).sort(function (s, t) {
        var a = s.toLowerCase();
        var b = t.toLowerCase();
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }); _i < _a.length; _i++) {
        var key = _a[_i];
        //value值要序列化后使用
        original += key + "=" + JSON.stringify(data[key]) + "&";
    }
    original = original.slice(0, -1);
    if (removedDoubleQuote) {
        original = original.replace(/["]/g, '');
    }
    return sha256(original);
}
function sha256(original) {
    var hash = crypto_1.default.createHash("sha256");
    var temp = hash.update(original, "utf8");
    return temp.digest("hex");
}
function calculateFileHash(filePath) {
    var fileBuffer = fs_1.default.readFileSync(filePath);
    var hash = crypto_1.default.createHash("sha256");
    hash.update(fileBuffer);
    return hash.digest("hex").toUpperCase();
}
