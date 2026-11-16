import { compose } from '../../server/plugin.js';
import { gs1Plugin } from '../gs1/index.js';
import { depotPlugin } from './index.js';

/** Kannabi composed with the GS1 plugin, which this one requires, and this
 * one: nothing else, whatever the deployment lists. */
export const definitions = [gs1Plugin, depotPlugin];
export const composition = compose(definitions);
