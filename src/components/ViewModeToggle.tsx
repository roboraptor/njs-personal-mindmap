'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function ViewModeToggle() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || (!pathname.startsWith('/maps/') && !pathname.startsWith('/flow/'))) {
    return null;
  }

  const parts = pathname.split('/');
  const mapId = parts[2];
  const isFlow = pathname.startsWith('/flow/');

  return (
    <div className="btn-group me-3 shadow-sm">
      <button 
        className={`btn btn-sm ${!isFlow ? 'btn-primary' : 'btn-dark border-secondary'}`}
        onClick={() => router.push(`/maps/${mapId}`)}
      >
        Vesmír (Force)
      </button>
      <button 
        className={`btn btn-sm ${isFlow ? 'btn-primary' : 'btn-dark border-secondary'}`}
        onClick={() => router.push(`/flow/${mapId}`)}
      >
        Strom (Flow)
      </button>
    </div>
  );
}