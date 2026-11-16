import { registerHooks } from 'node:module';

/** This plugin's tests run with GS1 and depot composed and nothing else.
 *
 * Loaded with `node --import`, this answers the generated plugin lists with
 * that pair. depot contributes nothing to the web client's plugin list, so
 * that list is GS1's alone. For tests only.
 */
const at = (path) => new URL(path, import.meta.url).href;
const alone = new Map([
  [at('../../server/plugins.generated.ts'), at('./testing.ts')],
  [at('../../web/plugins.generated.ts'), at('../gs1/web/testing.ts')],
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    const replacement = alone.get(resolved.url);
    return replacement ? { ...resolved, url: replacement } : resolved;
  },
});
