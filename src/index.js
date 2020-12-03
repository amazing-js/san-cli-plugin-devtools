/**
 * @file Devtools Client Addon
*/
import Devtools from './components/devtools';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.addRoutes('san.san-devtools.views', Devtools);
    ClientAddonApi.addLocales({
        nav: {
            // TODO: 不支持.特殊符号，待优化
            'san.san-devtools.views': {
                text: '开发者工具'
            }
        }
    });
}
