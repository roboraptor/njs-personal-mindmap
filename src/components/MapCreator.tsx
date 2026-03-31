'use client';

import { createDefaultMap } from '@/actions/mapActions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MapCreator() {
  const router = useRouter();

  useEffect(() => {
    // Spustíme vytvoření mapy na straně serveru
    createDefaultMap().then((newMapId) => {
      if (newMapId) {
        // Po úspěšném vytvoření přesměrujeme na straně klienta
        router.push(`/maps/${newMapId}`);
      } else {
        // TODO: Zpracování chybového stavu
        alert('Nepodařilo se vytvořit mapu.');
      }
    });
  }, [router]);

  return (
    <main className="container mt-4 text-center">
      <h1>Vítejte v PersonalMindMap!</h1>
      <p className="lead mt-3">
        Vytvářím pro vás první myšlenkovou mapu...
      </p>
    </main>
  );
}
