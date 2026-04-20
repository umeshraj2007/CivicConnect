import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, User, Briefcase, GraduationCap, ShieldAlert, 
  TrendingUp, TrendingDown, MapPin, Landmark, Calendar
} from 'lucide-react';
import { useAllData } from '../utils/useData';
import { getFlagUrl, getPartyColor } from '../utils/helpers';
import { fetchNews } from '../utils/newsApi';
import { CardSkeleton } from '../components/Skeletons';
import { Newspaper, ExternalLink } from 'lucide-react';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, loading, parties, partyColors } = useAllData();
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);


  const candidate = useMemo(() => {
    if (!candidates) return null;
    return candidates.find(c => c.id?.toString() === id?.toString());
  }, [candidates, id]);

  const partyInfo = useMemo(() => {
    if (!candidate || !parties) return null;
    return parties.find(p => p.short === candidate.alliance);
  }, [candidate, parties]);

  const partyColor = useMemo(() => {
    return getPartyColor(candidate?.party, partyColors);
  }, [candidate, partyColors]);

  useEffect(() => {
    if (candidate?.name) {
      setNewsLoading(true);
      fetchNews(candidate.name).then(data => {
        setNews(data.slice(0, 5));
        setNewsLoading(false);
      });
    }
  }, [candidate]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12"><CardSkeleton className="h-screen" /></div>;
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold dark:text-gray-400 text-gray-500 mb-4">Candidate profile not found</h2>
        <button onClick={() => navigate('/candidates')} className="btn btn-primary">Back to Explorer</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back Nav */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-500 font-bold text-sm mb-8 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Return to List
      </button>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] mb-8 group animate-scale-in">
        <div 
          className="absolute inset-0 transition-opacity duration-1000" 
          style={{ 
            background: `linear-gradient(135deg, ${partyColor} 0%, ${partyColor}dd 40%, ${partyColor}22 100%)`,
          }} 
        />
        <div className="absolute inset-0 backdrop-blur-[2px] opacity-30 bg-black/10" />
        
        <div className="relative px-8 py-12 md:py-16 flex flex-col md:flex-row items-center md:items-end gap-8">
           {/* Avatar Container */}
           <div className="relative">
              <div className="w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-xl border-4 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                 {candidate.image ? (
                   <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-20 h-20 text-white/40" />
                 )}
              </div>
              {candidate.incumbent && (
                 <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
                    Incumbent
                 </div>
              )}
           </div>

           {/* Profile Info */}
           <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <span className="px-4 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                    {candidate.party} candidate
                 </span>
                 <span className="px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest">
                    {candidate.constituency}
                 </span>
              </div>
              
              <div>
                 <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
                    {candidate.name}
                 </h1>
                 <p className="text-white/60 font-medium text-lg mt-2 flex items-center justify-center md:justify-start gap-2">
                    Contesting from <span className="text-white font-bold">{candidate.constituencyName}</span> (AC {candidate.acNo})
                 </p>
              </div>

           </div>

           {/* Quick Stats Overlay */}
           <div className="grid grid-cols-2 gap-4 p-6 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10">
              <div className="text-center px-4 border-r border-white/10">
                 <p className="text-[10px] text-white/50 font-bold uppercase mb-1">Age</p>
                 <p className="text-2xl font-black text-white">{candidate.age || '—'}</p>
              </div>
              <div className="text-center px-4">
                 <p className="text-[10px] text-white/50 font-bold uppercase mb-1">Gender</p>
                 <p className="text-2xl font-black text-white">{candidate.gender || '—'}</p>
              </div>
           </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Financials */}
        <div className="space-y-8">
          {/* Quick Stats Card */}
          <div className="card p-6">
            <h3 className="text-sm font-black dark:text-white text-gray-900 border-b dark:border-gray-800 border-gray-100 pb-4 mb-4 uppercase tracking-widest">
              Financial Status
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Total Assets
                </p>
                <p className="text-2xl font-display font-black text-green-500">
                  {candidate.assets || '₹ 0'}
                </p>
              </div>
              <div className="pt-6 border-t dark:border-gray-800 border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Criminal Cases
                </p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-display font-black ${candidate.criminal > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {candidate.criminal || 0}
                  </p>
                  <span className="text-xs font-bold text-gray-500">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="card bg-gray-50 dark:bg-gray-800/30 p-6 border-none">
             <h3 className="text-sm font-black dark:text-white text-gray-900 mb-4 uppercase tracking-widest">Base Territory</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 border-gray-200">
                      <MapPin className="w-4 h-4 text-brand-500" />
                   </div>
                   <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">District</p>
                      <p className="text-sm font-bold dark:text-white text-gray-900">{candidate.district}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 border-gray-200">
                      <Landmark className="w-4 h-4 text-purple-500" />
                   </div>
                   <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Alliance</p>
                      <p className="text-sm font-bold dark:text-white text-gray-900 uppercase">{candidate.alliance}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Profile & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-0 overflow-hidden">
             <div className="flex border-b dark:border-gray-800 border-gray-100">
                <button className="px-8 py-4 text-sm font-black border-b-2 border-brand-500 text-brand-500 dark:bg-white/5 bg-gray-50">Profile Summary</button>
             </div>
             
             <div className="p-8 space-y-10">
                <div>
                   <h4 className="flex items-center gap-2 text-[11px] text-brand-500 font-black uppercase tracking-widest mb-4">
                      <GraduationCap className="w-4 h-4" /> Educational Qualification
                   </h4>
                   <p className="text-lg font-bold dark:text-gray-300 text-gray-800 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-dashed dark:border-gray-700 border-gray-300 italic">
                      {candidate.education || 'Not Specified'}
                   </p>
                </div>

                <div>
                   <h4 className="flex items-center gap-2 text-[11px] text-brand-500 font-black uppercase tracking-widest mb-4">
                      <Briefcase className="w-4 h-4" /> Professional Background
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border dark:border-gray-800 border-gray-100">
                         <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Occupation</p>
                         <p className="font-bold dark:text-white text-gray-900">{candidate.profession || 'Self Employed'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border dark:border-gray-800 border-gray-100">
                         <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status</p>
                         <p className="font-bold dark:text-white text-gray-900">{candidate.incumbent ? 'Active Politician' : 'Contesting Candidate'}</p>
                      </div>
                   </div>
                </div>

                <div>
                   <h4 className="flex items-center gap-2 text-[11px] text-brand-500 font-black uppercase tracking-widest mb-4">
                      <Calendar className="w-4 h-4" /> General Bio
                   </h4>
                   <p className="dark:text-gray-400 text-gray-600 leading-relaxed text-sm">
                      {candidate.bio || `Mr/Ms. ${candidate.name} is a designated candidate from the ${candidate.party || 'Independent'} representing the ${candidate.alliance?.toUpperCase() || 'N/A'} alliance in ${candidate.constituency || 'their constituency'}. Contesting in the current Assembly elections with a focused vision for the constituency's development.`}
                   </p>
                </div>

                {/* News Section */}
                <div className="pt-8 border-t dark:border-gray-800 border-gray-100">
                   <h4 className="flex items-center gap-2 text-[11px] text-brand-500 font-black uppercase tracking-widest mb-4">
                      <Newspaper className="w-4 h-4" /> Latest News & Mentions
                   </h4>
                   <div className="space-y-3">
                      {newsLoading ? (
                         Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 dark:bg-gray-800/50 bg-gray-50 animate-pulse rounded-xl" />)
                      ) : news.length === 0 ? (
                         <div className="p-6 text-center rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed dark:border-gray-800 border-gray-200">
                            <p className="text-xs text-gray-500 italic uppercase font-bold">No recent news found for this candidate</p>
                         </div>
                      ) : (
                         news.map((item, i) => (
                            <a 
                               key={i} 
                               href={item.link} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="flex items-center justify-between p-4 rounded-xl dark:bg-gray-800/40 bg-white border dark:border-gray-800 border-gray-200 hover:border-brand-500/30 transition-all group shadow-sm"
                            >
                               <div className="flex-1 pr-4">
                                  <p className="text-sm font-bold dark:text-gray-200 text-gray-800 line-clamp-1 group-hover:text-brand-400 transition-colors uppercase">{item.title}</p>
                                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">{item.feedName} · {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent'}</p>
                               </div>
                               <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-brand-500 transition-colors" />
                            </a>
                         ))
                      )}
                   </div>
                </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
