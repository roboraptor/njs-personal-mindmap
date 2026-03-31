import { mapsRepository } from '@/data/mapsRepository';
import { notFound } from 'next/navigation';

interface EditMapPageProps {
  params: {
    mapId: string;
  };
}

export default async function EditMapPage({ params }: EditMapPageProps) {
  const map = await mapsRepository.getById(params.mapId);

  if (!map) {
    notFound();
  }

  return (
    <div className="py-4">
      <h2>Upravit mapu: {map.title}</h2>
      <div className="card">
        <div className="card-body">
          {/* Zde bude formulář pro úpravu */}
          <p>Již brzy: formulář pro úpravu názvu, popisu a fyzikálních vlastností mapy.</p>
        </div>
      </div>
    </div>
  );
}
