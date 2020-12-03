/**
 * @file Devtools Client Addon
*/

import 'whatwg-fetch';
import Home from './Home.san';

export default {
    template: /* html */`
        <div class="san-devtools-wrapper">
           <div>
               <s-button type="primary" on-click="startSandTools">启动</s-button>
               <s-button type="danger" on-click="stopSandTools">停止</s-button>
           </div>

           <sand-home 
                s-if="{{showHome}}"
                config="{{config}}"
            />
        </div>
    `,

    initData() {
        return {
            // TODO: some todo
            showHome: false,
            config: null
        };
    },

    components: {
        'sand-home': Home
    },

    attached() {
        // const url = 'http://172.24.161.30:8899/jsonp/';
        // window.fetch(url).then(res => {
        //     return res.json();
        // }).then(config => {
        //     console.log({config});
        //     this.data.set('showHome', true);
        //     this.data.set('config', config);
        // });
    },

    async startSandTools() {
        const {results, errors} = await this.$callPluginAction('san.cli.actions.sand.start', {});
        console.log({results, errors});
    },

    async stopSandTools() {
        const {results, errors} = await this.$callPluginAction('san.cli.actions.sand.stop', {});
        console.log({results, errors});
    }
};
