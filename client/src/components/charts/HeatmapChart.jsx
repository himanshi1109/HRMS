import React from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

export const HeatmapChart = ({ data = [] }) => {
  // Generate last 16 weeks of data for display to fit nicely on standard dashboards
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 7 * 15)); // 16 weeks ago
  
  const weeks = [];
  let currentDay = startDate;

  // Build a 16-week grid (16 columns, 7 rows)
  for (let w = 0; w < 16; w++) {
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      weekDays.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }
    weeks.push(weekDays);
  }

  // Helper to find count for a day
  const getDayDetails = (day) => {
    const matched = data.find((d) => {
      try {
        const recordDate = typeof d.date === 'string' ? parseISO(d.date) : new Date(d.date);
        return isSameDay(recordDate, day);
      } catch (e) {
        return false;
      }
    });

    const hours = matched ? matched.hours || matched.count || 0 : 0;
    
    // Determine color
    let colorClass = 'bg-[#3D2B26] border border-[#3D2B26]'; // Default empty
    if (hours > 0 && hours <= 4) {
      colorClass = 'bg-indigo-darkest border border-indigo-darkest/60';
    } else if (hours > 4 && hours <= 8) {
      colorClass = 'bg-indigo-brand border border-indigo-brand/60';
    } else if (hours > 8) {
      colorClass = 'bg-teal-steel1 border border-teal-steel1/60';
    }

    return { hours, colorClass };
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-stardust-text uppercase tracking-wide">Work Hours Heatmap</h4>
        <div className="flex items-center gap-1.5 text-xs text-grey-text">
          <span>Less</span>
          <div className="w-3.5 h-3.5 rounded bg-[#3D2B26] border border-[#3D2B26]" />
          <div className="w-3.5 h-3.5 rounded bg-indigo-darkest" />
          <div className="w-3.5 h-3.5 rounded bg-indigo-brand" />
          <div className="w-3.5 h-3.5 rounded bg-teal-steel1" />
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 select-none overflow-x-auto pb-2">
        {/* Day Labels */}
        <div className="grid grid-rows-7 gap-1 text-[10px] text-grey-text pr-1 pt-4 font-medium">
          {dayLabels.map((lbl, idx) => (
            <div key={idx} className="h-3.5 flex items-center justify-end leading-none">
              {idx % 2 !== 0 ? lbl : ''}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-rows-7 gap-1">
              {week.map((day, dIdx) => {
                const { hours, colorClass } = getDayDetails(day);
                const titleText = `${format(day, 'MMM dd, yyyy')}: ${hours} hrs`;
                return (
                  <div
                    key={dIdx}
                    title={titleText}
                    className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 hover:z-10 cursor-pointer ${colorClass}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
