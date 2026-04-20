import { useState, useEffect } from 'react';
import { fetchNews } from '../utils/newsApi';
import { NewsSkeleton } from '../components/Skeletons';
import { ExternalLink, RefreshCcw, Newspaper, Clock } from 'lucide-react';

export default function PoliticsNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    setLoading(true);
    const data = await fetchNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white mb-2 tracking-tight">
            Latest <span className="text-brand-400">Politics News</span>
          </h1>
          <p className="text-gray-400">Live RSS updates from top news organizations covering Tamil Nadu politics.</p>
        </div>
        <button 
          onClick={loadNews}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-all text-sm font-bold w-fit"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-gray-900 animate-pulse rounded-2xl border border-gray-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length === 0 ? (
            <div className="col-span-full py-20 text-center card border-dashed border-gray-700 bg-transparent">
               <Newspaper className="w-12 h-12 text-gray-800 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-gray-500">No news found right now</h3>
               <p className="text-gray-600">Try refreshing the feed in a few moments.</p>
            </div>
          ) : (
            news.map((item, idx) => (
              <a 
                key={idx} 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="card p-6 flex flex-col group hover:border-brand-500/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 px-2 py-1 rounded">
                    {item.feedName?.split(' - ')[0]}
                  </span>
                  <Clock className="w-3 h-3 text-gray-600" />
                </div>
                
                <h3 className="font-display font-bold text-lg text-white mb-3 group-hover:text-brand-300 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-4 leading-relaxed mb-6">
                  {item.description ? String(item.description).replace(/<[^>]*>?/gm, '').substring(0, 150) : 'Stay updated with the latest political developments and election coverage across Tamil Nadu.'}...
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-800/50">
                  <span className="text-xs text-gray-600">
                    {item.pubDate ? new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
