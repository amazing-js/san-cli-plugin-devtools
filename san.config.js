/**
 * @file san config
 * @author jinzhan
 */

const clientAddonConfig = require('san-cli-ui/san.addon.config');

module.exports = {
    ...clientAddonConfig({
        id: 'san.webpack.client-view.devtools',
        port: 8952
    })
};
