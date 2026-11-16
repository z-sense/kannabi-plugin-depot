import type { PluginDefinition } from '../../server/plugin.js';
import { legacyLinks } from './adapter/addresses.js';

/** depot compatibility.
 *
 * depot is the system Kannabi replaces in one deployment. This plugin keeps
 * what depot put into the world working while that deployment moves over, and
 * is deleted once nothing needs it. It is a consumer of the GS1 plugin: depot's
 * asset numbers are ordinary SGTINs, held by the GS1 plugin like any other.
 */
export const depotPlugin: PluginDefinition<null> = Object.freeze({
  manifest: Object.freeze({
    id: 'depot',
    name: 'depot compatibility',
    version: '0.1.0',
    contract: [1],
    requires: ['gs1'],
    contributes: ['Addresses: depot legacy links, /01<GTIN>21<serial>'],
  }),
  connect: (core) => Object.freeze({ api: null, addresses: legacyLinks(core.schemes) }),
});

export default depotPlugin;
