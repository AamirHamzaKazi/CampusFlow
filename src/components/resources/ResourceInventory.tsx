'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { 
  Users, 
  MapPin, 
  QrCode, 
  Check, 
  X, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  Search,
  Download
} from 'lucide-react';

interface ResourceInventoryProps {
  resources: Resource[];
  onBookResource: (resource: Resource) => void;
}

export const ResourceInventory: React.FC<ResourceInventoryProps> = ({
  resources,
  onBookResource,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQRResource, setSelectedQRResource] = useState<Resource | null>(null);

  const filtered = resources.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.facilities.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
        <div>
          <h2 className="text-lg font-bold text-foreground">Campus Resource Inventory</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Physical spaces, laboratories, high-compute clusters, and campus auditoriums.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, building, equipment..."
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => {
          const statusColors = {
            available: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            in_use: 'bg-blue-50 text-blue-700 border-blue-200',
            reserved: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            maintenance: 'maintenance-stripe text-zinc-700 border-zinc-300',
          };

          return (
            <div
              key={res.id}
              className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between hover:border-foreground/30 transition-all shadow-2xs space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                    {res.code}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${statusColors[res.status]}`}>
                    {res.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Name & Description */}
                <div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-foreground transition-colors">
                    {res.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {res.description}
                  </p>
                </div>

                {/* Specs */}
                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {res.building} • {res.floor}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      {res.capacity} Seats
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {res.operatingHours.open} - {res.operatingHours.close}
                    </span>
                    <span className="text-[11px] text-emerald-500 font-mono">
                      {res.utilizationRate}% utilized
                    </span>
                  </div>
                </div>

                {/* Facility Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {res.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  onClick={() => setSelectedQRResource(res)}
                  className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Generate Door QR Code Check-in"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onBookResource(res)}
                  disabled={res.status === 'maintenance'}
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all shadow-xs"
                >
                  {res.status === 'maintenance' ? 'Under Maintenance' : 'Reserve Space'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Door Scanner Modal */}
      {selectedQRResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4 shadow-2xl text-center">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">{selectedQRResource.name}</h3>
              <p className="text-xs text-muted-foreground">Door QR Code for Self-Service Check-in</p>
            </div>

            {/* Generated QR Code Vector Graphic */}
            <div className="p-6 rounded-xl bg-white border-2 border-zinc-900 mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-inner">
              <div className="grid grid-cols-5 gap-1 w-full h-full p-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 4 || i === 20 || i === 24)
                        ? 'bg-black'
                        : 'bg-zinc-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground">
              Students and faculty can scan this QR code with their phone to instantly verify entry and mark reservations as <strong className="text-emerald-500">Checked-In</strong>.
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setSelectedQRResource(null)}
                className="w-full py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90"
              >
                Close QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
