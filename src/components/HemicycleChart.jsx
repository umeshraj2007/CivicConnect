import React, { useMemo } from 'react';

/**
 * HemicycleChart - A component to render a dot-based assembly seating chart.
 * @param {Array} data - Array of seat data [{ name, value, fill }]
 * @param {number} totalSeats - Total number of seats (234 for TN)
 */
export default function HemicycleChart({ data, totalSeats = 234 }) {
  const dots = useMemo(() => {
    const result = [];
    let seatIdx = 0;
    
    // Configuration for rows
    const rows = [
      { radius: 100, count: 20 },
      { radius: 125, count: 28 },
      { radius: 150, count: 36 },
      { radius: 175, count: 45 },
      { radius: 200, count: 52 },
      { radius: 225, count: 53 }, // Adjusting last row to match total
    ];

    // Flatten data into a list of colors
    const seatColors = [];
    data.forEach(group => {
      for (let i = 0; i < group.value; i++) {
        seatColors.push(group.fill);
      }
    });

    // Generate dot positions
    rows.forEach(row => {
      for (let i = 0; i < row.count; i++) {
        if (seatIdx >= totalSeats) break;
        
        const angle = 180 + (i / (row.count - 1)) * 180;
        const rad = (angle * Math.PI) / 180;
        const x = row.radius * Math.cos(rad);
        const y = row.radius * Math.sin(rad);
        
        result.push({
          x,
          y,
          fill: seatColors[seatIdx] || '#374151', // Dark gray for empty/remaining
        });
        seatIdx++;
      }
    });

    return result;
  }, [data, totalSeats]);

  return (
    <div className="w-full aspect-[2/1] relative flex items-center justify-center">
      <svg
        viewBox="-250 -250 500 250"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))' }}
      >
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r="6"
            fill={dot.fill}
            className="transition-all duration-700 ease-out animate-pop-in"
            style={{ animationDelay: `${i * 2}ms` }}
          />
        ))}
        
        <text
          x="0"
          y="-30"
          textAnchor="middle"
          className="fill-gray-400 font-display text-[12px] font-bold uppercase tracking-widest"
        >
          Tamil Nadu
        </text>
        <text
          x="0"
          y="0"
          textAnchor="middle"
          className="dark:fill-white fill-gray-900 font-display text-[48px] font-black"
        >
          {totalSeats}
        </text>
      </svg>
    </div>
  );
}
