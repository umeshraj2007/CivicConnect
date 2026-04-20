import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Users, BarChart3, Clock, User, 
  MapPin, ShieldCheck, CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { useAllData } from '../utils/useData';
import { formatNumber, getPartyColor } from '../utils/helpers';
import { CardSkeleton } from '../components/Skeletons';


const HistoryTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="dark:bg-gray-900 bg-white border dark:border-gray-700 border-gray-200 rounded-xl px-4 py-3 shadow-xl text-sm min-w-44 transition-colors">
      <p className="text-brand-500 font-bold mb-2">{label} Election</p>
      <p className="dark:text-gray-300 text-gray-700 font-medium">{d.winner}</p>
      <p className="dark:text-gray-500 text-gray-400 text-xs mt-0.5">{d.party}</p>
      <p className="dark:text-white text-gray-900 font-black mt-1">{d.pct}%</p>
    </div>
  );
};

function ConstituencyHistoryChart({ data }) {
  const chartData = useMemo(() => {
    if (!data?.winners) return [];
    return [...data.winners]
      .filter(h => h.pct && h.pct !== 'nan')
      .map(h => ({
        year: h.year,
        winner: h.winner,
        party: h.party,
        value: parseFloat(h.pct),
        pct: h.pct
      }))
      .reverse();
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="w-full h-64 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b5bff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b5bff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip content={<HistoryTooltip />} />
          <ReferenceLine y={50} strokeOpacity={0.3} strokeDasharray="4 4" label={{ value: '50%', fill: '#475569', fontSize: 10 }} />
          <Area type="monotone" dataKey="value" stroke="#3b5bff" strokeWidth={2.5} fill="url(#histGrad)" dot={{ fill: '#3b5bff', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ConstituencyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('2021');

  const { 
    constituencies, history: allHistory, results2021, 
    candidates: allCandidates, competitors, loading, partyColors 
  } = useAllData();

  const constituency = useMemo(() => 
    constituencies?.find(c => c.id.toString() === id), 
    [constituencies, id]
  );

  const result2021 = useMemo(() => 
    results2021?.tamil_nadu_election_results?.find(r => r.ac_no.toString() === id),
    [results2021, id]
  );

  const competitorData = useMemo(() => {
    if (!competitors) return null;
    const feature = competitors.features?.find(f => f.properties.acNo.toString() === id);
    return feature?.properties;
  }, [competitors, id]);

  const candidates2026 = useMemo(() => 
    allCandidates?.filter(c => c.acNo?.toString() === id),
    [allCandidates, id]
  );

  const constituencyHistory = useMemo(() => {
    if (!allHistory) return null;
    // Some formats use array, some use object lookup
    if (Array.isArray(allHistory.constituency_history)) {
      return allHistory.constituency_history.find(h => h.ac_no.toString() === id);
    }
    return allHistory[id];
  }, [allHistory, id]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12"><CardSkeleton className="h-screen" /></div>;
  if (!constituency) return (
    <div className="p-20 text-center flex flex-col items-center">
      <AlertCircle className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
      <p className="font-bold text-gray-500 mb-4">Constituency not found</p>
      <button onClick={() => navigate('/constituencies')} className="btn btn-primary">Back to Explorer</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/constituencies')}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-500 font-bold text-sm mb-6 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Explorer
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                #{constituency.id} AC No.
              </span>
              <span className="px-3 py-1 bg-gray-500/10 text-gray-500 border border-gray-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                {constituency.district} District
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black dark:text-white text-gray-900 leading-tight">
              {constituency.name}
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border dark:border-gray-800 border-gray-100 shadow-sm transition-colors overflow-x-auto whitespace-nowrap">
            {[
              { id: '2021', label: '2021 Results', icon: BarChart3 },
              { id: '2026', label: '2026 Candidates', icon: Users },
              { id: 'history', label: 'Past Winners', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : 'dark:text-gray-400 text-gray-500 hover:dark:bg-white/5 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* ── 2021 Results View ─────────────────────────────────── */}
        {activeTab === '2021' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 card p-8 border-l-8 border-l-brand-500 shadow-xl dark:bg-brand-900/5 bg-brand-50/10 transition-all">
                <div className="flex items-center gap-2 mb-8">
                  <TrendingUp className="w-5 h-5 text-brand-500" />
                  <h3 className="section-title mb-0 tracking-widest">Election Summary 2021</h3>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="w-32 h-32 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center border dark:border-gray-700 border-gray-100 shadow-lg shrink-0 overflow-hidden">
                     <User className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="text-[10px] text-brand-500 font-black uppercase tracking-widest mb-2 inline-block px-3 py-1 bg-brand-500/10 rounded-full">
                       Winning Candidate
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-display font-black dark:text-white text-gray-900 mb-4 uppercase">
                       {result2021?.candidate_name || 'N/A'}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t dark:border-gray-800 border-gray-100">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-extrabold uppercase mb-1">Party</span>
                          <span className="text-lg font-black dark:text-gray-200 text-gray-800">{result2021?.party || '—'}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-extrabold uppercase mb-1">Votes Polled</span>
                          <span className="text-lg font-black dark:text-gray-200 text-gray-800">{formatNumber(result2021?.total_votes)}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-extrabold uppercase mb-1">Share</span>
                          <span className="text-lg font-black text-brand-500">{result2021?.votes_polled_percentage}%</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-8 dark:bg-gray-900/50 bg-white flex flex-col justify-center border-dashed">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Constituency Status</p>
                <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl dark:bg-white/5 bg-gray-50 border dark:border-gray-800 border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black dark:text-white text-gray-800 uppercase italic">Incumbent Held</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Current MLA Seat</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-bold italic opacity-80">
                  "This seat remains a key strategic stronghold in the {constituency.district} district region."
                </p>
              </div>
            </div>

            {/* List of all contestants 2021 */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-display font-black dark:text-white text-gray-900">Election Contestants (2021)</h3>
                    <p className="text-xs text-gray-500 font-medium">Full list of candidates who contested on polling day.</p>
                 </div>
                 <div className="px-4 py-2 rounded-2xl dark:bg-gray-800 bg-gray-100 border dark:border-gray-700 border-gray-200">
                    <span className="text-xs font-black dark:text-white text-gray-900 uppercase">
                      {competitorData?.rawCandidatesData?.length || 0} Total
                    </span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(competitorData?.rawCandidatesData || []).map((comp, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border transition-all h-full flex flex-col justify-between ${
                    comp.name?.includes(result2021?.candidate_name) 
                      ? 'bg-brand-500/10 border-brand-500/40 shadow-lg' 
                      : 'dark:bg-gray-900 bg-white dark:border-gray-800 border-gray-100 hover:border-brand-500/20'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded">
                          {comp.party}
                        </span>
                        {comp.name?.includes(result2021?.candidate_name) && (
                          <CheckCircle className="w-4 h-4 text-brand-500" />
                        )}
                      </div>
                      <h4 className="font-bold text-sm dark:text-white text-gray-900 mb-1">{comp.name}</h4>
                      <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">{comp.alliance?.toUpperCase()} Alliance</p>
                    </div>
                    <div className="mt-4 pt-3 border-t dark:border-gray-800 border-gray-50">
                       <span className="text-[10px] font-bold text-gray-400">Position: {idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 2026 Candidates View ────────────────────────────────── */}
        {activeTab === '2026' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-display font-black dark:text-white text-gray-900 mb-2">Upcoming 2026 Contestants</h2>
                <p className="text-gray-500 text-sm font-medium">Explore the candidates preparing for the 2026 Assembly cycle.</p>
              </div>
              <button 
                onClick={() => navigate('/candidates')}
                className="hidden md:flex items-center gap-2 text-brand-500 hover:text-brand-600 font-black text-xs uppercase"
              >
                Global List <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {candidates2026?.map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/candidate/${c.id}`)}
                  className="card p-6 flex flex-col cursor-pointer hover:border-brand-500/50 hover:shadow-xl transition-all group overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 border-gray-200 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-7 h-7 text-gray-300 dark:text-gray-700" />
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase text-brand-500 bg-brand-500/10 px-2 py-1 rounded-lg">
                         {c.party}
                       </span>
                       <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-tighter">Age: {c.age}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display font-black text-lg dark:text-white text-gray-900 leading-tight group-hover:text-brand-500 transition-colors uppercase truncate">
                      {c.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Certified Candidate</p>
                  </div>
                </div>
              ))}
              
              {(!candidates2026 || candidates2026.length === 0) && (
                <div className="col-span-full py-24 text-center card bg-gray-50/50 dark:bg-gray-900/40 border-dashed animate-pulse">
                  <AlertCircle className="w-12 h-12 text-gray-600 dark:text-gray-700 mx-auto mb-4 opacity-40" />
                  <p className="text-gray-500 font-bold italic tracking-wide">Candidate data for 2026 is currently being finalized.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Historical View ────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="card p-8 mb-8">
              <h3 className="text-xl font-display font-black dark:text-white text-gray-900 mb-2 uppercase tracking-wide">Electoral Victory Timeline</h3>
              <p className="text-xs text-gray-500 font-medium mb-8">Visualizing the historical vote share percentage since 1977.</p>
              <ConstituencyHistoryChart data={constituencyHistory} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                 <Clock className="w-5 h-5 text-gray-500" />
                 <h3 className="section-title mb-0 tracking-widest">Victory Archives</h3>
              </div>
              <div className="card p-0 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="dark:bg-gray-950 bg-gray-100 border-b dark:border-gray-800 border-gray-200">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Election Year</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Elected Member</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Party Bloc</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Vote Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800 divide-gray-100 dark:bg-gray-900/20">
                      {(constituencyHistory?.winners || constituencyHistory?.history || []).map((w, idx) => (
                        <tr key={idx} className="hover:dark:bg-white/5 hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4 font-mono font-black text-sm dark:text-brand-500 text-brand-600">{w.year}</td>
                          <td className="px-8 py-4 font-black text-sm dark:text-white text-gray-900">{w.winner || w.mla}</td>
                          <td className="px-8 py-4">
                             <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full dark:bg-gray-800 bg-gray-100 dark:text-gray-400 text-gray-600">
                               {w.party}
                             </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                             <span className="text-sm font-black dark:text-white text-gray-900">{w.pct}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
