import { useMemo } from 'react';
import { useAllData } from '../utils/useData';
import { formatNumber, getPartyColor, getPartyFullName } from '../utils/helpers';
import { GridSkeleton } from '../components/Skeletons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { Users, Shield, TrendingUp, UserCheck, Landmark } from 'lucide-react';

/* Determine which alliance a short code belongs to */
const ALLIANCES = {
  SPA: {
    label: 'SPA / DMK+ Alliance',
    color: '#E53935',
    description: 'Secular Progressive Alliance led by DMK',
    members: ['DMK', 'INC', 'VCK', 'CPI', 'CPI(M)', 'IUML', 'MDMK', 'MMK', 'AIFB'],
  },
  NDA: {
    label: 'NDA / ADMK+ Alliance',
    color: '#43A047',
    description: 'National Democratic Alliance led by ADMK',
    members: ['ADMK', 'AIADMK', 'BJP', 'PMK', 'DMDK', 'AMMK'],
  },
  TVK: {
    label: 'TVK Alliance',
    color: '#A67C00',
    description: 'Tamilaga Vettri Kazhagam led front',
    members: ['TVK'],
  },
  NTK: {
    label: 'NTK Alliance',
    color: '#b31818',
    description: 'Naam Tamilar Katchi — going solo',
    members: ['NTK'],
  },
};

function getAlliance(party) {
  for (const [key, alliance] of Object.entries(ALLIANCES)) {
    if (alliance.members.includes(party)) return key;
  }
  return 'OTHER';
}

function PartyCard({ party, partyColors, partyLookup }) {
  const color   = party.color || getPartyColor(party.short, partyColors);
  const fullName = getPartyFullName(party.short, partyLookup) || party.name;
  const alliance = ALLIANCES[party.id?.toUpperCase()] || ALLIANCES[getAlliance(party.short)];

  return (
    <div
      className="card-hover p-5 group"
      title={fullName}
    >
      {/* Top strip */}
      <div className="h-1 w-full rounded-full mb-4" style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm"
          style={{ backgroundColor: color + '22', color }}>
          {party.short?.slice(0, 3)}
        </div>
        {party.existingSeats > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            {party.existingSeats} seats (2021)
          </span>
        )}
      </div>

      <h3
        className="font-display font-bold dark:text-white text-gray-900 text-sm leading-snug mb-0.5 group-hover:opacity-80 transition-opacity"
        style={{ color }}
      >
        {party.short}
      </h3>
      <p className="dark:text-gray-500 text-gray-600 text-xs mb-4 line-clamp-2 transition-colors">{fullName}</p>

      <div className="space-y-2 text-xs">
        {[
          { label: 'Seats Contested', val: formatNumber(party.seatsContested) },
          { label: 'Candidates',      val: formatNumber(party.candidates) },
          { label: 'Women',           val: party.womenCandidates },
        ].map(({ label, val }) => (
          <div key={label} className="flex justify-between">
            <span className="dark:text-gray-600 text-gray-500">{label}</span>
            <span className="dark:text-gray-300 text-gray-900 font-bold">{val ?? '—'}</span>
          </div>
        ))}
      </div>

      {alliance && (
        <div className="mt-4 pt-3 border-t dark:border-gray-800 border-gray-100 transition-colors">
          <span className="text-xs px-2 py-1 rounded-full font-bold transition-colors"
            style={{ backgroundColor: alliance.color + '18', color: alliance.color }}>
            {alliance.label?.split(' /')[0]}
          </span>
        </div>
      )}
    </div>
  );
}

function AllianceSection({ allianceKey, parties, partyColors, partyLookup }) {
  const alliance = ALLIANCES[allianceKey];
  if (!alliance) return null;
  if (!parties.length) return null;

  const totalCandidates = parties.reduce((s, p) => s + (p.candidates || 0), 0);
  const totalWomen      = parties.reduce((s, p) => s + (p.womenCandidates || 0), 0);
  const totalExisting   = parties.reduce((s, p) => s + (p.existingSeats || 0), 0);

  return (
    <section className="mb-10">
      {/* Alliance header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5 p-5 rounded-2xl border"
        style={{ borderColor: alliance.color + '33', background: alliance.color + '0a' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: alliance.color + '22' }}>
          <Shield className="w-6 h-6" style={{ color: alliance.color }} />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold" style={{ color: alliance.color }}>
            {alliance.label}
          </h2>
          <p className="text-gray-500 text-sm">{alliance.description}</p>
        </div>
        <div className="flex gap-4 flex-wrap text-center">
          {[
            { icon: Users, label: 'Candidates', val: formatNumber(totalCandidates) },
            { icon: UserCheck, label: 'Women', val: totalWomen },
            { icon: Landmark, label: '2021 Seats', val: totalExisting },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="px-3">
              <p className="font-display font-black dark:text-white text-gray-900 text-lg transition-colors">{val}</p>
              <p className="dark:text-gray-500 text-gray-600 text-[10px] uppercase font-bold tracking-widest transition-colors">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Party cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {parties.map((p) => (
          <PartyCard key={p.id} party={p} partyColors={partyColors} partyLookup={partyLookup} />
        ))}
      </div>
    </section>
  );
}

export default function PartiesAlliances() {
  const { individualParties, partyColors, partyLookup, loading, error } = useAllData();

  /* Group parties by alliance key */
  const grouped = useMemo(() => {
    if (!individualParties) return {};
    const map = {};
    individualParties.forEach((p) => {
      const key = p.allianceId?.toUpperCase() || 'OTHER';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [individualParties]);


  /* NO CHART FOR PROJECTIONS */
  const chartData = [];


  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p className="text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title mb-1">Parties & Alliances</h1>
        <p className="text-gray-500 text-sm">All competing blocs and their candidate data for Tamil Nadu 2026</p>
      </div>


      {loading ? (
        <GridSkeleton count={6} />
      ) : (
        <>
          {Object.entries(ALLIANCES).map(([key]) => (
            <AllianceSection
              key={key}
              allianceKey={key}
              parties={grouped[key] || []}
              partyColors={partyColors}
              partyLookup={partyLookup}
            />
          ))}
          {/* Remainders */}
          {grouped['OTHER'] && grouped['OTHER'].length > 0 && (
            <AllianceSection
              allianceKey="OTHER"
              parties={grouped['OTHER']}
              partyColors={partyColors}
              partyLookup={partyLookup}
            />
          )}
        </>
      )}
    </div>
  );
}
