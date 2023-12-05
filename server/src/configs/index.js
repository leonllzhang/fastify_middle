const fs = require('fs');
const path = require('path');
const boom = require('boom');
const yaml = require('js-yaml');

const defaultConfig = async function () {
    try {
        const configFileNameObj = {
            local: 'local',
            test: 'dev',
            development: 'uat',
            production: 'prod'
        }
        const env = process.env.NODE_ENV || 'local'
        var config = await yaml.load(fs.readFileSync(path.join(__dirname, `./${configFileNameObj[env]}.yml`), 'utf8'))
        return config;
    } catch (err) {
        throw boom.boomify(err);
    }
}

module.exports = {
    defaultConfig: defaultConfig
};