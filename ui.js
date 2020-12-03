/**
 * @file devtools的san-cli plugin UI部分
 * @author jinzhan
 */
const path = require('path');
const execa = require('execa');
const portfinder = require('portfinder');

const SAND_DEFAULT_PORT = 8899;
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

    const task = {};

    api.onAction('san.cli.actions.sand.start', async params => {
        const port = await portfinder.getPortPromise({
            port: SAND_DEFAULT_PORT
        });

        const data = await new Promise((resolve, reject) => {
            const sand = path.resolve(__dirname, './node_modules/san-devtools/bin/san-devtools');
            const child = execa.node(sand, ['-o', 'false', '-p', port], {
                preferLocal: true,
                stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
                shell: true
            });

            task.child = child;

            console.log(`San Devtools is running at port [${port}]`);

            child.stdout.on('data', buffer => {
                console.log(buffer.toString());
            });

            child.on('message', message => {
                // 把backend写进环境变量中
                process.env.SAND_BACKEND_URL = message.backend;
                resolve({
                    ...message
                });
            });

            child.stderr.on('data', buffer => {
                reject({
                    errno: 1,
                    errmsg: buffer.toString()
                });
            });
        });

        return {
            port,
            ...data
        };
    });

    api.onAction('san.cli.actions.sand.stop', async params => {
        if (task.child) {
            task.child.kill();
            delete task.child;
            delete process.env.SAND_BACKEND_URL;
            return {
                errno: 0,
                errmsg: 'Stopped sand Successfully.'
            };
        }
        return {
            errno: 1,
            errmsg: 'Sand service not found.'
        };
    });
};
