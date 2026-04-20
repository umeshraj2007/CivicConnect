import { useState, useMemo } from 'react';
import { useAllData } from '../utils/useData';
import { groupBy } from '../utils/helpers';
import { GridSkeleton } from '../components/Skeletons';
import { ChevronDown, ChevronUp, Tag, BookOpen, Filter } from 'lucide-react';

const ALLIANCE_META = {
  spa:  { label: 'SPA / DMK+', color: '#E53935', bg: '#E5393510' },
  nda:  { label: 'NDA / ADMK+', color: '#43A047', bg: '#43A04710' },
  tvk:  { label: 'TVK',         color: '#A67C00', bg: '#A67C0010' },
  ntk:  { label: 'NTK',         color: '#b31818', bg: '#b3181810' },
};
const PARTY_KEYS = ['spa', 'nda', 'tvk', 'ntk'];

/* Normalise the per-party entry which can be array | object | {tag, text} */
function normalisePartyData(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((v) => v.tag && v.tag !== '-');
  if (typeof val === 'object') {
    if (val.tag && val.tag !== '-') return [val];
    return [];
  }
  return [];
}

function TagChip({ label, color }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border"
      style={{ color, borderColor: color + '44', backgroundColor: color + '15' }}
    >
      <Tag className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

function ManifestoCard({ item, activeParties }) {
  const [expanded, setExpanded] = useState(false);

  /* Collect all non-empty party entries */
  const entries = PARTY_KEYS
    .filter((k) => activeParties.includes(k))
    .map((k) => ({
      key:  k,
      meta: ALLIANCE_META[k],
      items: normalisePartyData(item[k]),
    }))
    .filter((e) => e.items.length > 0);

  if (entries.length === 0) return null;

  const totalItems = entries.reduce((s, e) => s + e.items.length, 0);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0 mr-4">
          <p className="font-display font-semibold dark:text-white text-gray-900 transition-colors">{item.topic}</p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {entries.slice(0, 4).map(({ key, meta, items }) => (
              <span key={key} className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ color: meta.color, backgroundColor: meta.color + '18' }}>
                {meta.label} · {items.length}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="dark:text-gray-600 text-gray-500 text-xs transition-colors">{totalItems} points</span>
          {expanded
            ? <ChevronUp className="w-4 h-4 dark:text-gray-400 text-gray-500" />
            : <ChevronDown className="w-4 h-4 dark:text-gray-400 text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 divide-y divide-gray-800/50 animate-slide-up">
          {entries.map(({ key, meta, items }) => (
            <div key={key} className="px-5 py-4" style={{ borderLeft: `3px solid ${meta.color}` }}>
              <p className="font-semibold text-xs uppercase tracking-widest mb-3" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <div className="space-y-3">
                {items.map((point, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    {point.tag && point.tag !== '-' && (
                      <TagChip label={point.tag} color={meta.color} />
                    )}
                    <div className="space-y-1 pl-1">
                      {(Array.isArray(point.text) ? point.text : [point.text])
                        .filter(Boolean)
                        .map((txt, j) => (
                          <p key={j} className="dark:text-gray-300 text-gray-700 text-sm leading-relaxed transition-colors">{txt}</p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectorGroup({ sector, items, activeParties }) {
  const [open, setOpen] = useState(true);

  const sectorItems = items.filter((item) => {
    return PARTY_KEYS.some((k) => {
      if (!activeParties.includes(k)) return false;
      return normalisePartyData(item[k]).length > 0;
    });
  });

  if (sectorItems.length === 0) return null;

  return (
    <section className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full text-left mb-4 group"
      >
        <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-brand-400" />
        </div>
        <h2 className="font-display text-xl font-bold dark:text-white text-gray-900 dark:group-hover:text-brand-400 group-hover:text-brand-600 transition-colors">
          {sector}
        </h2>
        <span className="dark:text-gray-600 text-gray-500 text-sm transition-colors">({sectorItems.length} topics)</span>
        <span className="ml-auto">{open ? <ChevronUp className="w-4 h-4 dark:text-gray-500 text-gray-400" /> : <ChevronDown className="w-4 h-4 dark:text-gray-500 text-gray-400" />}</span>
      </button>
      {open && (
        <div className="space-y-3 animate-fade-in">
          {sectorItems.map((item, i) => (
            <ManifestoCard key={i} item={item} activeParties={activeParties} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Manifesto() {
  const { manifesto, loading, error } = useAllData();
  const [activeParties, setActiveParties] = useState(PARTY_KEYS);

  const toggleParty = (k) => {
    setActiveParties((prev) =>
      prev.includes(k) ? prev.filter((p) => p !== k) : [...prev, k]
    );
  };

  const grouped = useMemo(() =>
    groupBy(manifesto || [], 'sector'),
    [manifesto]
  );

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title mb-1">Manifesto Comparator</h1>
        <p className="dark:text-gray-500 text-gray-600 text-sm transition-colors">Compare party promises across sectors and topics</p>
      </div>

      {/* Party toggle filters */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 dark:text-gray-500 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-tighter">Filter Parties:</span>
        </div>
        {PARTY_KEYS.map((k) => {
          const meta = ALLIANCE_META[k];
          const isActive = activeParties.includes(k);
          return (
            <button
              key={k}
              onClick={() => toggleParty(k)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={{
                borderColor:     meta.color + (isActive ? 'aa' : '33'),
                color:           isActive ? meta.color : '#6b7280',
                backgroundColor: isActive ? meta.color + '18' : 'transparent',
              }}
            >
              {meta.label}
            </button>
          );
        })}
        <button
          onClick={() => setActiveParties(PARTY_KEYS)}
          className="ml-auto text-xs font-bold dark:text-gray-500 text-gray-400 dark:hover:text-white hover:text-gray-900 transition-colors"
        >
          Show All
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <GridSkeleton count={4} />
      ) : (
        Object.entries(grouped).map(([sector, items]) => (
          <SectorGroup
            key={sector}
            sector={sector}
            items={items}
            activeParties={activeParties}
          />
        ))
      )}
    </div>
  );
}
