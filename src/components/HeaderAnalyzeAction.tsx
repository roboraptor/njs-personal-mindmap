'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { generateAIPrompt } from '@/actions/aiActions';

export default function HeaderAnalyzeAction() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [promptData, setPromptData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Ukázat tlačítko jen na detailu mapy nebo flow
  const isMapPage = pathname?.startsWith('/maps/') || pathname?.startsWith('/flow/');
  if (!isMapPage) {
    return null;
  }

  // Získání mapId z URL - např. z /maps/123 nebo /flow/123
  const mapId = pathname.split('/')[2];

  const handleAnalyzeClick = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setCopied(false);
    try {
      if (mapId) {
        const data = await generateAIPrompt(mapId);
        setPromptData(data);
      }
    } catch (error) {
      console.error('Chyba při generování promptu pro AI:', error);
      setPromptData('Došlo k chybě při načítání dat.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Chyba při kopírování:', err);
    }
  };

  return (
    <>
      <button className="btn btn-outline-info me-2" onClick={handleAnalyzeClick}>
        ✨ Analyzovat AI
      </button>

      {isOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✨ Analýza osobnosti (AI Prompt)</h5>
                <button type="button" className="btn-close" onClick={() => setIsOpen(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-2">
                  Zkopírujte si tento Markdown text a vložte jej do svého oblíbeného AI asistenta (např. ChatGPT, Claude nebo Gemini).
                </p>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Načítání...</span>
                    </div>
                  </div>
                ) : (
                  <textarea 
                    className="form-control font-monospace" 
                    rows={15} 
                    value={promptData} 
                    readOnly
                    style={{ fontSize: '0.85rem' }}
                  />
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  Zavřít
                </button>
                <button 
                  type="button" 
                  className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} 
                  onClick={handleCopy}
                  disabled={isLoading || !promptData}
                >
                  {copied ? '✅ Zkopírováno!' : '📋 Kopírovat prompt pro AI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
