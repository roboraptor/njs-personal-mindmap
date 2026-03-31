import { createDefaultMap } from '@/actions/mapActions';
import { mapsRepository } from '@/data/mapsRepository';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const maps = await mapsRepository.getAll();

  if (maps.length > 0) {
    // Pokud mapy existují, přesměrujeme na první z nich.
    redirect(`/maps/${maps[0].id}`);
  }

  // Pokud žádné mapy neexistují, spustíme akci, která vytvoří novou
  // a sama se postará o přesměrování.
  await createDefaultMap();

  // Tento kód by se neměl nikdy vykonat, protože akce `createDefaultMap`
  // vždy ukončí provádění přesměrováním.
  return (
    <main className="container mt-4 text-center">
      <h1>Vítejte v PersonalMindMap!</h1>
      <p className="lead mt-3">
        Vytvářím pro vás první myšlenkovou mapu...
      </p>
    </main>
  );
}
