'use client';

import { createMap, updateMap } from '@/actions/mapActions';
import type { Map } from '@/db/schema';
import Link from 'next/link';
import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className="btn btn-primary" disabled={pending}>
            {isEditing 
                ? (pending ? 'Saving...' : 'Save changes')
                : (pending ? 'Creating...' : 'Create map')}
        </button>
    );
}

interface CreateMapFormProps {
    mapToEdit?: Map;
}

export default function CreateMapForm({ mapToEdit }: CreateMapFormProps) {
    const isEditing = !!mapToEdit;
    const action = isEditing ? updateMap : createMap;
    const [state, formAction] = useActionState(action, { message: '' });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message === 'success' && !isEditing) {
            formRef.current?.reset();
        }
    }, [state, isEditing]);
    
    return (
        <form ref={formRef} action={formAction}>
            {isEditing && <input type="hidden" name="mapId" value={mapToEdit.id} />}
            <div className="mb-3">
                <label htmlFor="title" className="form-label">Name of the map</label>
                <input 
                    type="text" 
                    className="form-control" 
                    id="title" 
                    name="title" 
                    defaultValue={mapToEdit?.title}
                    required 
                />
            </div>
            <div className="mb-3">
                <label htmlFor="description" className="form-label">Description (optional)</label>
                <textarea 
                    className="form-control" 
                    id="description" 
                    name="description" 
                    rows={3}
                    defaultValue={mapToEdit?.description ?? ''}
                ></textarea>
            </div>
            <SubmitButton isEditing={isEditing} />
            {isEditing && (
                <Link href="/settings/maps" className="btn btn-secondary ms-2">
                    Zrušit úpravy
                </Link>
            )}
            {state.message && state.message !== 'success' && (
                 <div className="alert alert-danger mt-3">{state.message}</div>
            )}
        </form>
    );
}
