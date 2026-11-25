'use client';

import { createNode, updateNode, deleteNodeOnly, deleteNodeWithChildren } from '@/actions/nodeActions';
import type { Node } from '@/db/schema';
import { useState, useTransition } from 'react';

interface EditNodeModalProps {
  mode: 'create' | 'edit';
  node: Node | null;
  nodes: Node[];
  mapId: string;
  initialParentId?: string;
  initialFlowPos?: { x: number; y: number } | null;
  onClose: () => void;
}

interface NodeFormState {
  title: string;
  content: string;
  displayType: string;
  parentId: string;
  imageUrl: string;
  forceDistance: number;
  forceAngle: number;
  forceMass: number;
  flowX: number;
  flowY: number;
  isCollapsed: boolean;
  styleJson: string;
  sortOrder: number;
}

function getInitialFormState(
  mode: 'create' | 'edit',
  node: Node | null,
  initialParentId?: string,
  initialFlowPos?: { x: number; y: number } | null
): NodeFormState {
  if (mode === 'edit' && node) {
    return {
      title: node.title || '',
      content: node.content ?? '',
      displayType: node.display_type ?? 'button',
      parentId: node.parent_id ?? '',
      imageUrl: node.image_url ?? '',
      forceDistance: node.force_distance ?? 150.0,
      forceAngle: node.force_angle ?? 0.0,
      forceMass: node.force_mass ?? 1.0,
      flowX: node.flow_x ?? 0.0,
      flowY: node.flow_y ?? 0.0,
      isCollapsed: node.is_collapsed ?? false,
      styleJson: node.style_json ?? '',
      sortOrder: node.sort_order ?? 0,
    };
  }

  return {
    title: '',
    content: '',
    displayType: 'button',
    parentId: initialParentId || '',
    imageUrl: '',
    forceDistance: 150.0,
    forceAngle: 0.0,
    forceMass: 1.0,
    flowX: initialFlowPos ? initialFlowPos.x : 0.0,
    flowY: initialFlowPos ? initialFlowPos.y : 0.0,
    isCollapsed: false,
    styleJson: '',
    sortOrder: 0,
  };
}

export default function EditNodeModal({
  mode,
  node,
  nodes,
  mapId,
  initialParentId,
  initialFlowPos,
  onClose,
}: EditNodeModalProps) {
  const [form, setForm] = useState<NodeFormState>(() =>
    getInitialFormState(mode, node, initialParentId, initialFlowPos)
  );
  const [isPending, startTransition] = useTransition();

  const updateField = <K extends keyof NodeFormState>(field: K, value: NodeFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteOnly = () => {
    if (mode !== 'edit' || !node) return;
    if (confirm('Opravdu chcete smazat tento uzel? Jeho potomci se automaticky přesunou pod nadřazený uzel.')) {
      startTransition(async () => {
        await deleteNodeOnly(node.id, mapId);
        onClose();
      });
    }
  };

  const handleDeleteWithChildren = () => {
    if (mode !== 'edit' || !node) return;
    if (confirm('Opravdu chcete smazat tento uzel A VŠECHNY jeho potomky? Tuto akci nelze vrátit zpět.')) {
      startTransition(async () => {
        await deleteNodeWithChildren(node.id, mapId);
        onClose();
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        title: form.title,
        content: form.content || null,
        display_type: form.displayType,
        parent_id: form.parentId || null,
        image_url: form.imageUrl || null,
        force_distance: form.forceDistance,
        force_angle: form.forceAngle,
        force_mass: form.forceMass,
        flow_x: form.flowX,
        flow_y: form.flowY,
        is_collapsed: form.isCollapsed,
        style_json: form.styleJson || null,
        sort_order: form.sortOrder,
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
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="nodeTitle"
                      value={form.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeContent" className="form-label">Obsah (pro rozbalovací uzel)</label>
                    <textarea
                      className="form-control form-control-sm"
                      id="nodeContent"
                      rows={3}
                      value={form.content}
                      onChange={(e) => updateField('content', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeDisplayType" className="form-label">Styl zobrazení</label>
                    <select
                      className="form-select form-select-sm"
                      id="nodeDisplayType"
                      value={form.displayType}
                      onChange={(e) => updateField('displayType', e.target.value)}
                    >
                      <option value="button">Tlačítko</option>
                      <option value="collapsible">Rozbalovací</option>
                      <option value="image">Obrázek</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeParent" className="form-label">Nadřazený uzel (Parent)</label>
                    <select
                      className="form-select form-select-sm"
                      id="nodeParent"
                      value={form.parentId}
                      onChange={(e) => updateField('parentId', e.target.value)}
                    >
                      <option value="">(Žádný)</option>
                      {nodes.filter(n => n.id !== node?.id).map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="nodeIsCollapsed"
                      checked={form.isCollapsed}
                      onChange={(e) => updateField('isCollapsed', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="nodeIsCollapsed"><small>Sbalit při načtení (výchozí)</small></label>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeStyleJson" className="form-label">Vlastní styly (JSON)</label>
                    <textarea
                      className="form-control form-control-sm"
                      id="nodeStyleJson"
                      rows={2}
                      value={form.styleJson}
                      onChange={(e) => updateField('styleJson', e.target.value)}
                      placeholder='{"linkColor": "rgba(255, 99, 132, 0.8)"}'
                    ></textarea>
                  </div>
                </div>

                {/* 2. Vesmír (Force graph) vlastnosti */}
                <div className="col-md-4 border-start">
                  <h6 className="text-success border-bottom pb-2">Vesmír (Force Graph)</h6>
                  <div className="mb-3">
                    <label htmlFor="nodeDistance" className="form-label fw-bold">Vzdálenost (Distance)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm"
                      id="nodeDistance"
                      value={form.forceDistance}
                      onChange={(e) => updateField('forceDistance', parseFloat(e.target.value) || 0)}
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>Ideální délka vazby od rodiče. Standard: 150.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeMass" className="form-label fw-bold">Hmotnost (Mass)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm"
                      id="nodeMass"
                      value={form.forceMass}
                      onChange={(e) => updateField('forceMass', parseFloat(e.target.value) || 0)}
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>Jak silně odpuzuje okolí (rozežene shluky). Standard: 1.0.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeAngle" className="form-label fw-bold">Úhel (Angle)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm"
                      id="nodeAngle"
                      value={form.forceAngle}
                      onChange={(e) => updateField('forceAngle', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* 3. Strom (React Flow) vlastnosti */}
                <div className="col-md-4 border-start">
                  <h6 className="text-warning border-bottom pb-2">Strom (React Flow)</h6>
                  <div className="mb-3">
                    <label htmlFor="nodeFlowX" className="form-label fw-bold">Osa X (Horizontální pozice)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm"
                      id="nodeFlowX"
                      value={form.flowX}
                      onChange={(e) => updateField('flowX', parseFloat(e.target.value) || 0)}
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>Můžete měnit přetažením uzlu v samotném stromu.</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nodeFlowY" className="form-label fw-bold">Osa Y (Vertikální pozice)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm"
                      id="nodeFlowY"
                      value={form.flowY}
                      onChange={(e) => updateField('flowY', parseFloat(e.target.value) || 0)}
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>Můžete měnit přetažením uzlu v samotném stromu.</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <div>
                {/* Mazací tlačítka se zobrazí pouze při editaci existujícího uzlu */}
                {mode === 'edit' && (
                  <>
                    <button type="button" className="btn btn-outline-danger me-2" onClick={handleDeleteOnly} disabled={isPending}>
                      Smazat node
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleDeleteWithChildren} disabled={isPending}>
                      Smazat s potomky
                    </button>
                  </>
                )}
              </div>
              <div>
                <button type="button" className="btn btn-secondary me-2" onClick={onClose} disabled={isPending}>
                  Zrušit
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Ukládání...' : 'Uložit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
