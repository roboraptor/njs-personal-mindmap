import { loadMapViewData } from '@/data/mapViewLoader';
import MindMapClient from '@/components/MindMapClient';

// Vynutíme dynamické renderování a zakážeme cachování pro tuto stránku.
// To zajistí, že se data budou vždy načítat čerstvá z databáze.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MapPageProps {
  params: Promise<{
    mapId: string;
  }>;
}

export default async function MapPage({ params }: MapPageProps) {
  const { mapId } = await params;
  const { graphData, mapConfig } = await loadMapViewData(mapId);

  return (
    <main>
      <MindMapClient data={graphData} mapConfig={mapConfig} mapId={mapId} />
    </main>
  );
}
