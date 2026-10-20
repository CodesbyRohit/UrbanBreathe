// Supported cities. Coordinates are conventional city-centre points used only to
// pick the nearest CAMS grid cell (~45 km over India); they do not imply
// street-level precision. Earlier versions also carried population, area and
// descriptive claims with no cited source; those were removed.

export const cities = [
  { id: 'delhi', name: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, timezone: 'Asia/Kolkata' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, timezone: 'Asia/Kolkata' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata' },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, timezone: 'Asia/Kolkata' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, timezone: 'Asia/Kolkata' },
  { id: 'patna', name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, timezone: 'Asia/Kolkata' },
];

export const cityMap = Object.fromEntries(cities.map(c => [c.id, c]));
