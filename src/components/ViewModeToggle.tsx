'use client';

import { usePathname, useRouter } from 'next/navigation';
import { parseMapRoute } from '@/lib/mapPath';

export default function ViewModeToggle() {
  const pathname = usePathname();
  const router = useRouter();

  const route = parseMapRoute(pathname);
  if (!route) {
    return null;
  }

  const { mode, mapId } = route;
  const isFlow = mode === 'flow';

  return (
    <div className="btn-group me-2 shadow-sm">
      <button
        className={`btn ${!isFlow ? 'btn-primary' : 'btn-dark border-secondary'}`}
        onClick={() => router.push(`/maps/${mapId}`)}
      >
        Force
      </button>
      <button
        className={`btn ${isFlow ? 'btn-primary' : 'btn-dark border-secondary'}`}
        onClick={() => router.push(`/flow/${mapId}`)}
      >
        Flow
      </button>
    </div>
  );
}
