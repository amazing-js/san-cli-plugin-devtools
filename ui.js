/**
 * @file devtools的san-cli plugin UI部分
 * @author jinzhan
 */
const path = require('path');
const execa = require('execa');
const portfinder = require('portfinder');

const SAND_DEFAULT_PORT = 8899;
const portMap = new Map();

function setPortCache(projectId, portData) {
    portMap.set(projectId, portData);
}

function deletePortCache(projectId) {
    portMap.delete(projectId);
    if (portMap.size === 0) {
        delete process.env.SAND_BACKEND_URL;
    }
}

function getPortCache(projectId) {
    let res = portMap.get(projectId);
    if (res && res.port) {
        // 如果已经存在了，复用
        return res;
    }
    return null;
}

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
        name: '调试器',
        // Santd的图标
        icon: 'tool'
    });

    api.onAction('san.cli.actions.sand.start', async attached => {
        let res = getPortCache(api.project.id);
        if (res) {
            // 组件挂载, 并且复用
            return {...res, _sanCliPluginDevtoolsExisted: true};
        }
        if (attached) {
            // 如果是挂载阶段，并且无复用，则直接返回
            return null;
        }

        const port = await portfinder.getPortPromise({
            port: SAND_DEFAULT_PORT
        });

        const _sanCliPluginDevtoolsTask = {};
        const data = await new Promise((resolve, reject) => {
            const child = execa('npx', ['sand', '-o', 'false', '-p', port], {
                preferLocal: true,
                stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
                shell: true
            });

            _sanCliPluginDevtoolsTask.child = child;

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

        res = {
            port,
            ...data
        };

        // 存储数据
        setPortCache(api.project.id, Object.assign({}, res, {_sanCliPluginDevtoolsTask}));

        return res;
    });

    api.onAction('san.cli.actions.sand.stop', async params => {
        let projectId = api.project.id;
        let cachedPort = getPortCache(projectId) || {};
        if (cachedPort._sanCliPluginDevtoolsTask && cachedPort._sanCliPluginDevtoolsTask.child) {
            cachedPort._sanCliPluginDevtoolsTask.child.kill();
            deletePortCache(projectId);
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

    api.onAction('san.cli.actions.sand.deletePortCache', async params => {
        deletePortCache(api.project.id);
    });
};
