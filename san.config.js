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
    chainWebpack: config => {

        // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法
        config.module.rule('js')
            .test(/\.js$/)
            .use('babel-loader')
            .options({
                "presets": [
                    [
                        "@babel/preset-env",
                        {
                            "targets": {"esmodules": true},
                            "modules": false
                        }
                    ]
                ],
                "plugins": [
                    "san-hot-loader/lib/babel-plugin",
                    [
                        "import",
                        {
                            "libraryName": "santd",
                            "libraryDirectory": "es",
                            "style": true
                        }
                    ],
                    "@babel/plugin-proposal-export-default-from",
                    [
                        "@babel/plugin-proposal-class-properties",
                        {
                            "loose": true
                        }
                    ]
                ]
              });
    },
};
