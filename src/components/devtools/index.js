/**
 * @file Task Client Addon
*/

import 'whatwg-fetch';
import Home from './Home.san';

export default {
    template: /* html */`
        <div class="san-devtools-wrapper">
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
        let _self = this;
        window.fetch("http://172.24.198.107:8899/jsonp/").then(res => {
            return res.json();
        }).then(function(config) {
            _self.data.set('showHome', true);
            _self.data.set('config', config);
        });
    }
};
