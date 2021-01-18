/**
 * @file Devtools Client Addon
*/

import 'whatwg-fetch';
import './index.less';
import Home from '../home/Home.san';
import drag from '../../utils/drag';

import 'san-devtools/dist/frontend.css';
import {DevTools, WebSocket, createBridge, createFrontendSocketUrl, initFrontend} from 'san-devtools/dist/index.js';

const RECONNECT_COUNT = 5;
const CONNECTING = 'connecting';
const CONNECTING_COLOR = '#3898b9';
const CONNECTED = 'connected';
const CONNECTED_COLOR = '#52c41a';
export default {
    template: /* html */`
        <div class="san-devtools-wrapper {{homeVisibility && bridge ? 'san-devtools-wrapper-mask' : ''}}">
            <div class="sand-tool-bar">
                <s-button
                    class="btnBreath"
                    size="large"
                    type="primary"
                    shape="circle"
                    icon="menu-fold"
                    on-click="toolBarClk"
                />
                <div s-if="{{showToolBar}}" class="sand-tool-bar-list">
                    <s-button
                        type="primary" 
                        on-click="startSandTools"
                        disabled={{showHome}}
                        shape="circle"
                        icon="play-circle"
                    />
                    <s-button
                        type="danger"
                        on-click="stopSandTools"
                        disabled={{!showHome}}
                        shape="circle"
                        icon="pause"
                    />
                    <s-button
                        type="primary"
                        on-click="showHomeClk"
                        shape="circle"
                        disabled={{!showHome}}
                        icon="bug"
                    />
                </div>
            </div>
            <div class="sand-home-wrapper" style="visibility: {{homeVisibility && showHome ? 'visible' : 'hidden'}};">
                <s-button
                    s-if="{{showHome}}"
                    class="hide-btn"
                    type="primary"
                    shape="circle"
                    icon="close"
                    on-click="showHomeClk('hide')"
                />
                <sand-home 
                    s-if="{{showHome}}"
                    config="{{config}}"
                />
            </div>
            <div s-if="{{!showHome || !bridge}}">还没启动 san-devtools ...</div>
            <s-devtools s-if="{{bridge && showHome}}" bridge="{{bridge}}"></s-devtools>
        </div>
    `,
    
    initData() {
        this.countNum = 0;
        return {
            showHome: false,
            config: null,
            serverInfo: null,
            bridge: null,
            backendId: '',
            homeVisibility: true,
            showToolBar: false,
            resourceQuery: ''
        };
    },

    components: {
        'sand-home': Home,
        's-devtools': DevTools
    },
    
    computed: {
        hasFirstBackendChanged() {
            let config = this.data.get('config.backends');
            let bridge = this.data.get('bridge');
            return config && !!config.length && bridge;
        }
    },

    messages: {
        'status'(arg) {
            if (arg.value === 'disconnected') {
                this.data.set('showHome', false);
                this.$callPluginAction('san.cli.actions.sand.deletePortCache')
            } else if (arg.value === 'connected') {
                this.data.set('showHome', true);
            }
        },
        'backendAppend'(arg) {
            let backendId = arg.value.id;
            this.wsConnect(backendId);
        }
    },

    toolBarClk() {
        this.data.set('showToolBar', !this.data.get('showToolBar'));
    },

    showHomeClk(arg) {
        if (arg === 'hide') {
            this.data.set('homeVisibility', false);
        }
        else {
            this.data.set('homeVisibility', !this.data.get('homeVisibility'));
        }
    },

    initialize(bridge) {
        if (!bridge) {
            return;
        }
        this.data.set('bridge', bridge);
        // 初始化 frontend 监听事件
        initFrontend(bridge);
    },

    socket(resourceQuery) {
        this.countNum++;
        resourceQuery = resourceQuery || this.data.get('resourceQuery');
        console.log(
            `%c san-devtools %c ${CONNECTING}`,
            'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
            `background: ${CONNECTING_COLOR}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`
        );
        if (this.countNum > RECONNECT_COUNT || !resourceQuery) {
            this.countNum = 0;
            return;
        }
        const url = createFrontendSocketUrl(resourceQuery);
        const wss = new WebSocket(url);
        let _bridge = createBridge(wss);
    
        wss.on('open', () => {
            _bridge.on('backendConnectionFound', () => {
                this.countNum = 0;
                this.bridge && this.bridge.removeAllListeners();
                this.bridge = _bridge;
                // 确认建立链接之后，开始初始化 frontend
                this.initialize(this.bridge);
                console.log(
                    `%c san-devtools %c ${CONNECTED}`,
                    'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
                    `background: ${CONNECTED_COLOR}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`
                );
            });
        });
        wss.on('close', () => {
            // frontend 关闭的时候，触发 SYSTEM:backendDisconnected 清理 store
            _bridge.emit('SYSTEM:backendDisconnected');
            // 开始重连
            setTimeout(this.socket.bind(this), 1000);
        });
    },

    wsConnect(backendId) {
        if (!backendId) {
            return;
        }
        let serverInfo = this.data.get('serverInfo');
        let url = '';
        try {
            url = new URL(serverInfo.home);
        } catch (err){
            console.log(err);
        }
        let resourceQuery = `?ws&wsHost=${url.hostname}&wsPort=${url.port}&backendId=${backendId}`;

        if (resourceQuery !== '' && resourceQuery.includes('ws')) {
            this.data.set('resourceQuery', resourceQuery);
            this.socket(resourceQuery);
        }
    },

    attached() {
        this.toolBarLeft = 0;
        this.toolBarTop = 0;
        let toolBar = document.querySelector('.sand-tool-bar');
        drag(
            toolBar,
            () => {},
            (left, top) => {
                this.toolBarLeft += left;
                this.toolBarTop += top;
                toolBar.style.transform = `translate3d(${this.toolBarLeft}px, ${this.toolBarTop}px, 0)`
            }
        );
        this.startSandTools(null, true);
    },

    getFirstBackendIdFromConfig(config) {
        let backends = config && config.backends && !!config.backends.length ? config.backends : [{id: ''}];
        return backends[0].id;
    },

    async startSandTools(e, attached) {
        const {results, errors} = await this.$callPluginAction('san.cli.actions.sand.start', attached);
        const existed = results[0] && results[0]._sanCliPluginDevtoolsExisted;
        if (attached && !existed || !results[0]) {
            // 展示调试面板
            this.wsConnect(this.getFirstBackendIdFromConfig(results));
            // 如果是首次进来，则先不链接;或者首次挂载，并且没有复用数据可用
            return;
        }
        const {home} = results[0];
        this.data.set('serverInfo', results[0]);
        const url = `${home}getHomeConfigOnly`;
        window.fetch(url).then(res => {
            return res.json();
        }).then(config => {
            this.data.set('showHome', true);
            this.data.set('config', config);
            // 展示调试面板
            this.wsConnect(this.getFirstBackendIdFromConfig(config));
        }).catch(err => {
            this.data.set('showHome', false);
        });
    },

    async stopSandTools() {
        const {results, errors} = await this.$callPluginAction('san.cli.actions.sand.stop', {});
    }
};
