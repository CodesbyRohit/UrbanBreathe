export function formatAQI(aqi: number): string {
  if (aqi >= 1000) return `${Math.round(aqi / 100) / 10}k`;
  return String(Math.round(aqi));
}

export function formatConcentration(value: number, unit: string): string {
  if (value == null) return '--';
  if (unit === 'µg/m³') return value < 1 ? '<1' : Math.round(value).toLocaleString();
  if (unit === 'ppb') return Math.round(value).toLocaleString();
  return value.toFixed(1);
}

export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCrores(crores: number): string {
  if (crores >= 100) return `₹${(crores / 100).toFixed(1)}B`;
  return `₹${crores.toFixed(0)}Cr`;
}

export function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#15803d';
  if (aqi <= 100) return '#4d7c0f';
  if (aqi <= 200) return '#a16207';
  if (aqi <= 300) return '#c2410c';
  if (aqi <= 400) return '#b91c1c';
  return '#6d28d9';
}

export function getAQIBg(aqi: number): string {
  if (aqi <= 50) return '#dcfce7';
  if (aqi <= 100) return '#ecfccb';
  if (aqi <= 200) return '#fef9c3';
  if (aqi <= 300) return '#ffedd5';
  if (aqi <= 400) return '#fee2e2';
  return '#f3e8ff';
}

export function getAQILabel(aqi: number): string {
  if (aqi == null || isNaN(aqi)) return 'Unknown';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
