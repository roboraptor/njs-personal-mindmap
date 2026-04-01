import { mapsRepository } from '@/data/mapsRepository';
import Link from 'next/link';
import MapSelector from './MapSelector';
import HeaderAddNodeAction from './HeaderAddNodeAction';

export default async function Header() {
  const maps = await mapsRepository.getAll();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand">
          PersonalMindMap
        </Link>
        <div className="mx-auto">
          <MapSelector maps={maps} />
        </div>
        <div className="ms-auto d-flex align-items-center">
          <HeaderAddNodeAction />
          <Link href="/settings" className="btn btn-outline-secondary">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
