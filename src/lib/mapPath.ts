export type MapViewMode = 'maps' | 'flow';

export function parseMapRoute(pathname: string | null): { mode: MapViewMode; mapId: string } | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/(maps|flow)\/([^/]+)/);
  if (!match) return null;
  return { mode: match[1] as MapViewMode, mapId: match[2] };
}
