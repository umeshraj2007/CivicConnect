import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, sub, color = 'brand', trend }) {
  const colorMap = {
    brand:  { bg: 'dark:bg-brand-500/10 bg-brand-50',  border: 'dark:border-brand-500/20 border-brand-200',  icon: 'dark:text-brand-400 text-brand-600' },
    red:    { bg: 'dark:bg-red-500/10 bg-red-50',      border: 'dark:border-red-500/20 border-red-200',      icon: 'dark:text-red-400 text-red-600' },
    green:  { bg: 'dark:bg-green-500/10 bg-green-50',  border: 'dark:border-green-500/20 border-green-200',  icon: 'dark:text-green-400 text-green-600' },
    amber:  { bg: 'dark:bg-amber-500/10 bg-amber-50',  border: 'dark:border-amber-500/20 border-amber-200',  icon: 'dark:text-amber-400 text-amber-600' },
    purple: { bg: 'dark:bg-purple-500/10 bg-purple-50', border: 'dark:border-purple-500/20 border-purple-200', icon: 'dark:text-purple-400 text-purple-600' },
    cyan:   { bg: 'dark:bg-cyan-500/10 bg-cyan-50',     border: 'dark:border-cyan-500/20 border-cyan-200',   icon: 'dark:text-cyan-400 text-cyan-600' },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div className={`card-hover p-5 group cursor-default`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
          {Icon && <Icon className={`w-5 h-5 ${c.icon}`} />}
        </div>
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-500'
          }`}>
            {trend > 0  ? <TrendingUp className="w-3 h-3" /> :
             trend < 0  ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="dark:text-gray-400 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="dark:text-gray-500 text-gray-600 text-[10px] mt-1 transition-colors">{sub}</p>}
    </div>
  );
}
