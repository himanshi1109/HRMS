import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendDirection = 'stable',
  accentColor = '#704A3C',
  icon: Icon,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Check if value is a numeric string or number
    const targetValue = parseInt(value, 10);
    if (isNaN(targetValue)) {
      setCount(value);
      return;
    }

    let start = 0;
    const duration = 800; // ms
    const increment = targetValue / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="relative overflow-hidden bg-charcoal-sidebar border border-indigo-border rounded-xl p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-grey-text tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold text-stardust-text mt-2">
            {typeof count === 'number' ? count.toLocaleString() : value}
          </h3>
        </div>
        
        {Icon && (
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 border-t border-indigo-border/30 pt-3">
        {trend && (
          <div className="flex items-center gap-1">
            {trendDirection === 'up' && (
              <span className="flex items-center text-xs font-semibold text-teal-accent">
                <ArrowUpRight size={14} className="mr-0.5" />
                {trend}
              </span>
            )}
            {trendDirection === 'down' && (
              <span className="flex items-center text-xs font-semibold text-badge-absent">
                <ArrowDownRight size={14} className="mr-0.5" />
                {trend}
              </span>
            )}
            {trendDirection === 'stable' && (
              <span className="flex items-center text-xs font-semibold text-grey-text">
                <Minus size={14} className="mr-0.5" />
                {trend}
              </span>
            )}
          </div>
        )}
        <span className="text-xs text-grey-text ml-auto">vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;
