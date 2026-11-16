import type { IdentifierSchemes } from '../../../server/identifier.js';
import type { AddressResolver } from '../../../server/plugin.js';
import { legacySgtin } from '../links/legacy-link.js';

/** depot's legacy links, as addresses Kannabi answers.
 *
 * A legacy link names an SGTIN, and an SGTIN is the GS1 plugin's: the value is
 * accepted through the installed `sgtin` scheme exactly as a person recording
 * it would have it accepted, so this plugin holds no identifier and judges no
 * GS1 syntax. Core then decides whether the reader may see the Asset holding
 * it, so following a printed label grants nothing.
 *
 * Every refusal is `notFound`, never `invalid`. A label on a piece of
 * equipment is not a request somebody can correct, and saying that its value
 * is malformed would tell an outsider more than that this address serves
 * nothing to them.
 *
 * The surfaced address is never a legacy link: depot's links are kept working,
 * not handed out again.
 */
export function legacyLinks(schemes: IdentifierSchemes): AddressResolver {
  return Object.freeze({
    claim(rawPath: string) {
      const sgtin = legacySgtin(rawPath);
      if (sgtin === null) return null;
      if (sgtin === 'malformed') return { kind: 'notFound' as const };
      try {
        return { kind: 'identifier' as const, identifier: schemes.accept({ scheme: 'sgtin', ...sgtin }) };
      } catch {
        return { kind: 'notFound' as const };
      }
    },
  });
}
