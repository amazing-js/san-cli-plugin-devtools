/**
 * @file Devtools Client Addon
*/

import 'whatwg-fetch';
import Home from './Home.san';

export default {
    template: /* html */`
        <div class="san-devtools-wrapper">
           <div>
               <s-button type="primary" on-click="startSandTools" disabled={{showHome}}>启动</s-button>
               <s-button type="danger" on-click="stopSandTools" disabled={{!showHome}}>停止</s-button>
           </div>
           <sand-home 
                s-if="{{showHome}}"
                config="{{config}}"
            />
        </div>
    `,

    initData() {
        return {
            showHome: false,
            config: null
        };
    },

    components: {
        'sand-home': Home
    },

    messages: {
        'status'(arg) {
            console.log(status);
            if (arg.value === 'disconnected') {
                this.data.set('showHome', false);
                this.$callPluginAction('san.cli.actions.sand.deletePortCache')
            } else if (arg.value === 'connected') {
                this.data.set('showHome', true);
            }
        }
    },

    attached() {
        this.startSandTools(null, true);
    },

    async startSandTools(e, attached) {
        const {results, errors} = await this.$callPluginAction('san.cli.actions.sand.start', attached);
        const existed = results[0] && results[0]._sanCliPluginDevtoolsExisted;
        if (attached && !existed || !results[0]) {
            // 如果是首次进来，则先不链接;或者首次挂载，并且没有复用数据可用
            return;
        }
        const home = results[0] && results[0].home;
        const url = `${home}getHomeConfigOnly`;
        window.fetch(url).then(res => {
            return res.json();
        }).then(config => {
            this.data.set('showHome', true);
            this.data.set('config', config);
        }).catch(err => {
            this.data.set('showHome', false);
        });
    },

    async stopSandTools() {
        const {results, errors} = await this.$callPluginAction('san.cli.actions.sand.stop', {});
    }
};
