import { publicShellHandle } from '../../../web/anonymous-shell';
import { api, unwrap } from '../../../web/api';
import { AssetView, loadAsset, submitAsset } from '../../../web/asset-view';
import type { AssetViewData } from '../../../web/asset-view';
import { legacySgtin } from '../links/legacy-link.js';

/** A depot legacy link, rendering the Asset whose SGTIN it names.
 *
 * The server has already resolved the address and set the response status;
 * this resolves it again because the application is a single-page build with
 * no server render to hand the result to. It renders and never redirects, as
 * every address a plugin claims does.
 *
 * The route is the splat, which React Router cannot narrow by pattern, so
 * every unknown path lands here too. Those, a value GS1 refuses, and an Asset
 * the reader may not see all answer the same 404.
 */
export const handle = publicShellHandle;

async function assetIdFor(url: string): Promise<string> {
  const unavailable = new Response('No Asset has this identity.', { status: 404 });
  const sgtin = legacySgtin(new URL(url).pathname);
  if (sgtin === null || sgtin === 'malformed') throw unavailable;
  // The lookup takes the identifier in the form it was accepted in, and runs
  // over the reader-visible set, so an unreadable Asset arrives as none. The
  // cast is the same one the GS1 plugin's address route explains: the client
  // type advertises the parsed request rather than the fields it accepts.
  const query = { scheme: 'sgtin', ...sgtin } as never;
  const response = await api.assets.lookup.$get({ query });
  // A value the GS1 boundary refuses is a 400 from lookup, and still a page
  // that names nothing.
  if (!response.ok) throw unavailable;
  const { assets } = await unwrap(response);
  const asset = assets[0];
  if (!asset) throw unavailable;
  return asset.id;
}

export async function clientLoader({ request }: { request: Request }) {
  return loadAsset(await assetIdFor(request.url), request);
}

/** A mutation is addressed by the native Asset ID the page carries, never by
 * the legacy link it was submitted from. */
export async function clientAction({ request }: { request: Request }) {
  return submitAsset(request);
}

export default function LegacyLinkPage({ loaderData }: { loaderData: AssetViewData }) {
  return <AssetView {...loaderData} />;
}

export { WorkspaceError as ErrorBoundary } from '../../../web/route-error';
