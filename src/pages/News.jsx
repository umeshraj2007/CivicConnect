import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, ExternalLink, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { fetchNews } from '../utils/newsApi';
import { useAllData } from '../utils/useData';
import { CardSkeleton } from '../components/Skeletons';

// Context: The current active date for this dashboard simulation
const CURRENT_DATE = new Date('2026-04-21');

export default function News() {
  const { upcomingElections } = useAllData();
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const getRelativeTime = (dateStr) => {
    try {
      const now = CURRENT_DATE;
      const then = new Date(dateStr);
      const diffInSeconds = Math.floor((now - then) / 1000);
      
      if (diffInSeconds < 0) return 'Just now';
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return then.toLocaleDateString();
    } catch (e) {
      return 'Recent';
    }
  };

  const loadNews = async (showSync = false) => {
    if (showSync) setIsSyncing(true);
    const data = await fetchNews();
    // Only show political news items
    setHeadlines(data.slice(0, 15));
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setLoading(false);
    setIsSyncing(false);
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(() => loadNews(true), 300000);
    return () => clearInterval(interval);
  }, []);

  const election = upcomingElections?.upcoming_elections_tamil_nadu?.[0];
  const scheduleItems = useMemo(() => {
    if (!election) return [];
    const dates = election.known_dates;
    return [
      { label: 'Notification Date', date: new Date(dates.official_notification), id: 'notif' },
      { label: 'Last Date of Nominations', date: new Date(dates.last_date_nominations), id: 'nom' },
      { label: 'Scrutiny of Nominations', date: new Date(dates.scrutiny_nominations), id: 'scrut' },
      { label: 'Last Date to Withdraw', date: new Date(dates.last_date_withdrawal), id: 'with' },
      { label: 'Polling Date', date: new Date(dates.polling_date), id: 'poll', highlight: true },
      { label: 'Counting of Votes', date: new Date(dates.counting_and_results), id: 'count', highlight: true },
      { label: 'Election Completion', date: new Date(dates.election_completion), id: 'comp' }
    ];
  }, [election]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main News Content */}
        <div className="lg:col-span-8">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
                  <Newspaper className="w-8 h-8 text-brand-500" />
               </div>
               <div>
                  <h1 className="font-display text-4xl font-black dark:text-white text-gray-900 tracking-tight">
                    Political <span className="text-brand-500">Pulse</span>
                  </h1>
                  <p className="dark:text-gray-400 text-gray-500 text-sm font-medium">Simple, unfiltered intelligence from the frontlines.</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Feed Active</span>
              </div>
              {lastUpdated && (
                <span className="text-[10px] uppercase font-bold tracking-widest dark:text-gray-500 text-gray-400">
                  Last Sync: {lastUpdated}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} className="h-40" />)}
            </div>
          ) : (
            <div className="space-y-6">
              {headlines.map((article, i) => (
                <a
                  key={i}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block dark:bg-gray-900 bg-white rounded-3xl border dark:border-gray-800 border-gray-100 p-6 hover:border-brand-500/50 transition-all duration-300 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-brand-500/10 text-brand-500 rounded">
                            {article.category || 'General'}
                          </span>
                          <span className="text-[10px] font-black uppercase text-gray-500 tracking-tight">
                            {article.feedName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{getRelativeTime(article.pubDate)}</span>
                        </div>
                      </div>
                      
                      <h2 className="font-display font-bold text-xl dark:text-white text-gray-900 mb-3 group-hover:text-brand-500 transition-colors leading-tight">
                        {article.title}
                      </h2>
                      
                      {article.description && (
                         <p className="text-sm dark:text-gray-400 text-gray-600 line-clamp-2 italic mb-4 leading-relaxed">
                            {article.description.replace(/<[^>]*>?/gm, '').slice(0, 160)}...
                         </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-brand-500 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                         Read Article <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Official Timeline */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <div className="dark:bg-gray-900 bg-white rounded-3xl border dark:border-gray-800 border-gray-100 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="font-display font-black text-xl dark:text-white text-gray-900 tracking-tight">Election Schedule</h3>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Official Timeline 2026</p>
                 </div>
                 <Calendar className="w-6 h-6 text-brand-500" />
              </div>

              <div className="space-y-0 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />
                
                {scheduleItems.map((item, idx) => {
                  const isPassed = item.date < CURRENT_DATE;
                  const isActive = item.date.toDateString() === CURRENT_DATE.toDateString();
                  const isUpcoming = item.date > CURRENT_DATE;
                  
                  // Calculate days left
                  const diff = Math.ceil((item.date - CURRENT_DATE) / (1000 * 60 * 60 * 24));
                  const daysLeft = diff > 0 ? `${diff} Days` : 'Passed';

                  return (
                    <div key={item.id} className={`relative pl-10 pb-8 last:pb-0 group`}>
                       {/* Node */}
                       <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 dark:border-gray-900 border-white z-10 flex items-center justify-center transition-all ${
                         isPassed ? 'bg-emerald-500' : 
                         isActive ? 'bg-brand-500 scale-125 shadow-lg shadow-brand-500/40' : 
                         'bg-gray-200 dark:bg-gray-800'
                       }`}>
                         {isPassed && <CheckCircle2 className="w-3 h-3 text-white" />}
                       </div>

                       <div className={`transition-all ${isActive ? 'scale-[1.02] origin-left' : ''}`}>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                            isPassed ? 'text-emerald-500' : 
                            isActive ? 'text-brand-500' : 
                            'text-gray-500'
                          }`}>
                            {item.label}
                          </p>
                          <div className="flex items-center justify-between gap-4">
                             <p className={`text-sm font-bold ${isActive ? 'dark:text-white text-gray-900 text-lg' : 'dark:text-gray-300 text-gray-700'}`}>
                                {item.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                             </p>
                             <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                               item.highlight ? 'bg-brand-500/10 text-brand-500' : 
                               isPassed ? 'bg-emerald-500/10 text-emerald-500' :
                               'bg-gray-100 dark:bg-gray-800 text-gray-500'
                             }`}>
                                {isPassed ? 'PASSED' : isActive ? 'ACTIVE TODAY' : daysLeft}
                             </span>
                          </div>
                          {isActive && (
                            <div className="mt-2 text-[10px] font-bold text-brand-500 animate-pulse">
                               Current Milestone Reached
                            </div>
                          )}
                       </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t dark:border-gray-800 border-gray-100">
                 <div className="p-4 rounded-2xl dark:bg-brand-500/5 bg-brand-50 border border-brand-500/10">
                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">Status Report</p>
                    <p className="text-xs dark:text-gray-300 text-gray-700 font-medium leading-relaxed">
                       Currently in the intensive pre-polling phase. Most regulatory hurdles have been cleared.
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
