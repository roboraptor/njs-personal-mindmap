'use client';

import { createNode, updateNode } from '@/actions/nodeActions';
import type { Node } from '@/db/schema';
import { useEffect, useState, useTransition } from 'react';

interface EditNodeModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  node: Node | null;
  nodes: Node[];
  mapId: string;
  onClose: () => void;
}

export default function EditNodeModal({ isOpen, mode, node, nodes, mapId, onClose }: EditNodeModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayType, setDisplayType] = useState('button');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [distance, setDistance] = useState(150.0);
  const [angle, setAngle] = useState(0.0);
  const [mass, setMass] = useState(1.0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [styleJson, setStyleJson] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && node) {
        setTitle(node.title || '');
        setContent(node.content ?? '');
        setDisplayType(node.display_type ?? 'button');
        setParentId(node.parent_id ?? '');
        setImageUrl(node.image_url ?? '');
        setDistance(node.distance ?? 150.0);
        setAngle(node.angle ?? 0.0);
        setMass(node.mass ?? 1.0);
        setIsCollapsed(node.is_collapsed ?? false);
        setStyleJson(node.style_json ?? '');
        setSortOrder(node.sort_order ?? 0);
      } else {
        // create mode
        setTitle('');
        setContent('');
        setDisplayType('button');
        setParentId('');
        setImageUrl('');
        setDistance(150.0);
        setAngle(0.0);
        setMass(1.0);
        setIsCollapsed(false);
        setStyleJson('');
        setSortOrder(0);
      }
    }
  }, [isOpen, mode, node]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        title,
        content: content || null,
        display_type: displayType,
        parent_id: parentId || null,
        image_url: imageUrl || null,
        distance,
        angle,
        mass,
        is_collapsed: isCollapsed,
        style_json: styleJson || null,
        sort_order: sortOrder,
      };

      if (mode === 'create') {
        await createNode(mapId, data);
      } else if (mode === 'edit' && node) {
        await updateNode(node.id, mapId, data);
      }
      onClose();
    });
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{mode === 'create' ? 'Přidat uzel' : 'Upravit uzel'}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="nodeTitle" className="form-label">Titulek</label>
                    <input type="text" className="form-control" id="nodeTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeContent" className="form-label">Obsah (pro rozbalovací uzel)</label>
                    <textarea className="form-control" id="nodeContent" rows={3} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeDisplayType" className="form-label">Styl zobrazení</label>
                    <select className="form-select" id="nodeDisplayType" value={displayType} onChange={(e) => setDisplayType(e.target.value)}>
                      <option value="button">Tlačítko</option>
                      <option value="collapsible">Rozbalovací</option>
                      <option value="image">Obrázek</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeImageUrl" className="form-label">URL Obrázku</label>
                    <input type="text" className="form-control" id="nodeImageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeParent" className="form-label">Nadřazený uzel (Parent)</label>
                    <select className="form-select" id="nodeParent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                      <option value="">(Žádný)</option>
                      {nodes.filter(n => n.id !== node?.id).map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="nodeIsCollapsed" checked={isCollapsed} onChange={(e) => setIsCollapsed(e.target.checked)} />
                    <label className="form-check-label" htmlFor="nodeIsCollapsed">Je sbalený (výchozí)</label>
                  </div>
                </div>
                <div className="col-md-6">
                  {/* Fyzikální vlastnosti s popisky */}
                  <div className="mb-3">
                    <label htmlFor="nodeDistance" className="form-label fw-bold">Vzdálenost (Distance)</label>
                    <input type="number" step="0.1" className="form-control" id="nodeDistance" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value) || 0)} />
                    <small className="text-muted d-block mt-1">Ideální délka čáry (vazby) mezi tímto uzlem a jeho rodičem. Menší hodnota = kratší čára. Standard je 150.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeMass" className="form-label fw-bold">Hmotnost (Mass)</label>
                    <input type="number" step="0.1" className="form-control" id="nodeMass" value={mass} onChange={(e) => setMass(parseFloat(e.target.value) || 0)} />
                    <small className="text-muted d-block mt-1">Jak silně tento uzel odpuzuje ostatní. Vyšší hodnota pomůže "rozehnat" okolní uzly dál od sebe, aby měly větší větve prostor. Standard je 1.0.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeAngle" className="form-label fw-bold">Úhel (Angle)</label>
                    <input type="number" step="0.1" className="form-control" id="nodeAngle" value={angle} onChange={(e) => setAngle(parseFloat(e.target.value) || 0)} />
                    <small className="text-muted d-block mt-1">Přesný statický úhel, pod kterým by měl být uzel umístěn. <i>(Pozn.: Zatím slouží jako pomocná metrika)</i>.</small>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <label htmlFor="nodeSortOrder" className="form-label">Pořadí (Sort Order)</label>
                    <input type="number" className="form-control" id="nodeSortOrder" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeStyleJson" className="form-label">Vlastní styly (Style JSON)</label>
                    <textarea className="form-control" id="nodeStyleJson" rows={3} value={styleJson} onChange={(e) => setStyleJson(e.target.value)} placeholder='{"linkColor": "rgba(255, 99, 132, 0.8)"}'></textarea>
                    <small className="text-muted d-block mt-1">Zde můžete určit např. barvu čáry napojené na tento uzel: <code>{`{"linkColor": "#ff0000"}`}</code>.</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Zrušit</button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Ukládání...' : 'Uložit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
