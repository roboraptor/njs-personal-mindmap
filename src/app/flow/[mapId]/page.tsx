import { loadMapViewData } from '@/data/mapViewLoader';
import FlowMapClient from '@/components/FlowMapClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface FlowPageProps {
  params: Promise<{
    mapId: string;
  }>;
}

export default async function FlowPage({ params }: FlowPageProps) {
  const { mapId } = await params;
  const { graphData, mapConfig } = await loadMapViewData(mapId);

  return (
    <main>
      <FlowMapClient data={graphData} mapConfig={mapConfig} mapId={mapId} />
    </main>
  );
}
