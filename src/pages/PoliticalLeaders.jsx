import { useState, useMemo } from 'react';
import { useAllData } from '../utils/useData';
import { getFlagUrl } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';
import { X, Calendar, GraduationCap, MapPin, Briefcase, Award } from 'lucide-react';

export default function PoliticalLeaders() {
  const { politicalLeaders, leadersBio, loading, error } = useAllData();
  const [selectedLeader, setSelectedLeader] = useState(null);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error || !politicalLeaders) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-400">
        <p>Failed to load Political Leaders data.</p>
      </div>
    );
  }

  // Use the new combined structure
  const leaders = politicalLeaders.tamil_nadu_political_leaders_bio || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold dark:text-white text-gray-900 mb-2 transition-colors">
          Prominent Political Leaders
        </h1>
        <p className="dark:text-gray-400 text-gray-600 transition-colors">Key figures leading major political parties in Tamil Nadu today. Click to see detailed bio-data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {leaders.map((leader, idx) => {
          // Attempt to extract party abbreviation from "Political Party (ABBR)" format.
          const partyMatch = leader.political_party.match(/\(([^)]+)\)/);
          const abbreviation = partyMatch ? partyMatch[1] : '';
          const flagUrl = getFlagUrl(abbreviation);

          return (
            <div 
              key={idx} 
              onClick={() => setSelectedLeader(leader)}
              className="card p-5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer relative overflow-hidden group"
            >
              {/* Subtle background glow effect using flag or subtle color */}
              <div className="absolute -inset-1 bg-gradient-to-br from-brand-500/0 to-brand-500/5 group-hover:to-brand-500/10 transition-colors pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-4 relative">
                {flagUrl ? (
                  <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-700 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-lg">
                    <img src={flagUrl} alt={`${abbreviation} Flag`} className="w-full h-full object-cover rounded-sm" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 shrink-0 flex items-center justify-center shadow-lg">
                    <span className="text-gray-500 text-xs font-bold">{abbreviation}</span>
                  </div>
                )}
                
                <div>
                  <h3 className="font-display font-bold text-lg dark:text-white text-gray-900 leading-tight mb-1 transition-colors">
                    {leader.name}
                  </h3>
                  <p className="text-xs font-bold text-brand-500">{leader.current_position.split(',')[0]}</p>
                </div>
              </div>

              <div className="pt-3 border-t dark:border-gray-800 border-gray-100 transition-colors">
                <p className="text-[10px] dark:text-gray-500 text-gray-400 font-bold uppercase tracking-widest mb-1 transition-colors">Party</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wide dark:text-gray-200 text-gray-900 transition-colors">
                    {abbreviation}
                  </span>
                  <span className="text-xs dark:text-gray-500 text-gray-600 truncate transition-colors" title={leader.political_party}>
                    — {partyNameShortener(leader.political_party)}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-brand-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View Full Bio →
              </div>
            </div>
          );
        })}
      </div>

      {/* Bio Modal */}
      {selectedLeader && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 dark:bg-gray-950/80 bg-gray-900/40 backdrop-blur-md animate-fade-in transition-colors">
          <div className="relative w-full max-w-2xl dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-100 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-800 border-gray-100 flex items-start justify-between transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl dark:bg-brand-600/20 bg-brand-50 border dark:border-brand-500/20 border-brand-200 flex items-center justify-center text-2xl font-black text-brand-400">
                        {selectedLeader.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-black dark:text-white text-gray-900 leading-tight transition-colors">{selectedLeader.full_name}</h2>
                        <p className="text-brand-500 font-bold text-xs tracking-widest uppercase">{selectedLeader.current_position}</p>
                    </div>
                </div>
                <button 
                  onClick={() => setSelectedLeader(null)}
                  className="p-2 dark:hover:bg-white/5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 dark:text-gray-500 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="dark:bg-white/5 bg-gray-50 p-4 rounded-2xl border dark:border-white/5 border-gray-200 transition-colors">
                        <div className="flex items-center gap-2 mb-1 dark:text-gray-500 text-gray-400 font-bold uppercase text-[10px]">
                            <Calendar className="w-3 h-3" /> Date of Birth
                        </div>
                        <p className="dark:text-gray-200 text-gray-900 font-bold">{selectedLeader.dob}</p>
                    </div>
                    <div className="dark:bg-white/5 bg-gray-50 p-4 rounded-2xl border dark:border-white/5 border-gray-200 transition-colors">
                        <div className="flex items-center gap-2 mb-1 dark:text-gray-500 text-gray-400 font-bold uppercase text-[10px]">
                            <MapPin className="w-3 h-3" /> Place of Birth
                        </div>
                        <p className="dark:text-gray-200 text-gray-900 font-bold">{selectedLeader.place_of_birth}</p>
                    </div>
                    <div className="dark:bg-white/5 bg-gray-50 p-4 rounded-2xl border dark:border-white/5 border-gray-200 transition-colors">
                        <div className="flex items-center gap-2 mb-1 dark:text-gray-500 text-gray-400 font-bold uppercase text-[10px]">
                            <GraduationCap className="w-3 h-3" /> Education
                        </div>
                        <p className="dark:text-gray-200 text-gray-900 font-bold text-sm leading-snug">{selectedLeader.education}</p>
                    </div>
                    <div className="dark:bg-white/5 bg-gray-50 p-4 rounded-2xl border dark:border-white/5 border-gray-200 transition-colors">
                        <div className="flex items-center gap-2 mb-1 dark:text-gray-500 text-gray-400 font-bold uppercase text-[10px]">
                            <Briefcase className="w-3 h-3" /> Party
                        </div>
                        <p className="dark:text-gray-200 text-gray-900 font-bold text-sm">{selectedLeader.political_party}</p>
                    </div>
                </div>

                {/* Journey */}
                <div>
                   <h4 className="flex items-center gap-2 text-lg font-display font-black dark:text-white text-gray-950 mb-5 uppercase tracking-tighter transition-colors">
                      <Award className="w-5 h-5 text-brand-500" />
                      Political Journey
                   </h4>
                   <div className="space-y-4 relative pl-4 border-l dark:border-gray-800 border-gray-100 transition-colors">
                      {selectedLeader.political_journey.map((step, i) => (
                          <div key={i} className="relative">
                             <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-4 border-gray-900 shadow-lg shadow-brand-500/20" />
                             <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                {step}
                             </p>
                          </div>
                      ))}
                   </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 dark:bg-gray-950/50 bg-gray-50 border-t dark:border-gray-800 border-gray-100 text-center transition-colors">
                <button 
                  onClick={() => setSelectedLeader(null)}
                  className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-600/20"
                >
                    Close Profile
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to prevent exact long names breaking layout
function partyNameShortener(name) {
  if (name.length > 25) {
    return name.substring(0, 25) + '...';
  }
  return name;
}
