// Shareable location: "#<section>/<cityId>", e.g. "#forecast/mumbai".
// Free of imports for unit tests.

const CITY_ID = /^[a-z][a-z0-9-]{0,39}$/;

export interface Route { section: string; cityId: string }

export function parseRoute(hash: string, sections: readonly string[], fallback: Route): Route {
  const [rawSection = '', rawCity = ''] = hash.replace(/^#\/?/, '').split('/');
  const section = sections.includes(rawSection) ? rawSection : fallback.section;
  const city = decodeURIComponent(rawCity).toLowerCase();
  return { section, cityId: CITY_ID.test(city) ? city : fallback.cityId };
}

export function formatRoute(route: Route): string {
  return `#${route.section}/${encodeURIComponent(route.cityId)}`;
}
