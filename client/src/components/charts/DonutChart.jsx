import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DEFAULT_COLORS = ['#704A3C', '#704A3C'];

export const DonutChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  colors = DEFAULT_COLORS,
  height = 220,
  centerText,
  centerSubtext,
}) => {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={valueKey}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="85%"
            paddingAngle={4}
            label={false}
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#5E4B43',
              borderColor: '#5E4B43',
              borderRadius: '8px',
              color: '#E8E3DD',
            }}
            itemStyle={{ color: '#E8E3DD' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {centerText && (
        <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-2xl font-bold text-text-primary leading-none">
            {centerText}
          </span>
          {centerSubtext && (
            <span className="text-[10px] text-text-secondary uppercase tracking-wider mt-1.5 font-medium leading-none">
              {centerSubtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
