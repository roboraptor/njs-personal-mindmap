'use client';

import { usePathname } from 'next/navigation';

export default function HeaderAddNodeAction() {
  const pathname = usePathname();

  // Zobrazit tlačítko pouze na stránce detailu mapy
  if (!pathname?.startsWith('/maps/')) {
    return null;
  }

  const handleAddNode = () => {
    window.dispatchEvent(new CustomEvent('openAddNodeModal'));
  };

  return (
    <button className="btn btn-outline-success me-2" onClick={handleAddNode}>
      Přidat uzel
    </button>
  );
}