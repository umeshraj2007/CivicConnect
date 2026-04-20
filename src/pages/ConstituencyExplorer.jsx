import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllData } from '../utils/useData';
import { formatNumber, uniqueValues, getPartyColor } from '../utils/helpers';
import PartyBadge from '../components/PartyBadge';
import { GridSkeleton } from '../components/Skeletons';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, MapPin, Users, ArrowRight } from 'lucide-react';

function ConstituencyCard({ constituency, partyColors, partyLookup, onClick }) {
  const { name, district, electors, male, female, prevWinner, category, id } = constituency;
  const color = getPartyColor(prevWinner, partyColors);
  const femalePct = electors > 0 ? ((female / electors) * 100).toFixed(1) : '—';

  return (
    <div
      onClick={onClick}
      className="card-hover p-5 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-2">
          <p className="font-display font-bold dark:text-white text-gray-950 dark:group-hover:text-brand-400 group-hover:text-brand-600 transition-colors leading-tight truncate">
            {name}
          </p>
          <p className="flex items-center gap-1 dark:text-gray-500 text-gray-600 text-xs mt-1 transition-colors">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {district}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="dark:text-gray-600 text-gray-400 text-xs font-mono transition-colors">#{id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
            category === 'SC' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
            category === 'ST' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
            'dark:bg-gray-800 bg-gray-100 dark:text-gray-500 text-gray-600 border dark:border-gray-700 border-gray-200'
          }`}>{category}</span>
        </div>
      </div>

      {/* Elector bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1 transition-colors">
          <span className="dark:text-gray-500 text-gray-500">Total Electors</span>
          <span className="dark:text-gray-300 text-gray-900">{formatNumber(electors)}</span>
        </div>
        <div className="h-1.5 dark:bg-gray-800 bg-gray-100 rounded-full overflow-hidden transition-colors">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((electors / 600000) * 100, 100)}%`,
              backgroundColor: color,
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* Gender mini-stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="dark:bg-blue-500/5 bg-blue-50/50 border dark:border-blue-500/10 border-blue-200/50 rounded-lg p-2 text-center transition-colors">
          <p className="dark:text-blue-400 text-blue-600 font-bold text-sm">{formatNumber(male)}</p>
          <p className="dark:text-gray-600 text-gray-500 text-[10px] uppercase font-bold tracking-tighter transition-colors">Male</p>
        </div>
        <div className="dark:bg-pink-500/5 bg-pink-50/50 border dark:border-pink-500/10 border-pink-200/50 rounded-lg p-2 text-center transition-colors">
          <p className="dark:text-pink-400 text-pink-600 font-bold text-sm">{formatNumber(female)}</p>
          <p className="dark:text-gray-600 text-gray-500 text-[10px] uppercase font-bold tracking-tighter transition-colors">Female ({femalePct}%)</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800 border-gray-100 transition-colors">
        <div>
          <p className="dark:text-gray-600 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors">2021 Winner</p>
          <PartyBadge party={prevWinner} colors={partyColors} lookup={partyLookup} />
        </div>
        <div className="w-8 h-8 rounded-full dark:bg-brand-600/0 dark:group-hover:bg-brand-600/20 bg-gray-50 group-hover:bg-brand-100 flex items-center justify-center transition-all">
          <ArrowRight className="w-4 h-4 dark:text-gray-600 text-gray-400 dark:group-hover:text-brand-400 group-hover:text-brand-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}

export default function ConstituencyExplorer() {
  const { constituencies, partyColors, partyLookup, loading, error } = useAllData();
  const navigate = useNavigate();

  const [search, setSearch]       = useState('');
  const [district, setDistrict]   = useState('');
  const [category, setCategory]   = useState('');
  const [sortKey, setSortKey]     = useState('id');
  const [sortDir, setSortDir]     = useState('asc');

  const districts  = useMemo(() => uniqueValues(constituencies || [], 'district'), [constituencies]);
  const categories = useMemo(() => uniqueValues(constituencies || [], 'category'), [constituencies]);

  const filtered = useMemo(() => {
    if (!constituencies) return [];
    let arr = [...constituencies];
    if (search)   arr = arr.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (district) arr = arr.filter((c) => c.district === district);
    if (category) arr = arr.filter((c) => c.category === category);

    arr.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [constituencies, search, district, category, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortBtn = ({ k, label }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        sortKey === k 
          ? 'bg-brand-600/20 text-brand-500 border border-brand-500/30' 
          : 'dark:bg-gray-800 bg-gray-100 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 border dark:border-gray-700 border-gray-200'
      }`}
    >
      {label}
      {sortKey === k
        ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        : <ChevronUp className="w-3 h-3 opacity-30" />}
    </button>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p className="text-red-400">Error loading data: {error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Constituency Explorer</h1>
        <p className="dark:text-gray-500 text-gray-600 text-sm transition-colors">
          {loading ? '…' : `${filtered.length} of ${constituencies?.length}`} constituencies
        </p>
      </div>

      {/* Filter bar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              className="input w-full pl-9"
              placeholder="Search constituency…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* District filter */}
          <select
            className="input min-w-40"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {/* Category filter */}
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Divider */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-4 h-4 dark:text-gray-500 text-gray-400" />
            <span className="dark:text-gray-500 text-gray-600 text-xs font-bold transition-colors">Sort:</span>
            <SortBtn k="id"       label="No." />
            <SortBtn k="name"     label="Name" />
            <SortBtn k="electors" label="Electors" />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <GridSkeleton count={12} />
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No constituencies found</p>
          <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <ConstituencyCard
              key={c.id}
              constituency={c}
              partyColors={partyColors}
              partyLookup={partyLookup}
              onClick={() => navigate(`/constituency/${c.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
