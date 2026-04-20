import { useState, useMemo } from 'react';
import { useAllData } from '../utils/useData';
import { getFlagUrl, formatNumber, getPartyColor } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';

import { Landmark, Users, UserCheck, Star, ShieldCheck } from 'lucide-react';

export default function PoliticalParties() {
  const { individualParties, partyColors, loading, error } = useAllData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParties = useMemo(() => {
    if (!individualParties) return [];
    return individualParties.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.short?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [individualParties, searchTerm]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="h-96" />)}
      </div>
    );
  }

  if (error || !individualParties) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-400">
        <p>Failed to load Political Parties data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-brand-500/10 border border-brand-500/20">
          <Landmark className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black dark:text-white text-gray-900 mb-4 tracking-tight">
          Political Forces <span className="text-brand-500">Overview</span>
        </h1>
        <p className="dark:text-gray-400 text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Detailed metrics, leadership, and ideologies for the individual parties contesting in the 2026 Legislative Assembly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {individualParties.map((party, idx) => {
          const flagUrl = getFlagUrl(party.short);
          const accentColor = party.color || getPartyColor(party.short, partyColors);

          return (
            <div key={party.id || idx} className="card p-0 flex flex-col h-full border-t-4 hover:shadow-2xl transition-all group overflow-hidden" 
                 style={{ borderTopColor: accentColor }}>
              
              {/* Header */}
              <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 flag-container shrink-0 shadow-lg border border-gray-100 dark:border-gray-800 rounded">
                      {flagUrl && <img src={flagUrl} alt={party.short} className="w-full h-full object-cover" />}
                    </div>

                    <div className="flex-1">
                      <h2 className="font-display font-bold text-2xl dark:text-white text-gray-900 group-hover:text-brand-500 transition-colors leading-tight">
                        {party.name}
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded">
                        {party.short}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content sections */}
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between pt-2">
                <div>
                  <h4 className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-3">Core Ideology</h4>
                  <p className="text-sm dark:text-gray-400 text-gray-600 italic leading-relaxed border-l-2 border-brand-500/20 pl-4 py-1">
                    "{party.core_ideology_and_manifesto || 'No detailed ideology provided.'}"
                  </p>
                </div>

                <div className="pt-6 border-t dark:border-gray-800 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Founder</p>
                      <p className="text-sm font-black dark:text-white text-gray-900">{party.founder || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Established</p>
                      <p className="text-sm font-black dark:text-white text-gray-900 font-mono">{party.creation_date || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


