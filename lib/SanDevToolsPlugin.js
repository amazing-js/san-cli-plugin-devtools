/**
 * @file 简单的webpack插件，向页面中注入devtools backend链接
 * @author jinzhan
 */
const ID = 'san-cli:san-devtools-plugin';

module.exports = class SanDevToolsPlugin {
    constructor(options) {
        this.options = Object.assign({
            replacements: []
        }, options);
    }
    apply(compiler) {
        const replacements = this.options.replacements;
        const processer = (data, callback) => {
            replacements.forEach(function (replacement) {
                data.html = replacement(data.html);
            });
            callback(null, data);
        };
        compiler.hooks.compilation.tap(ID, compilation => {
            compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(ID, processer);
        });
    }
};
