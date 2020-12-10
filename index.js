const SanDevToolsPlugin = require('./lib/SanDevToolsPlugin');

module.exports = {
    id: 'san-cli:plugin-san-devtools',
    apply(api, projectOptions, options = {}) {
        // 只有sand开启了并且san cli允许添加，才进行注入
        if (!process.env.SAND_BACKEND_URL || !process.env.SAND_URL_INJECT_ENABLED) {
            return;
        }

        console.log('SAND_BACKEND_URL', process.env.SAND_BACKEND_URL);

        api.chainWebpack(webpackConfig => {
            webpackConfig.plugin('san-devtools').use(SanDevToolsPlugin, [{
                replacements: [
                    function (html) {
                        // 如果是smarty模板
                        const smartyTag = '{%block name="__head_asset"%}';
                        const script = `<script src="${process.env.SAND_BACKEND_URL}"></script>`;
                        return ~html.indexOf(smartyTag) ? html.replace(smartyTag, `${smartyTag}${script}`)
                         : html.replace('</title>', `</title>${script}`);
                    }
                ]
            }]);
        });
    }
};
