import { useEffect, useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Clock,
  Upload,
  Eye,
  Plane,
  BedDouble,
  CreditCard,
  Shield,
  Ticket,
  Contact,
  X,
} from 'lucide-react';
import type { TravelDoc } from '../types';
import { useStore, useTrip } from '../lib/store';
import { getBlobUrl, saveBlob } from '../lib/db';
import { PageHeader, Chip, Avatar } from '../components/ui/primitives';

const TYPE_ICON: Record<string, typeof FileText> = {
  Passport: Contact,
  Visa: CreditCard,
  Ticket: Plane,
  Hotel: BedDouble,
  Pass: Ticket,
  Insurance: Shield,
};

function DocViewer({ blobId, title, onClose }: { blobId: string; title: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let created: string | null = null;
    getBlobUrl(blobId).then((u) => {
      if (active) {
        created = u;
        setUrl(u);
      }
    });
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [blobId]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-pine-900/70 p-4 backdrop-blur" onClick={onClose}>
      <div className="card max-h-[85vh] max-w-lg overflow-auto p-3" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold">{title}</h3>
          <button onClick={onClose} className="text-ink-mute">
            <X className="h-5 w-5" />
          </button>
        </div>
        {url ? (
          <img src={url} alt={title} className="max-h-[70vh] rounded-2xl" />
        ) : (
          <div className="grid h-64 w-64 place-items-center text-sm text-ink-mute">Loading…</div>
        )}
      </div>
    </div>
  );
}

export default function Documents() {
  const trip = useTrip();
  const { updateDoc } = useStore();
  const [viewing, setViewing] = useState<{ id: string; title: string } | null>(null);

  const verified = trip.docs.filter((d) => d.status === 'verified').length;
  const carrier = (id: string) => trip.travelers.find((t) => t.id === id);

  const onUpload = async (doc: TravelDoc, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobId = `doc-${doc.id}-${Date.now()}`;
    await saveBlob(blobId, file);
    updateDoc(doc.id, { fileBlobId: blobId, status: 'verified' });
  };

  // Group by carrier for "who carries what"
  const byCarrier = trip.travelers.map((t) => ({
    traveler: t,
    docs: trip.docs.filter((d) => d.carriedBy === t.id),
  }));

  return (
    <div>
      <PageHeader title="Documents Vault" subtitle="Stored on-device, viewable offline. You hold the keys." />

      <div className="card mb-4 flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-glacier-100 text-glacier-600 dark:bg-glacier-500/20 dark:text-glacier-200">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <div className="font-display text-2xl font-extrabold">
            {verified}/{trip.docs.length}
          </div>
          <div className="text-sm text-ink-mute">documents verified & on file</div>
        </div>
      </div>

      <p className="mb-4 rounded-2xl bg-pine-50 px-4 py-3 text-xs text-ink-soft dark:bg-pine-700/40 dark:text-glacier-100/80">
        Files are stored privately in your browser (IndexedDB) — nothing is uploaded to a server, and everything is available
        offline. Tap a document to attach a photo or PDF scan. <i>Auto-extraction (OCR) is intentionally manual in v1.</i>
      </p>

      {/* who carries what */}
      <h3 className="section-title mb-3">Who carries what</h3>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {byCarrier.map(({ traveler, docs }) => (
          <div key={traveler.id} className="card p-4">
            <div className="mb-2 flex items-center gap-2.5">
              <Avatar traveler={traveler} size={36} />
              <div>
                <div className="text-sm font-bold">{traveler.name}</div>
                <div className="text-[11px] text-ink-mute">carries {docs.length} document(s)</div>
              </div>
            </div>
            <div className="space-y-1">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-glacier-100/80">
                  <span className="h-1 w-1 rounded-full bg-glacier-500" /> {d.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* all docs */}
      <h3 className="section-title mb-3">All documents</h3>
      <div className="space-y-2">
        {trip.docs.map((d) => {
          const Icon = TYPE_ICON[d.type] ?? FileText;
          const c = carrier(d.carriedBy);
          return (
            <div key={d.id} className="card flex items-center gap-3 p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-600 dark:bg-pine-700/50 dark:text-glacier-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{d.title}</div>
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-ink-mute">
                  <span>{d.type}</span>
                  {c && (
                    <>
                      <span>·</span>
                      <span>carried by {c.name.split(' ')[0]}</span>
                    </>
                  )}
                  {d.note && (
                    <>
                      <span>·</span>
                      <span className="italic">{d.note}</span>
                    </>
                  )}
                </div>
              </div>
              {d.status === 'verified' ? (
                <Chip tone="mint" className="!text-[10px]">
                  <ShieldCheck className="h-3 w-3" /> verified
                </Chip>
              ) : (
                <Chip tone="warn" className="!text-[10px]">
                  <Clock className="h-3 w-3" /> pending
                </Chip>
              )}
              {d.fileBlobId ? (
                <button
                  onClick={() => setViewing({ id: d.fileBlobId!, title: d.title })}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-glacier-100 text-glacier-600 dark:bg-glacier-500/20 dark:text-glacier-200"
                >
                  <Eye className="h-4 w-4" />
                </button>
              ) : (
                <label className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-pine-50 text-pine-600 dark:bg-pine-700/50 dark:text-glacier-200">
                  <Upload className="h-4 w-4" />
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onUpload(d, e)} />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {viewing && <DocViewer blobId={viewing.id} title={viewing.title} onClose={() => setViewing(null)} />}
    </div>
  );
}
