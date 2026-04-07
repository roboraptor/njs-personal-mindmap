'use client';

import React, { useEffect, useState } from 'react';

export default function SourceSettings() {
  const [dbPath, setDbPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.dbPath) {
          setDbPath(data.dbPath);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbPath })
      });
      
      if (res.ok) {
        alert('Cesta k databázi byla uložena. Pro projevení změn restartujte aplikaci.');
      } else {
        alert('Chyba při ukládání nastavení.');
      }
    } catch (error) {
      console.error(error);
      alert('Chyba při komunikaci se serverem.');
    } finally {
      setSaving(false);
    }
  };

  const runScript = async (scriptName: string) => {
    if (!confirm(`Opravdu chcete spustit skript "${scriptName}"? Tato akce může přepsat nebo smazat data v databázi!`)) {
      return;
    }

    setSaving(true); // Použijeme stav saving pro zablokování tlačítek
    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptName })
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

  if (loading) return <div>Načítání nastavení...</div>;

  return (
    <div>
      <div >
        <hr className="my-4" />
        
        <h5 className="mb-3">Správa dat (Skripty)</h5>
        <div className="d-flex gap-2 flex-wrap">
            <button 
                type="button" 
                className="btn btn-warning" 
                onClick={() => runScript('seed')}
                disabled={saving}
            >
                <i className="bi bi-database-fill-down"></i> Seed (Reset DB)
            </button>
            <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => runScript('clear')}
                disabled={saving}
            >
                <i className="bi bi-trash"></i> Clear DB
            </button>
            <button 
                type="button" 
                className="btn btn-info text-white" 
                onClick={() => runScript('mydata')}
                disabled={saving}
            >
                <i className="bi bi-folder-plus"></i> My Data
            </button>
        </div>
      </div>
    </div>
  );
}