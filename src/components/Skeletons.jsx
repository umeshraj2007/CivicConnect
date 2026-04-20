export function CardSkeleton({ className = '' }) {
  return (
    <div className={`card p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-gray-800 rounded w-2/5 mb-3" />
      <div className="h-7 bg-gray-800 rounded w-3/5 mb-2" />
      <div className="h-2 bg-gray-800 rounded w-4/5" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-10 bg-gray-800/60 border-b border-gray-800" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-3 border-b border-gray-800/50">
          <div className="h-4 bg-gray-800 rounded flex-1" />
          <div className="h-4 bg-gray-800 rounded w-24" />
          <div className="h-4 bg-gray-800 rounded w-20" />
          <div className="h-4 bg-gray-800 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 'h-56' }) {
  return (
    <div className={`card p-5 animate-pulse ${height}`}>
      <div className="h-4 bg-gray-800 rounded w-40 mb-4" />
      <div className="flex items-end gap-2 h-32">
        {[60, 80, 45, 90, 70, 55, 85, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-800 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
