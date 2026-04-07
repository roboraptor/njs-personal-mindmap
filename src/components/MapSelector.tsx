'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Map } from '@/db/schema';

interface MapSelectorProps {
  maps: Map[];
}

export default function MapSelector({ maps }: MapSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (maps.length === 0) {
    return null; // or a placeholder
  }

  const currentMap = maps.find(map => pathname.includes(map.id));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMapId = e.target.value;
    if (selectedMapId) {
      router.push(`/maps/${selectedMapId}`);
    }
  };

  return (
    <select 
      className="form-select me-2 bg-dark text-light border-secondary" 
      value={currentMap?.id || ''} 
      onChange={handleChange}
      aria-label="Map selector"
    >
      <option value="" disabled>Pick a map...</option>
      {maps.map(map => (
        <option key={map.id} value={map.id}>
          {map.title}
        </option>
      ))}
    </select>
  );
}
