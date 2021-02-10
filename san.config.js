/**
 * @file san config
 * @author jinzhan
 */

const clientAddonConfig = require('san-cli-ui/san.addon.config');

module.exports = {
    ...clientAddonConfig({
        id: 'san.webpack.client-view.devtools',
        port: 8952
    }),
    css: {
        sourceMap: false,
        cssPreprocessor: 'less',
        extract: false
    },
    chainWebpack: config => {
        config.module
            .rule('less')
            .oneOf('normal')
            .use('less-loader')
            .tap(options => {
                // 修改它的选项...
                delete options.javascriptEnabled;
                delete options.compress;
                return Object.assign({}, options, {
                    lessOptions: {
                        javascriptEnabled: true,
                        compress: false
                    }
                });
            })
        config.module
            .rule('less')
            .oneOf('normal-modules')
            .use('less-loader')
            .tap(options => {
                // 修改它的选项...
                delete options.javascriptEnabled;
                delete options.compress;
                return Object.assign({}, options, {
                lessOptions: {
                    javascriptEnabled: true,
                    compress: false
                }
                });
            })
    }
};
