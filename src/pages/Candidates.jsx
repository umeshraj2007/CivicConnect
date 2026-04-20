import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, UserCheck, Briefcase, GraduationCap, ChevronRight, User } from 'lucide-react';
import { useAllData } from '../utils/useData';
import { formatNumber, getFlagUrl, getPartyColor } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';

export default function Candidates() {
  const { candidates, loading, error, parties, partyColors } = useAllData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    alliance: 'all',
    party: 'all',
    district: 'all',
    ageGroup: 'all'
  });

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!candidates) return { alliances: [], parties: [], districts: [] };

    const alliances = [...new Set(candidates.map(c => c.alliance))].filter(Boolean).sort();
    const partyList = [...new Set(candidates.map(c => c.party))].filter(Boolean).sort();
    const districts = [...new Set(candidates.map(c => c.district))].filter(Boolean).sort();

    return { alliances, parties: partyList, districts };
  }, [candidates]);

  // Filtering logic
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];

    return candidates.filter(c => {
      const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.constituency?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAlliance = filters.alliance === 'all' || c.alliance === filters.alliance;
      const matchesParty = filters.party === 'all' || c.party === filters.party;
      const matchesDistrict = filters.district === 'all' || c.district === filters.district;

      let matchesAge = true;
      if (filters.ageGroup !== 'all') {
        const age = parseInt(c.age);
        if (filters.ageGroup === 'young') matchesAge = age < 40;
        else if (filters.ageGroup === 'middle') matchesAge = age >= 40 && age < 60;
        else if (filters.ageGroup === 'senior') matchesAge = age >= 60;
      }

      return matchesSearch && matchesAlliance && matchesParty && matchesDistrict && matchesAge;
    });
  }, [candidates, searchTerm, filters]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black dark:text-white text-gray-900 mb-2">
          Candidates <span className="text-brand-500">Explorer</span>
        </h1>
        <p className="text-gray-500 font-medium">Discover and analyze the candidates contesting in the 2026 Assembly Election.</p>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Search */}
        <div className="lg:col-span-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or constituency..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            className="input text-xs"
            value={filters.alliance}
            onChange={(e) => setFilters({ ...filters, alliance: e.target.value })}
          >
            <option value="all">All Alliances</option>
            {filterOptions.alliances.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
          </select>

          <select
            className="input text-xs"
            value={filters.party}
            onChange={(e) => setFilters({ ...filters, party: e.target.value })}
          >
            <option value="all">All Parties</option>
            {filterOptions.parties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            className="input text-xs"
            value={filters.district}
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
          >
            <option value="all">All Districts</option>
            {filterOptions.districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            className="input text-xs"
            value={filters.ageGroup}
            onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
          >
            <option value="all">Any Age</option>
            <option value="young">Young (&lt;40)</option>
            <option value="middle">Middle (40-60)</option>
            <option value="senior">Senior (60+)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCandidates.slice(0, 100).map((candidate) => {
          const partyColor = getPartyColor(candidate.party, partyColors);
          return (
            <div
              key={candidate.id}
              onClick={() => navigate(`/candidate/${candidate.id}`)}
              className="card p-0 group cursor-pointer hover:border-brand-500/50 transition-all overflow-hidden flex flex-col"
            >
              {/* Top Bar with Party Color */}
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800" style={{ backgroundColor: partyColor }} />

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border dark:border-gray-700 border-gray-200 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-gray-400 group-hover:text-brand-500 transition-colors" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: partyColor }}
                    >
                      {candidate.party}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Age: {candidate.age}</span>
                  </div>
                </div>


                <h3 className="font-display font-bold text-lg dark:text-white text-gray-900 mb-1 group-hover:text-brand-500 transition-colors truncate">
                  {candidate.name}
                </h3>
                <p className="text-gray-500 text-xs font-medium mb-4 flex items-center gap-1">
                  {candidate.constituency} Constituency
                </p>

                <div className="mt-auto pt-4 border-t dark:border-gray-800 border-gray-100 grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">District</span>
                    <span className="text-[11px] font-black dark:text-gray-300 text-gray-700 truncate">{candidate.district}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">Experience</span>
                    <span className="text-[11px] font-black dark:text-gray-300 text-gray-700">
                      {candidate.incumbent ? 'Incumbent' : 'Newcomer'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 dark:bg-gray-800/20 bg-gray-50 flex items-center justify-between group-hover:dark:bg-brand-500/10 group-hover:bg-brand-50 transition-colors">
                <span className="text-[10px] font-black text-gray-500 uppercase group-hover:text-brand-500">View Profile</span>
                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}

      </div>

      {filteredCandidates.length === 0 && (
        <div className="py-20 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-500 font-medium">No candidates found matching your criteria.</p>
        </div>
      )}

      {filteredCandidates.length > 100 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm italic">Showing top 100 results. Use filters to refine your search.</p>
        </div>
      )}
    </div>
  );
}
