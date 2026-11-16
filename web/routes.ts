import { route, type RouteConfigEntry } from '@react-router/dev/routes';

/** The depot plugin's routes, as paths from the web client's application
 * directory, which is where a route's module is resolved from. */
const here = '../plugins/depot/web/';

/** depot's legacy links are one path segment, or two slashes and one segment
 * as the grant mails wrote them. React Router has no pattern for a segment,
 * and an empty one never matches a named segment, so the route is the splat:
 * every path no other route takes. Every route core or another plugin
 * declares outranks it, and its module reads the raw path and answers 404 for
 * anything that is not a legacy link — what an unknown path answered before. */
export const routes: RouteConfigEntry[] = [
  route('*', here + 'legacy-link.tsx', { id: 'depot-legacy-link' }),
];

export const groupRoutes: RouteConfigEntry[] = [];
