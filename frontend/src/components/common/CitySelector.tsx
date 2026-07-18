import React from 'react';
import { MapPin } from 'lucide-react';
import type { City } from '../../types';

interface CitySelectorProps {
  cities: City[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function CitySelector({ cities, selectedId, onSelect }: CitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <MapPin size={14} className="text-slate-400" />
      <select
        value={selectedId}
        onChange={e => onSelect(e.target.value)}
        className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0 appearance-none pr-6 py-1
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.18l3.71-3.95a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200L5.21%208.27a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]
          bg-[length:16px] bg-[right_0px_center] bg-no-repeat"
      >
        <option value="" disabled>Select city</option>
        {cities.map(city => (
          <option key={city.id} value={city.id}>
            {city.name}, {city.state}
          </option>
        ))}
      </select>
    </div>
  );
}
