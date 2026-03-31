import { mapsRepository } from '@/data/mapsRepository';
import Link from 'next/link';

export default async function MapsListPage() {
  const maps = await mapsRepository.getAll();

  return (
    <main className="container mt-4">
      <h1>Moje myšlenkové mapy</h1>
      <ul className="list-group mt-3">
        {maps.map(map => (
          <li key={map.id} className="list-group-item">
            <Link href={`/maps/${map.id}`}>{map.title}</Link>
          </li>
        ))}
        {maps.length === 0 && <li className="list-group-item">Zatím nemáte žádné mapy.</li>}
      </ul>
    </main>
  );
}