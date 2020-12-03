// const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const SanDevToolsPlugin = require('./lib/SanDevToolsPlugin');

// For Test
// process.env.SAND_URL_INJECT_ENABLED = true;
process.env.SAND_BACKEND_URL = 'http://localhost:8888/test-inject.js';

module.exports = {
    id: 'san-cli:plugin-san-devtools',
    apply(api, projectOptions, options = {}) {
        console.log('process.env.SAND_URL_INJECT_ENABLED:', process.env.SAND_URL_INJECT_ENABLED);
        // 只有sand开启了并且san cli允许添加，才进行注入
        if (!process.env.SAND_BACKEND_URL || !process.env.SAND_URL_INJECT_ENABLED) {
            return;
        }
        api.chainWebpack(webpackConfig => {
            webpackConfig.plugin('san-devtools').use(SanDevToolsPlugin, [{
                files: process.env.SAND_BACKEND_URL,
                replacements: [
                    function (inHtml) {
                        // TODO: 这里完成script注入逻辑
                        return inHtml.replace('<title>', '<!--' + process.env.SAND_BACKEND_URL + '--><title>');
                    }
                ]
            }]);
        });
    }
};
