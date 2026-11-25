'use client';

import { useState } from 'react';

export default function SourceSettings() {
  const [saving, setSaving] = useState(false);

  const runScript = async (scriptName: string) => {
    if (!confirm(`Opravdu chcete spustit skript "${scriptName}"? Tato akce může přepsat nebo smazat data v databázi!`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptName }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Skript '${scriptName}' byl úspěšně spuštěn.\n\nVýstup:\n${data.stdout}`);
      } else {
        alert(`Chyba při spouštění skriptu '${scriptName}':\n${data.error}\n${data.stderr || ''}`);
      }
    } catch (error) {
      console.error(error);
      alert('Chyba při komunikaci se serverem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex gap-2 flex-wrap">
      <button
        type="button"
        className="btn btn-warning"
        onClick={() => runScript('seed-map')}
        disabled={saving}
      >
        Seed (Base)
      </button>
      <button
        type="button"
        className="btn btn-warning"
        onClick={() => runScript('seed-map-psychology')}
        disabled={saving}
      >
        Seed (Psychoanalytics)
      </button>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => runScript('clear')}
        disabled={true}
      >
        Clear DB
      </button>
      <button
        type="button"
        className="btn btn-info text-white"
        onClick={() => runScript('mydata')}
        disabled={true}
      >
        My Data
      </button>
    </div>
  );
}
