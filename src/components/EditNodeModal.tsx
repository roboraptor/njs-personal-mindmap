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
  initialParentId?: string;
  onClose: () => void;
}

export default function EditNodeModal({ isOpen, mode, node, nodes, mapId, initialParentId, onClose }: EditNodeModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [displayType, setDisplayType] = useState('button');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [forceDistance, setForceDistance] = useState(150.0);
  const [forceAngle, setForceAngle] = useState(0.0);
  const [forceMass, setForceMass] = useState(1.0);
  const [flowX, setFlowX] = useState(0.0);
  const [flowY, setFlowY] = useState(0.0);
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
        setForceDistance(node.force_distance ?? 150.0);
        setForceAngle(node.force_angle ?? 0.0);
        setForceMass(node.force_mass ?? 1.0);
        setFlowX(node.flow_x ?? 0.0);
        setFlowY(node.flow_y ?? 0.0);
        setIsCollapsed(node.is_collapsed ?? false);
        setStyleJson(node.style_json ?? '');
        setSortOrder(node.sort_order ?? 0);
      } else {
        // create mode
        setTitle('');
        setContent('');
        setDisplayType('button');
        setParentId(initialParentId || '');
        setImageUrl('');
        setForceDistance(150.0);
        setForceAngle(0.0);
        setForceMass(1.0);
        setFlowX(0.0);
        setFlowY(0.0);
        setIsCollapsed(false);
        setStyleJson('');
        setSortOrder(0);
      }
    }
  }, [isOpen, mode, node, initialParentId]);

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
        force_distance: forceDistance,
        force_angle: forceAngle,
        force_mass: forceMass,
        flow_x: flowX,
        flow_y: flowY,
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
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{mode === 'create' ? 'Přidat uzel' : 'Upravit uzel'}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* 1. Obecné vlastnosti */}
                <div className="col-md-4">
                  <h6 className="text-primary border-bottom pb-2">Obecné nastavení</h6>
                  <div className="mb-3">
                    <label htmlFor="nodeTitle" className="form-label">Titulek</label>
                    <input type="text" className="form-control form-control-sm" id="nodeTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeContent" className="form-label">Obsah (pro rozbalovací uzel)</label>
                    <textarea className="form-control form-control-sm" id="nodeContent" rows={3} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeDisplayType" className="form-label">Styl zobrazení</label>
                    <select className="form-select form-select-sm" id="nodeDisplayType" value={displayType} onChange={(e) => setDisplayType(e.target.value)}>
                      <option value="button">Tlačítko</option>
                      <option value="collapsible">Rozbalovací</option>
                      <option value="image">Obrázek</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeParent" className="form-label">Nadřazený uzel (Parent)</label>
                    <select className="form-select form-select-sm" id="nodeParent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                      <option value="">(Žádný)</option>
                      {nodes.filter(n => n.id !== node?.id).map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="nodeIsCollapsed" checked={isCollapsed} onChange={(e) => setIsCollapsed(e.target.checked)} />
                    <label className="form-check-label" htmlFor="nodeIsCollapsed"><small>Sbalit při načtení (výchozí)</small></label>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeStyleJson" className="form-label">Vlastní styly (JSON)</label>
                    <textarea className="form-control form-control-sm" id="nodeStyleJson" rows={2} value={styleJson} onChange={(e) => setStyleJson(e.target.value)} placeholder='{"linkColor": "rgba(255, 99, 132, 0.8)"}'></textarea>
                  </div>
                </div>

                {/* 2. Vesmír (Force graph) vlastnosti */}
                <div className="col-md-4 border-start">
                  <h6 className="text-success border-bottom pb-2">Vesmír (Force Graph)</h6>
                  <div className="mb-3">
                    <label htmlFor="nodeDistance" className="form-label fw-bold">Vzdálenost (Distance)</label>
                    <input type="number" step="0.1" className="form-control form-control-sm" id="nodeDistance" value={forceDistance} onChange={(e) => setForceDistance(parseFloat(e.target.value) || 0)} />
                    <small className="text-muted d-block mt-1" style={{fontSize: '0.75rem'}}>Ideální délka vazby od rodiče. Standard: 150.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeMass" className="form-label fw-bold">Hmotnost (Mass)</label>
                    <input type="number" step="0.1" className="form-control form-control-sm" id="nodeMass" value={forceMass} onChange={(e) => setForceMass(parseFloat(e.target.value) || 0)} />
                    <small className="text-muted d-block mt-1" style={{fontSize: '0.75rem'}}>Jak silně odpuzuje okolí (rozežene shluky). Standard: 1.0.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeAngle" className="form-label fw-bold">Úhel (Angle)</label>
                    <input type="number" step="0.1" className="form-control form-control-sm" id="nodeAngle" value={forceAngle} onChange={(e) => setForceAngle(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                {/* 3. Strom (React Flow) vlastnosti */}
                <div className="col-md-4 border-start">
                  <h6 className="text-warning border-bottom pb-2">Strom (React Flow)</h6>
                  <div className="mb-3">
                    <label htmlFor="nodeFlowX" className="form-label fw-bold">Osa X (Horizontální pozice)</label>
                    <input type="number" step="0.1" className="form-control form-control-sm" id="nodeFlowX" value={flowX} onChange={(e) => setFlowX(parseFloat(e.target.value) || 0)} />
                    <small className="text-muted d-block mt-1" style={{fontSize: '0.75rem'}}>Můžete měnit přetažením uzlu v samotném stromu.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeFlowY" className="form-label fw-bold">Osa Y (Vertikální pozice)</label>
                    <input type="number" step="0.1" className="form-control form-control-sm" id="nodeFlowY" value={flowY} onChange={(e) => setFlowY(parseFloat(e.target.value) || 0)} />
                    <small className="text-muted d-block mt-1" style={{fontSize: '0.75rem'}}>Můžete měnit přetažením uzlu v samotném stromu.</small>
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
