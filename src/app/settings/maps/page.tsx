import { mapsRepository } from '@/data/mapsRepository';
import CreateMapForm from './CreateMapForm';
import { deleteMap } from '@/actions/mapActions';
import Link from 'next/link';
import type { Map } from '@/db/schema';

interface MapsSettingsPageProps {
  searchParams: {
    edit?: string;
  };
}

export default async function MapsSettingsPage({ searchParams }: MapsSettingsPageProps) {
  const maps = await mapsRepository.getAll();
  const resolvedSearchParams = await searchParams;
  
  let mapToEdit: Map | undefined;
  if (resolvedSearchParams.edit) {
    mapToEdit = await mapsRepository.getById(resolvedSearchParams.edit);
  }

  return (
    <div className="py-4">
      <h2>Správa map</h2>
      
      <div className="card my-4">
        <div className="card-header">
          {mapToEdit ? `Upravit mapu: ${mapToEdit.title}` : 'Vytvořit novou mapu'}
        </div>
        <div className="card-body">
          <CreateMapForm mapToEdit={mapToEdit} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Seznam existujících map
        </div>
        <ul className="list-group list-group-flush">
          {maps.map(map => (
            <li key={map.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">{map.title}</h5>
                <p className="mb-1 text-muted">{map.description}</p>
              </div>
              <div className="btn-group" role="group">
                <Link href={`?edit=${map.id}`} className="btn btn-outline-secondary btn-sm">
                  Upravit
                </Link>
                <form action={deleteMap}>
                  <input type="hidden" name="mapId" value={map.id} />
                  <button type="submit" className="btn btn-outline-danger btn-sm">
                    Smazat
                  </button>
                </form>
              </div>
            </li>
          ))}
          {maps.length === 0 && <li className="list-group-item">Žádné mapy nebyly nalezeny.</li>}
        </ul>
      </div>
    </div>
  );
}
