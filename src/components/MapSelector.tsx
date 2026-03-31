'use client';

import { usePathname } from 'next/navigation';
import type { Map } from '@/db/schema';
import Link from 'next/link';

interface MapSelectorProps {
  maps: Map[];
}

export default function MapSelector({ maps }: MapSelectorProps) {
  const pathname = usePathname();
  const currentMap = maps.find(map => pathname.includes(map.id));

  if (maps.length === 0) {
    return null; // or a placeholder
  }

  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        id="mapSelectorDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {currentMap ? currentMap.title : 'Vybrat mapu'}
      </button>
      <ul className="dropdown-menu" aria-labelledby="mapSelectorDropdown">
        {maps.map(map => (
          <li key={map.id}>
            <Link href={`/maps/${map.id}`} className={`dropdown-item ${currentMap?.id === map.id ? 'active' : ''}`}>
              {map.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
