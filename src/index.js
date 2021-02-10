/**
 * @file Devtools Client Addon
*/
import Devtools from './components/devtools';

/* global ClientAddonApi */
if (window.ClientAddonApi) {
    ClientAddonApi.addRoutes('san.san-devtools.views', Devtools, 'san-cli-plugin-devtools');
}
