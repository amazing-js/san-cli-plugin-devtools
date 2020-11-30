const path = require('path');
const fs = require('fs-extra');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');

module.exports = api => {
    if (process.env.SAN_CLI_UI_DEV) {
        api.registerAddon({
            id: 'san.san-devtools.views.dev',
            url: 'http://localhost:8952/index.js'
        });
    }
    else {
        api.registerAddon({
            id: 'san.san-devtools.views',
            path: 'san-cli-plugin-devtools/dist'
        });
    }

    api.registerView({
        id: 'san.san-devtools.views',
        name: 'san.san-devtools.views',
        // Santd的图标
        icon: 'tool'
    });
};
