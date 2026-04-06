import { mapsRepository } from '@/data/mapsRepository';
import Link from 'next/link';
import MapSelector from './MapSelector';
import HeaderAddNodeAction from './HeaderAddNodeAction';
import HeaderAnalyzeAction from './HeaderAnalyzeAction';
import ViewModeToggle from './ViewModeToggle';

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
          <HeaderAnalyzeAction />
          <ViewModeToggle />
          <HeaderAddNodeAction />
          <Link href="/settings" className="btn btn-outline-secondary">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
