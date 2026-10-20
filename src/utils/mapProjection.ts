// Projection for the schematic India map. Free of imports for unit tests.
//
// Plate carrée over lon 67–98°E, lat 6–38°N into a 400 × 500 viewBox — the same
// mapping used to generate the outline path in IndiaMap.tsx, so markers and
// outline stay aligned. It is a locator, not a survey-grade map.

export const MAP_BOUNDS = { lonMin: 67, lonMax: 98, latMin: 6, latMax: 38 };
export const MAP_SIZE = { width: 400, height: 500 };

export function project(lat: number, lon: number): { x: number; y: number } {
  const { lonMin, lonMax, latMin, latMax } = MAP_BOUNDS;
  return {
    x: ((lon - lonMin) / (lonMax - lonMin)) * MAP_SIZE.width,
    y: ((latMax - lat) / (latMax - latMin)) * MAP_SIZE.height,
  };
}

/** Horizontal map units for `km` at latitude `lat` (east–west distance). */
export function kmToMapUnits(km: number, lat: number): number {
  const degLon = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  return (degLon / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin)) * MAP_SIZE.width;
}

export interface LabelPoint { id: string; x: number; y: number }

/**
 * Put each label to the right of its marker unless a neighbour sits close by
 * on the right at a similar height, in which case it goes on the left.
 * Avoids the label/badge collisions of the previous above/below scheme
 * (Mumbai–Pune, Bengaluru–Chennai).
 */
export function labelSides(points: LabelPoint[], { dx = 70, dy = 14 } = {}): Record<string, 'left' | 'right'> {
  const sides: Record<string, 'left' | 'right'> = {};
  for (const p of points) {
    const crowdedRight = points.some(o => o.id !== p.id && o.x > p.x && o.x - p.x < dx && Math.abs(o.y - p.y) < dy);
    sides[p.id] = crowdedRight ? 'left' : 'right';
  }
  return sides;
}
