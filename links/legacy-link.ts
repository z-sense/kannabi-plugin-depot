/** A link the retired depot system put into the world.
 *
 * depot printed each Asset's QR code, and mailed each grant, as its configured
 * domain URL followed by the Asset's SGTIN with the element string's
 * parentheses removed:
 *
 *   (01)04589604681007(21)A1B2  ->  <domain>/010458960468100721A1B2
 *
 * A grant mail added a slash of its own after the domain, so those links carry
 * two. Both reach Kannabi once the domain points at it, and both name the same
 * SGTIN. Nothing here knows the domain: which hosts reach Kannabi is the
 * deployment's choice, and the path alone says which SGTIN was meant.
 *
 * The parse is exact and repairs nothing. A GTIN is fourteen digits, so the
 * `21` after it is unambiguous, and the serial is everything after that, as
 * printed. Pure, so the server and the web client read a path the same way.
 */
export type LegacySgtin = Readonly<{ gtin: string; serial: string }>;

const legacyPath = /^\/{1,2}01(\d{14})21([^/]+)$/;

/** The SGTIN a raw, still-encoded path names in depot's form; null when the
 * path is not in that form, so routing carries on; `malformed` when it is in
 * that form but its serial cannot be decoded. */
export function legacySgtin(rawPath: string): LegacySgtin | 'malformed' | null {
  const match = legacyPath.exec(rawPath);
  if (!match) return null;
  let serial: string;
  try {
    serial = decodeURIComponent(match[2]);
  } catch {
    return 'malformed';
  }
  return Object.freeze({ gtin: match[1], serial });
}
