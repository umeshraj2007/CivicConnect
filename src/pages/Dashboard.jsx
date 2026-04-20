import { useState, useEffect, useMemo } from 'react';
import { useAllData } from '../utils/useData';
import { formatNumber, getPartyColor, getFlagUrl } from '../utils/helpers';
import { fetchNews } from '../utils/newsApi';
import StatCard from '../components/StatCard';
import { CardSkeleton, ChartSkeleton } from '../components/Skeletons';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar
} from 'recharts';
import {
  MapPin, Users, Landmark, Star, UserCheck, Vote, Calendar, Clock, AlertCircle, Newspaper, ExternalLink
} from 'lucide-react';

/* ── Custom tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0].payload;
  return (
    <div className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-200 rounded-xl px-4 py-3 shadow-xl text-sm transition-colors">
      <p className="dark:text-gray-400 text-gray-500 mb-1 transition-colors">{name}</p>
      <p className="font-bold dark:text-white text-gray-900 transition-colors" style={{ color: fill }}>{value} seats</p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-200 rounded-xl px-4 py-3 shadow-xl text-sm transition-colors">
      <p className="dark:text-gray-300 text-gray-700 font-semibold mb-1 transition-colors">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs transition-colors" style={{ color: p.fill }}>
          {p.name}: <span className="font-bold dark:text-white text-gray-900">{formatNumber(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

/* ── Hero banner ─────────────────────────────────────────────── */
function Hero({ cmData }) {
  let currentCM = null;
  let flagUrl = null;

  if (cmData && cmData.chief_ministers_tamil_nadu) {
    const list = cmData.chief_ministers_tamil_nadu;
    currentCM = list[list.length - 1]; // Current CM is generally last in list
    if (currentCM && currentCM.party_name) {
      const match = currentCM.party_name.match(/\(([^)]+)\)/);
      flagUrl = getFlagUrl(match ? match[1] : null);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border dark:border-gray-800 border-gray-100 dark:bg-gray-900 bg-white p-8 mb-8 transition-colors duration-300 shadow-sm">
      {/* Decorative blurs removed for cleaner look */}

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold dark:bg-brand-500/20 bg-brand-50 text-brand-500 dark:text-brand-300 border dark:border-brand-500/30 border-brand-500/20 mb-4 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
            Tamil Nadu Legislative Assembly 2026
          </span>
          <h1 className="font-display text-4xl font-extrabold dark:text-white text-gray-900 mb-2 tracking-tight transition-colors">
            Election Intelligence
            <span className="text-brand-400"> Dashboard</span>
          </h1>
          <p className="dark:text-gray-400 text-gray-600 text-lg max-w-2xl transition-colors">
            Comprehensive analytics for all 234 constituencies — seat projections, historical trends, and party performance data.
          </p>
        </div>

        {currentCM && (
          <div className="dark:bg-gray-800/50 bg-gray-50 border dark:border-gray-700 border-gray-200 rounded-xl p-4 flex items-center gap-4 shrink-0 transition-colors">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-500/50 dark:bg-gray-900 bg-gray-200 shrink-0 transition-colors">
               <div className="w-full h-full flex items-center justify-center text-xl font-bold dark:text-gray-300 text-gray-600 transition-colors">
                 {currentCM.name.charAt(0)}
               </div>
            </div>
            <div>
              <p className="text-xs text-brand-500 dark:text-brand-400 font-semibold mb-0.5 uppercase tracking-wide">Current Chief Minister</p>
              <p className="text-lg font-display font-bold dark:text-white text-gray-900 leading-tight transition-colors">{currentCM.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {flagUrl && <img src={flagUrl} alt="Party Flag" className="w-6 h-4 object-cover rounded-sm border dark:border-gray-700 border-gray-300" />}
                <p className="text-xs dark:text-gray-400 text-gray-500 transition-colors">{currentCM.party_name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Seat projection donut ───────────────────────────────────── */
function AssemblySeatChart({ partyWiseResults, partyColors }) {
  const data = useMemo(() => {
    if (!partyWiseResults) return [];
    // Take Top 8 parties and group others
    const sorted = [...partyWiseResults].sort((a,b) => b.seats - a.seats);
    const top = sorted.slice(0, 8).map(p => ({
        name: p.name,
        value: p.seats,
        fill: getPartyColor(p.name, partyColors)
    }));
    
    if (sorted.length > 8) {
        const othersSeats = sorted.slice(8).reduce((acc, p) => acc + p.seats, 0);
        top.push({ name: 'Others', value: othersSeats, fill: '#607D8B' });
    }
    return top;
  }, [partyWiseResults, partyColors]);

  return (
    <div className="card p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="section-title mb-1">2021 Assembly Share</h3>
        <p className="text-gray-500 text-xs mb-8">Granular seating by party (234 Total)</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-4 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.1)" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t dark:border-gray-800/50 border-gray-100 transition-colors">
        {data.slice(0, 6).map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 rounded-full h-2" style={{ backgroundColor: d.fill }} />
            <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 truncate">{d.name}</span>
            <span className="text-[10px] font-black dark:text-white text-gray-900 ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}




/* ── District electors bar ───────────────────────────────────── */
function DistrictBarChart({ constituencies }) {
  const districtData = useMemo(() => {
    const map = {};
    constituencies.forEach((c) => {
      map[c.district] = (map[c.district] || 0) + c.electors;
    });
    return Object.entries(map)
      .map(([district, electors]) => ({ district: district.slice(0, 8), electors }))
      .sort((a, b) => b.electors - a.electors)
      .slice(0, 15);
  }, [constituencies]);

  return (
    <div className="card p-6">
      <h3 className="section-title mb-1">Electorate by District</h3>
      <p className="text-gray-500 text-xs mb-5">Top 15 districts by total electors</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={districtData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="electGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b5bff" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3b5bff" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:hidden" />
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" className="hidden dark:block" />
          <XAxis dataKey="district" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fill: '#6b7280', fontSize: 10 }} />
          <Tooltip content={<BarTooltip />} cursor={{ fill: '#8884d8', opacity: 0.05 }} />
          <Bar dataKey="electors" name="Electors" fill="url(#electGrad)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Party wins bar ──────────────────────────────────────────── */
function PartyWinsChart({ constituencies, partyColors }) {
  const data = useMemo(() => {
    const map = {};
    constituencies.forEach((c) => {
      if (c.prevWinner) map[c.prevWinner] = (map[c.prevWinner] || 0) + 1;
    });
    return Object.entries(map)
      .map(([party, wins]) => ({
        party,
        wins,
        fill: getPartyColor(party, partyColors),
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);
  }, [constituencies, partyColors]);

  return (
    <div className="card p-6">
      <h3 className="section-title mb-1">2021 Constituency Winners</h3>
      <p className="text-gray-500 text-xs mb-5">Seats won by party (previous election)</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} className="dark:hidden" />
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} className="hidden dark:block" />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis dataKey="party" type="category" width={60} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: '#8884d8', opacity: 0.05 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const { party, wins, fill } = payload[0].payload;
              return (
                <div className="dark:bg-gray-900 bg-white dark:border-gray-700 border-gray-200 rounded-xl px-4 py-3 shadow-xl text-sm transition-colors">
                  <p style={{ color: fill }} className="font-bold">{party}</p>
                  <p className="dark:text-gray-400 text-gray-500 transition-colors">Won <span className="dark:text-white text-gray-900 font-bold transition-colors">{wins}</span> seats</p>
                </div>
              );
            }}
          />
          <Bar dataKey="wins" name="Seats" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Gender breakdown radial ──────────────────────────────────── */
function GenderCard({ constituencies }) {
  const { totalMale, totalFemale, totalThird } = useMemo(() => ({
    totalMale:   constituencies.reduce((s, c) => s + (c.male || 0), 0),
    totalFemale: constituencies.reduce((s, c) => s + (c.female || 0), 0),
    totalThird:  constituencies.reduce((s, c) => s + (c.thirdGender || 0), 0),
  }), [constituencies]);

  const total = totalMale + totalFemale + totalThird;
  const femalePct = ((totalFemale / total) * 100).toFixed(1);

  const radialData = [
    { name: 'Female', value: Math.round((totalFemale / total) * 100), fill: '#ec4899' },
    { name: 'Male',   value: Math.round((totalMale   / total) * 100), fill: '#3b82f6' },
  ];

  return (
    <div className="card p-6">
      <h3 className="section-title mb-1">Voter Demographics</h3>
      <p className="text-gray-500 text-xs mb-4">Gender distribution across all constituencies</p>
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
          <RadialBar background={{ fill: 'transparent' }} dataKey="value" cornerRadius={4}
            label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 700 }} />
          <Legend iconType="circle" iconSize={8}
            formatter={(val) => <span className="dark:text-gray-400 text-gray-600 font-medium text-xs transition-colors">{val}</span>} />
          <Tooltip formatter={(v) => `${v}%`} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3 mt-3">
        {[
          { label: 'Male',        val: formatNumber(totalMale),   color: '#3b82f6' },
          { label: 'Female',      val: formatNumber(totalFemale), color: '#ec4899' },
          { label: 'Third Gender',val: formatNumber(totalThird),  color: '#a78bfa' },
        ].map(({ label, val, color }) => (
          <div key={label} className="text-center p-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border dark:border-transparent border-gray-100 transition-colors">
            <p className="font-bold text-sm" style={{ color }}>{val}</p>
            <p className="dark:text-gray-500 text-gray-400 text-[10px] mt-0.5 uppercase tracking-tighter transition-colors">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Constituency category pie ───────────────────────────────── */
function CategoryChart({ constituencies }) {
  const data = useMemo(() => {
    if (!constituencies) return [];
    const map = {};
    constituencies.forEach((c) => { map[c.category] = (map[c.category] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [constituencies]);

  const COLORS = ['#3b5bff', '#ec4899', '#f59e0b'];

  return (
    <div className="card p-6">
      <h3 className="section-title mb-1">Constituency Category</h3>
      <p className="text-gray-500 text-xs mb-4">General / SC / ST breakdown</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={65} dataKey="value"
            label={({ name, value }) => `${name} (${value})`}
            labelLine={false}
            animationBegin={0} animationDuration={600}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Women candidates ────────────────────────────────────────── */
function WomenCandidatesCard({ parties }) {
  const data = useMemo(() => {
    if (!parties) return [];
    return parties
      .filter((p) => (p.womenCandidates || 0) > 0)
      .map((p) => ({ name: p.short, women: p.womenCandidates, fill: p.color }))
      .sort((a, b) => b.women - a.women);
  }, [parties]);
  const total = data.reduce((s, d) => s + d.women, 0);
  const maxWomen = useMemo(() => {
    if (!data.length) return 1;
    return Math.max(...data.map(d => d.women), 0) || 1;
  }, [data]);

  return (
    <div className="card p-6">
      <h3 className="section-title mb-1">Women Candidates</h3>
      <p className="text-gray-500 text-xs mb-4">By alliance / party</p>
      <p className="text-3xl font-display font-bold text-pink-500/90 mb-4 transition-colors">{total.toLocaleString()}</p>
      <div className="space-y-3">
        {data.map(({ name, women, fill }) => (
          <div key={name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="dark:text-gray-300 text-gray-700 font-medium transition-colors">{name}</span>
              <span className="dark:text-gray-400 text-gray-500 transition-colors">{women}</span>
            </div>
            <div className="h-2 dark:bg-gray-800 bg-gray-100 rounded-full overflow-hidden transition-colors">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(women / maxWomen) * 100}%`, backgroundColor: fill }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Historical Summary ────────────────────────────────────────── */
function HistoricalSummary({ electionHistory }) {
  const recent = useMemo(() => electionHistory?.tamil_nadu_all_elections?.slice(0, 5) || [], [electionHistory]);
  
  if (!recent.length) return null;

  return (
    <div className="card p-6">
      <h3 className="font-display font-semibold dark:text-white text-gray-900 mb-1 transition-colors">Historical Winners</h3>
      <p className="dark:text-gray-500 text-gray-600 text-xs mb-5 transition-colors">Winning alliance & CM (Last 5 elections)</p>
      <div className="space-y-4">
        {recent.map((year, i) => {
          const winnerAbbr = year.party_results[0].abbreviation;
          const flagUrl = getFlagUrl(winnerAbbr);
          return (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <div className="text-sm font-bold text-gray-500 w-8">{year.election_year}</div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-200 leading-tight truncate max-w-[120px]">{year.winning_alliance}</span>
                    <span className="text-[10px] text-gray-500">{year.chief_minister_elected}</span>
                 </div>
              </div>
              {flagUrl && (
                <div className="w-8 flag-container shrink-0">
                   <img src={flagUrl} alt="Flag" />
                </div>
              )}
            </div>

          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t dark:border-gray-800 border-gray-100 transition-colors">
         <a href="/election-results" className="font-sans text-[10px] font-bold dark:text-brand-400 text-brand-600 dark:hover:text-brand-300 hover:text-brand-700 transition-all flex items-center justify-center gap-1 uppercase tracking-widest">
            View Full History →
         </a>
      </div>
    </div>
  );
}

/* ── Upcoming Elections ────────────────────────────────────────── */
function UpcomingElectionsCard({ upcomingElections }) {
  const list = upcomingElections?.upcoming_elections_tamil_nadu || [];
  if (!list.length) return null;

  return (
    <div className="card p-6 overflow-hidden relative">
      {/* Subtle indicator decoration */}
      <div className="absolute top-0 right-0 p-4">
         <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-brand-400" />
         </div>
      </div>
      
      <h3 className="font-display font-semibold dark:text-white text-gray-900 mb-1 transition-colors">Upcoming Schedules</h3>
      <p className="dark:text-gray-500 text-gray-600 text-xs mb-5 transition-colors">Election calendar & critical dates</p>
      
      <div className="space-y-5">
        {list.map((election, i) => (
          <div key={i} className="relative pl-4 border-l-2 dark:border-gray-800 border-gray-100 hover:border-brand-500/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
               <span className={`w-2 h-2 rounded-full ${election.status === 'Currently Ongoing' ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'}`} />
               <h4 className="text-sm font-bold dark:text-gray-200 text-gray-900 transition-colors">{election.election_type}</h4>
            </div>
            <p className="text-[10px] dark:text-gray-500 text-gray-600 mb-2 uppercase font-bold tracking-wide transition-colors">{election.level} Level · {election.expected_year}</p>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
               <div className="dark:bg-gray-950/40 bg-gray-50 p-2 rounded border dark:border-gray-800/50 border-gray-100 transition-colors">
                  <p className="dark:text-gray-500 text-gray-400 mb-0.5 transition-colors">Polling Date</p>
                  <p className="dark:text-white text-gray-900 font-black transition-colors">{election.known_dates.polling_date || election.expected_schedule}</p>
               </div>
               <div className="dark:bg-gray-950/40 bg-gray-50 p-2 rounded border dark:border-gray-800/50 border-gray-100 transition-colors">
                  <p className="dark:text-gray-500 text-gray-400 mb-0.5 transition-colors">Results</p>
                  <p className="dark:text-white text-gray-900 font-black transition-colors">{election.known_dates.counting_and_results || 'TBA'}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Headlines Section ────────────────────────────────────────── */
function HeadlinesSection() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews().then(data => {
      setHeadlines(data.slice(0, 10));
      setLoading(false);
    });
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <Newspaper className="w-5 h-5 text-brand-400" />
           <h3 className="font-display font-semibold text-white">Latest Headlines</h3>
        </div>
         {/* View All link removed as news page was reverted */}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 dark:bg-gray-950/50 bg-gray-50 animate-pulse rounded-xl" />)
        ) : headlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center dark:bg-gray-950/30 bg-gray-50 rounded-xl border border-dashed dark:border-gray-800 border-gray-200 transition-colors">
             <Newspaper className="w-8 h-8 dark:text-gray-700 text-gray-300 mb-2 transition-colors" />
             <p className="text-xs font-bold dark:text-gray-500 text-gray-400 uppercase transition-colors">Unable to load feed</p>
             <p className="text-[10px] dark:text-gray-600 text-gray-400 transition-colors">Please try again later</p>
          </div>
        ) : (
          headlines.map((item, i) => (
            <a 
              key={i} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-3 rounded-xl dark:hover:bg-white/5 hover:bg-gray-100 transition-all group"
            >
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1">
                <p className="text-xs font-bold dark:text-white text-gray-900 leading-snug group-hover:text-brand-500 transition-colors line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{item.feedName?.split(' - ')[0] || 'News'}</span>
                  <span className="text-[9px] text-gray-700">·</span>
                  <span className="text-[9px] text-gray-700">{item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 shrink-0" />
            </a>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Main Dashboard Page ─────────────────────────────────────── */
export default function Dashboard() {
  const { constituencies, parties, partyWiseResults, partyColors, cmData, electionHistory, upcomingElections, loading, error } = useAllData();


  if (error) return (
    <div className="flex items-center justify-center h-64">
        <p className="text-red-500 font-bold mb-2 uppercase tracking-widest text-xs">⚠ Failed to load data</p>
        <p className="dark:text-gray-500 text-gray-600 text-sm">{error}</p>
    </div>
  );

  /* ── Stats ── */
  const totalConstituencies = constituencies?.length || 0;
  const totalElectors       = constituencies?.reduce((s, c) => s + (c.electors || 0), 0) || 0;
  const totalParties        = parties?.length || 0;
  const totalWomen          = parties?.reduce((s, p) => s + (p.womenCandidates || 0), 0) || 0;
  const totalCandidates     = parties?.reduce((s, p) => s + (p.candidates || 0), 0) || 0;
  const totalExisting      = parties?.reduce((s, p) => s + (p.existingSeats || 0), 0) || 0;


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Hero cmData={cmData} />

      {/* KPI stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={MapPin}    label="Constituencies"  value={totalConstituencies} sub="Total seats" color="brand" />
            <StatCard icon={Users}     label="Total Electors"  value={formatNumber(totalElectors)} sub="Registered voters" color="cyan" />
            <StatCard icon={Landmark}  label="Alliances"       value={totalParties} sub="Alliance / Party blocs" color="purple" />
            <StatCard icon={Vote}      label="Candidates"      value={formatNumber(totalCandidates)} sub="Contesting candidates" color="amber" />
            <StatCard icon={UserCheck} label="Women Candidates"value={totalWomen} sub="Across all parties" color="red" />
            <StatCard icon={Star}      label="Existing Seats"  value={totalExisting} sub="2021 Results" color="green" />

          </>
        )}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <><ChartSkeleton height="h-96" /><ChartSkeleton height="h-96" /><ChartSkeleton height="h-96" /></>
        ) : (
          <>
            <AssemblySeatChart partyWiseResults={constituencies && partyWiseResults} partyColors={partyColors} />
            <PartyWinsChart constituencies={constituencies} partyColors={partyColors} />

            <HistoricalSummary electionHistory={electionHistory} />
          </>

        )}
      </div>

      {/* Row with Demographics, etc */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <><ChartSkeleton /><ChartSkeleton /><ChartSkeleton /></>
        ) : (
          <>
            <GenderCard constituencies={constituencies} />
            <UpcomingElectionsCard upcomingElections={upcomingElections} />
            <HeadlinesSection />
          </>
        )}
      </div>

      {/* Full width components */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {loading ? <ChartSkeleton height="h-80" /> : (
          <DistrictBarChart constituencies={constituencies} />
        )}
      </div>
      
      {/* Footer statistics or extra info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <><ChartSkeleton /><ChartSkeleton /></>
        ) : (
          <>
            <WomenCandidatesCard parties={parties} />
            <CategoryChart constituencies={constituencies} />
          </>
        )}
      </div>
    </div>
  );
}
