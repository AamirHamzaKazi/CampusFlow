'use client';

import React, { useMemo, useState } from 'react';
import { Resource, ResourceType } from '@/types';
import { Clock3, MapPin, Plus, Search, Users, X } from 'lucide-react';

interface ResourceCatalogProps {
  resources: Resource[];
  tenantId: string;
  canManage: boolean;
  onBook: (resource: Resource) => void;
  onSave: (resource: Resource) => Promise<boolean>;
}

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'computer_lab', label: 'Computer lab' },
  { value: 'seminar_hall', label: 'Seminar room' },
  { value: 'auditorium', label: 'Auditorium' },
  { value: 'sports_facility', label: 'Sports facility' },
  { value: 'meeting_room', label: 'Meeting room' },
  { value: 'specialized_lab', label: 'Specialized lab' },
  { value: 'equipment', label: 'Equipment' },
];

const blankResource = (tenantId: string): Resource => ({
  id: '', tenantId, name: '', code: '', type: 'classroom', building: '', floor: '', capacity: 30,
  facilities: [], operatingHours: { open: '08:00', close: '20:00' }, status: 'available',
  requiresApproval: false, maxBookingHours: 3, utilizationRate: 0, description: '',
});

export const ResourceCatalog: React.FC<ResourceCatalogProps> = ({ resources, tenantId, canManage, onBook, onSave }) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [dialogResource, setDialogResource] = useState<Resource | null>(null);
  const [draft, setDraft] = useState<Resource>(blankResource(tenantId));
  const [facilityText, setFacilityText] = useState('');
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => resources.filter((resource) => {
    const haystack = `${resource.name} ${resource.building} ${resource.code} ${resource.facilities.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (typeFilter === 'all' || resource.type === typeFilter);
  }), [resources, query, typeFilter]);

  const openCreate = () => {
    setDialogResource(null);
    setDraft(blankResource(tenantId));
    setFacilityText('');
    setFormError('');
    setIsEditorOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setDialogResource(resource);
    setDraft({ ...resource, facilities: [...resource.facilities], operatingHours: { ...resource.operatingHours } });
    setFacilityText(resource.facilities.join(', '));
    setFormError('');
    setIsEditorOpen(true);
  };

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.operatingHours.close <= draft.operatingHours.open) {
      setFormError('Closing time must be later than opening time.');
      return;
    }
    const duplicateCode = resources.some((resource) => resource.id !== draft.id && resource.code.toLowerCase() === draft.code.trim().toLowerCase());
    if (duplicateCode) {
      setFormError('That resource code is already in use.');
      return;
    }
    if (!draft.name.trim() || !draft.building.trim()) {
      setFormError('Add a resource name and building to continue.');
      return;
    }
    const saved = await onSave({ ...draft, id: draft.id, tenantId, facilities: facilityText.split(',').map((item) => item.trim()).filter(Boolean) });
    if (!saved) return;
    setIsEditorOpen(false);
    setDialogResource(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{canManage ? 'Resource inventory' : 'Find a resource'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse campus spaces by type, facilities, location, and capacity.</p>
        </div>
        {canManage && <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"><Plus className="h-4 w-4" /> Add resource</button>}
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms, buildings, facilities…" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring" />
        </label>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring">
          <option value="all">All resource types</option>
          {resourceTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </section>

      {filtered.length ? <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((resource) => (
          <article key={resource.id} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-foreground/30">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{resource.code}</p><h2 className="mt-1 text-base font-semibold text-foreground">{resource.name}</h2></div>
                <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${resource.status === 'maintenance' ? 'border-amber-200 bg-amber-50 text-amber-800' : resource.status === 'in_use' ? 'border-blue-200 bg-blue-50 text-blue-800' : resource.status === 'reserved' ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{resource.status === 'maintenance' ? 'Maintenance' : resource.status === 'in_use' ? 'In use' : resource.status === 'reserved' ? 'Reserved' : 'Available'}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{resource.description || 'Campus resource available for institutional use.'}</p>
              <div className="mt-4 grid grid-cols-2 gap-y-2 border-y border-border py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{resource.building}, {resource.floor}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{resource.capacity} seats</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{resource.operatingHours.open}–{resource.operatingHours.close}</span>
                <span>{resource.maxBookingHours}h max booking</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {resource.facilities.slice(0, 4).map((facility) => <span key={facility} className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">{facility}</span>)}
                {resource.facilities.length > 4 && <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">+{resource.facilities.length - 4}</span>}
              </div>
              {resource.requiresApproval && <p className="mt-3 text-[11px] font-medium text-amber-800">Requires staff approval</p>}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => onBook(resource)} disabled={resource.status === 'maintenance'} className="flex-1 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{resource.status === 'maintenance' ? 'Unavailable' : 'Request booking'}</button>
              {canManage && <button onClick={() => openEdit(resource)} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">Edit</button>}
            </div>
          </article>
        ))}
      </section> : <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center"><Search className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 text-sm font-semibold text-foreground">No matching resources</p><p className="mt-1 text-xs text-muted-foreground">Change your search or resource type.</p></div>}

      {canManage && isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsEditorOpen(false); }}>
          <form onSubmit={saveDraft} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold text-foreground">{dialogResource ? 'Edit resource' : 'Add a resource'}</h2><p className="mt-1 text-xs text-muted-foreground">Keep the details people need to choose and book this space.</p></div><button type="button" onClick={() => setIsEditorOpen(false)} aria-label="Close" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></div>
            {formError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">{formError}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-foreground">Resource name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Resource code<input required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as ResourceType })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal">{resourceTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Building<input required value={draft.building} onChange={(event) => setDraft({ ...draft, building: event.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Floor / area<input value={draft.floor} onChange={(event) => setDraft({ ...draft, floor: event.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Capacity<input type="number" min={1} required value={draft.capacity} onChange={(event) => setDraft({ ...draft, capacity: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Availability status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Resource['status'] })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"><option value="available">Available</option><option value="in_use">In use</option><option value="reserved">Reserved</option><option value="maintenance">Unavailable</option></select></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Opens<input type="time" required value={draft.operatingHours.open} onChange={(event) => setDraft({ ...draft, operatingHours: { ...draft.operatingHours, open: event.target.value } })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Closes<input type="time" required value={draft.operatingHours.close} onChange={(event) => setDraft({ ...draft, operatingHours: { ...draft.operatingHours, close: event.target.value } })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground">Maximum booking length<input type="number" min={1} max={24} required value={draft.maxBookingHours} onChange={(event) => setDraft({ ...draft, maxBookingHours: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground sm:col-span-2">Facilities, separated by commas<input value={facilityText} onChange={(event) => setFacilityText(event.target.value)} placeholder="Projector, Whiteboard, Wi-Fi" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
              <label className="space-y-1 text-xs font-medium text-foreground sm:col-span-2">Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal" /></label>
              <label className="flex items-center gap-2 text-xs text-foreground sm:col-span-2"><input type="checkbox" checked={draft.requiresApproval} onChange={(event) => setDraft({ ...draft, requiresApproval: event.target.checked })} className="accent-black" /> Require staff approval for bookings</label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setIsEditorOpen(false)} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">Cancel</button><button type="submit" className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90">Save resource</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
