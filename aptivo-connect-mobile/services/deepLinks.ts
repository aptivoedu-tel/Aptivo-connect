import { CONNECT_URL, isSafeInternalRoute } from '../constants/connect';

export function pushRouteFromData(data: unknown) {
  const route = (data as { targetRoute?: unknown } | undefined)?.targetRoute;
  if (!isSafeInternalRoute(route) || !CONNECT_URL) return null;
  return `${CONNECT_URL.replace(/\/$/, '')}${route}`;
}
